const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TerrabondModule", (m) => {
    const terrabond = m.contract("Terrabond");

    return { terrabond };
});
