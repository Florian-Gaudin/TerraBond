// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DataConsumerV3.sol";

contract Market is ERC20, Ownable, DataConsumerV3 {
    // token price for ETH
    uint256 private constant PRICE_PER_TOKEN = 100; // in dollars
    constructor() ERC20("Terrabond Token", "TRB") Ownable(msg.sender) {}

    // Event that log buy operation
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

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
}
