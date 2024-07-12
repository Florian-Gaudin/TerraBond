// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DataConsumerV3.sol";

contract Market is ERC20, Ownable, DataConsumerV3 {
    // token price for ETH
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

    constructor() ERC20("Terrabond Token", "TRB") Ownable(msg.sender) {}

    // Event that log buy operation
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    // Event that logs burn operation
    event BurnTokens(
        address seller,
        uint256 amountOfTokens,
        uint256 amountOfETH
    );

    function mint(address _to, uint256 _amount) external payable {
        int256 ethInDollars = getChainlinkDataFeedLatestAnswer();
        require(ethInDollars > 0, "Invalid price feed value");

        uint256 ethInDollarsUint = uint256(ethInDollars / 10 ** 8);

        uint256 expectedPriceInWei = (PRICE_PER_TOKEN * 1 ether * _amount) /
            ethInDollarsUint;

        console.log("ethInDollars", ethInDollarsUint);
        console.log("expectedPriceInWei", expectedPriceInWei);
        console.log("value provided", msg.value);

        // require(msg.value >= expectedPriceInWei, "Not enough funds provided");
        _mint(_to, _amount * 10 ** 18);

        // emit the event
        emit BuyTokens(_to, msg.value, _amount * 10 ** 18);
    }

    function burn(uint256 _amount) external {
        require(
            balanceOf(msg.sender) >= _amount * 10 ** 18,
            "You don't have enough TRB tokens to sell this amount"
        );

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
