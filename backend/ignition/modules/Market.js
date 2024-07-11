const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MarketModule", (m) => {
    const market = m.contract("Market");

    return { market };
});
