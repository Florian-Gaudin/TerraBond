// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Terrabond is ERC20, Ownable {
    constructor() ERC20("Terrabond Token", "TBD") Ownable(msg.sender) {}
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        _mint(msg.sender, msg.value);
    }

    function sellTokens(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Not enough tokens");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    // Function to withdraw Ether from this contract
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
