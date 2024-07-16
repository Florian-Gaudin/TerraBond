// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DataConsumerV3.sol";

contract Market is ERC20, Ownable, DataConsumerV3 {
    uint256 private constant PRICE_PER_TOKEN = 100; // in dollars
    uint256 public constant MAX_SELL_AMOUNT = 50; // in tokens
    uint256 public constant SECONDS_IN_A_DAY = 86400;

    // Struct to store the amount sold and the timestamp of the last sale
    struct SaleData {
        uint256 amountSold;
        uint256 lastSaleTimestamp;
    }

    // Mapping to store the sale data for each address
    mapping(address => SaleData) private sales;

    // Struct to store OTC offers
    struct Offer {
        uint256 offerId;
        address seller;
        uint256 amount;
        bool isActive;
    }

    uint256 public offerCount = 0;
    mapping(uint256 => Offer) public offers;

    // Events
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event BurnTokens(
        address seller,
        uint256 amountOfTokens,
        uint256 amountOfETH
    );
    event OfferCreated(
        uint256 indexed offerId,
        address indexed seller,
        uint256 amount
    );
    event OfferAccepted(uint256 indexed offerId, address indexed buyer);
    event OfferCancelled(uint256 indexed offerId, address indexed seller);

    constructor() ERC20("Terrabond Token", "TRB") Ownable(msg.sender) {}

    function mint(address _to, uint256 _amount) external payable {
        int256 ethInDollars = getChainlinkDataFeedLatestAnswer();
        require(ethInDollars > 0, "Invalid price feed value");

        uint256 ethInDollarsUint = uint256(ethInDollars / 10 ** 8);

        uint256 priceInEth = (PRICE_PER_TOKEN * 1 ether * _amount) /
            ethInDollarsUint;

        require(msg.sender.balance >= priceInEth, "Insufficient ETH balance");

        // Mint the tokens to the buyer
        _mint(_to, _amount * 10 ** 18);

        emit BuyTokens(_to, msg.value, _amount * 10 ** 18);
    }

    function burn(uint256 _amount) external {
        require(
            balanceOf(msg.sender) >= _amount * 10 ** 18,
            "You don't have enough TRB tokens to sell this amount"
        );

        if (_amount <= MAX_SELL_AMOUNT) {
            // Check if the address has sold more than the daily limit
            SaleData storage saleData = sales[msg.sender];
            uint256 currentTime = block.timestamp;

            if (currentTime - saleData.lastSaleTimestamp >= SECONDS_IN_A_DAY) {
                // Reset the amount sold if a day has passed
                saleData.amountSold = 0;
            }

            uint256 remainingAmount = MAX_SELL_AMOUNT - saleData.amountSold;

            require(
                saleData.amountSold + _amount <= MAX_SELL_AMOUNT,
                string(
                    abi.encodePacked(
                        "Sale exceeds the maximum allowed daily limit of 50 tokens. You can sell ",
                        uint2str(remainingAmount),
                        " tokens."
                    )
                )
            );

            saleData.amountSold += _amount;
            saleData.lastSaleTimestamp = currentTime;

            int256 ethInDollars = getChainlinkDataFeedLatestAnswer();
            require(ethInDollars > 0, "Invalid price feed value");

            uint256 ethInDollarsUint = uint256(ethInDollars / 10 ** 8);

            uint256 ethToReturn = (_amount * 1 ether * PRICE_PER_TOKEN) /
                ethInDollarsUint;
            require(
                address(this).balance >= ethToReturn,
                "Not enough ETH in contract"
            );

            _burn(msg.sender, _amount * 10 ** 18);
            payable(msg.sender).transfer(ethToReturn);

            emit BurnTokens(msg.sender, _amount * 10 ** 18, ethToReturn);
        } else {
            // Create an offer on the OTC market
            createOffer(_amount);
        }
    }

    // Function to get all active OTC offers
    function getAllOffers() external view returns (Offer[] memory) {
        Offer[] memory allOffers = new Offer[](offerCount);
        for (uint256 i = 0; i < offerCount; i++) {
            if (offers[i].isActive) {
                allOffers[i] = offers[i];
            }
        }
        return allOffers;
    }

    // Create an OTC offer
    function createOffer(uint256 _amount) public {
        require(
            _amount > MAX_SELL_AMOUNT,
            "Amount must be greater than 50 TRB"
        );
        require(
            balanceOf(msg.sender) >= _amount * 10 ** 18,
            "You don't have enough TRB tokens to sell this amount"
        );

        offers[offerCount] = Offer({
            offerId: offerCount,
            seller: msg.sender,
            amount: _amount,
            isActive: true
        });

        emit OfferCreated(offerCount, msg.sender, _amount);
        offerCount++;
    }

    // Accept an OTC offer
    function acceptOffer(uint256 _offerId) external payable {
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");

        int256 ethInDollars = getChainlinkDataFeedLatestAnswer();
        require(ethInDollars > 0, "Invalid price feed value");

        uint256 ethInDollarsUint = uint256(ethInDollars) / 10 ** 8;
        uint256 priceInEth = (offer.amount * PRICE_PER_TOKEN * 1 ether) /
            ethInDollarsUint;

        // Check balance & transfer ETH from buyer to contract
        require(msg.sender.balance >= priceInEth, "Insufficient ETH balance");

        // Burn the TRB tokens from the seller & mint the TRB for the buyer
        _burn(offer.seller, offer.amount * 10 ** 18);
        _mint(msg.sender, offer.amount * 10 ** 18);

        offer.isActive = false;

        // Transfer ETH to the seller
        (bool sentToSeller, ) = payable(offer.seller).call{value: msg.value}(
            ""
        );
        require(sentToSeller, "Failed to send ETH to the seller");

        emit OfferAccepted(_offerId, msg.sender);
    }

    // Cancel an OTC offer
    function cancelOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(
            offer.seller == msg.sender,
            "Only the seller can cancel the offer"
        );

        offer.isActive = false;

        emit OfferCancelled(_offerId, offer.seller);
    }

    // Allow contract to receive ETH
    receive() external payable {}

    // Helper function to convert uint256 to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
