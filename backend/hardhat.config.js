require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    networks: {
        hardhat: {
            forking: {
                url: "https://mainnet.infura.io/v3/f011d4e9ab574624b2b6669bdb799f0a",
                blockNumber: 20321770,
            },
        },
    },
};
