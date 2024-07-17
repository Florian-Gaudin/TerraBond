// const {
//     loadFixture,
// } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { expect, assert } = require("chai");
// const hre = require("hardhat");

// describe("Market Tests", function () {
//     // We define a fixture to reuse the same setup in every test.
//     // We use loadFixture to run this setup once, snapshot that state,
//     // and reset Hardhat Network to that snapshot in every test.
//     async function deployFixture() {
//         // Contracts are deployed using the first signer/account by default
//         const [owner, otherAccount] = await hre.ethers.getSigners();

//         const Market = await hre.ethers.getContractFactory("Market");
//         const market = await Market.deploy();

//         return { market, owner, otherAccount };
//     }

//     describe("Deployment", function () {
//         it("Should deploy the contract and get the right price for 1 ETH", async function () {
//             const { market, owner, otherAccount } = await loadFixture(
//                 deployFixture
//             );
//             const ethPriceFromChainlink =
//                 await market.getChainlinkDataFeedLatestAnswer();
//             const ethInDollars = hre.ethers.formatUnits(
//                 ethPriceFromChainlink,
//                 8
//             );
//             assert(
//                 parseInt(ethInDollars) >= 1500 && parseInt(ethInDollars) <= 5000
//             );
//         });
//     });

//     describe("Mint", function () {
//         it("Should NOT mint if not enough funds are provided", async function () {
//             const { market, owner, otherAccount } = await loadFixture(
//                 deployFixture
//             );
//             const ethPriceFromChainlink =
//                 await market.getChainlinkDataFeedLatestAnswer();
//             const ethInDollars = hre.ethers.formatUnits(
//                 ethPriceFromChainlink,
//                 8
//             );
//             const amountMint = 18;
//             const amountEthFor18Tokens =
//                 (100 * amountMint) / parseInt(ethInDollars);
//             const priceFor18Tokens = hre.ethers.parseEther(
//                 amountEthFor18Tokens.toString()
//             );
//             console.log(priceFor18Tokens);
//             await expect(
//                 market.mint(owner.address, 20, { value: priceFor18Tokens })
//             ).to.be.revertedWith("Not enough funds provided");
//         });

//         it("Should mint if enough funds are provided", async function () {
//             const { market, owner, otherAccount } = await loadFixture(
//                 deployFixture
//             );
//             const ethPriceFromChainlink =
//                 await market.getChainlinkDataFeedLatestAnswer();
//             const ethInDollars = hre.ethers.formatUnits(
//                 ethPriceFromChainlink,
//                 8
//             );
//             const amountMint = 20;
//             const amountEthFor20Tokens =
//                 (101 * amountMint) / parseInt(ethInDollars);
//             const priceFor20Tokens = hre.ethers.parseEther(
//                 amountEthFor20Tokens.toString()
//             );
//             console.log(priceFor20Tokens);
//             await market.mint(owner.address, 20, { value: priceFor20Tokens });
//             const balanceOfOwner = await market.balanceOf(owner.address);
//             assert(Number(balanceOfOwner) === 20);
//         });
//     });
// });

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect, assert } = require("chai");
const hre = require("hardhat");

describe("Market Tests", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const Market = await hre.ethers.getContractFactory("Market");
        const market = await Market.deploy();

        return { market, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy the contract and get the right price for 1 ETH", async function () {
            const { market } = await loadFixture(deployFixture);
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );
            assert(
                parseInt(ethInDollars) >= 1500 && parseInt(ethInDollars) <= 5000
            );
        });
    });

    describe("Mint", function () {
        it("Should NOT mint if not enough funds are provided", async function () {
            const { market, owner } = await loadFixture(deployFixture);
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );

            const amountMint = 18; // Change this to a value that makes the amount insufficient for minting 30 tokens
            const amountEthFor18Tokens =
                (100 * amountMint) / parseInt(ethInDollars);
            const priceFor18Tokens = hre.ethers.parseEther(
                amountEthFor18Tokens.toFixed(18)
            );

            console.log("Price for 18 tokens:", priceFor18Tokens.toString());

            const amountMintForTest = 30;
            const amountEthFor30Tokens =
                (100 * amountMintForTest) / parseInt(ethInDollars);
            const priceFor30Tokens = hre.ethers.parseEther(
                amountEthFor30Tokens.toFixed(18)
            );

            console.log("Price for 30 tokens:", priceFor30Tokens.toString());

            // Check if the price for 18 tokens is indeed less than the required price for 30 tokens
            assert(
                priceFor18Tokens < priceFor30Tokens,
                "Calculated ETH is not insufficient as expected for minting 30 tokens"
            );

            await expect(
                market.mint(owner.address, amountMintForTest, {
                    value: priceFor18Tokens,
                })
            ).to.be.revertedWith("Insufficient ETH balance");
        });

        it("Should mint if enough funds are provided", async function () {
            const { market, owner } = await loadFixture(deployFixture);
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );
            const amountMint = 20;
            const amountEthFor20Tokens =
                (100 * amountMint) / parseInt(ethInDollars);
            const priceFor20Tokens = hre.ethers.parseEther(
                amountEthFor20Tokens.toString()
            );
            await market.mint(owner.address, 20, { value: priceFor20Tokens });
            const balanceOfOwner = await market.balanceOf(owner.address);
            assert(Number(balanceOfOwner) === 20 * 10 ** 18);
        });
    });

    describe("Burn", function () {
        it("Should burn tokens correctly", async function () {
            const { market, owner } = await loadFixture(deployFixture);
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );

            const amountMint = 10;
            const amountEthFor10Tokens =
                (100 * amountMint) / parseInt(ethInDollars);
            const priceFor10Tokens = hre.ethers.parseEther(
                amountEthFor10Tokens.toString()
            );
            await market.mint(owner.address, amountMint, {
                value: priceFor10Tokens,
            });

            await market.burn(5);
            const balanceOfOwner = await market.balanceOf(owner.address);
            assert(Number(balanceOfOwner) === 5 * 10 ** 18);
        });

        it("Should fail if trying to burn more than balance", async function () {
            const { market, owner } = await loadFixture(deployFixture);
            await expect(market.burn(1)).to.be.revertedWith(
                "You don't have enough TRB tokens to sell this amount"
            );
        });

        it("Should fail if trying to burn more than allowed daily limit", async function () {
            const { market, owner } = await loadFixture(deployFixture);
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );
            const amountMint = 100;
            const amountEthFor100Tokens =
                (100 * amountMint) / parseInt(ethInDollars);
            const priceFor100Tokens = hre.ethers.parseEther(
                amountEthFor100Tokens.toFixed(18)
            );
            await market.mint(owner.address, amountMint, {
                value: priceFor100Tokens,
            });
            await expect(market.burn(60)).to.be.revertedWith(
                "Sale exceeds the maximum allowed daily limit of 50 tokens. You can sell 50 tokens."
            );
        });
    });

    describe("OTC Offers", function () {
        it("Should create and accept an OTC offer", async function () {
            const { market, owner, otherAccount } = await loadFixture(
                deployFixture
            );
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );
            const amountMint = 100;
            const amountEthFor100Tokens =
                (100 * amountMint) / parseInt(ethInDollars);
            const priceFor100Tokens = hre.ethers.parseEther(
                amountEthFor100Tokens.toFixed(18)
            );
            await market.mint(owner.address, amountMint, {
                value: priceFor100Tokens,
            });
            const amountToOffer = 60;
            await market.createOffer(amountToOffer);
            const offer = await market.offers(0);
            expect(offer.seller).to.equal(owner.address);
            expect(offer.amount).to.equal(amountToOffer);
            expect(offer.isActive).to.be.true;
            const priceInEthForOffer = hre.ethers.parseEther(
                ((amountToOffer * 100) / parseInt(ethInDollars)).toFixed(18)
            );
            await market
                .connect(otherAccount)
                .acceptOffer(0, { value: priceInEthForOffer });
            const newOffer = await market.offers(0);
            expect(newOffer.isActive).to.be.false;
        });

        it("Should fail to accept an inactive OTC offer", async function () {
            const { market, otherAccount } = await loadFixture(deployFixture);
            await expect(
                market.connect(otherAccount).acceptOffer(0)
            ).to.be.revertedWith("Offer is not active");
        });

        it("Should cancel an OTC offer", async function () {
            const { market, owner } = await loadFixture(deployFixture);
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );
            const amountMint = 100;
            const amountEthFor100Tokens =
                (100 * amountMint) / parseInt(ethInDollars);
            const priceFor100Tokens = hre.ethers.parseEther(
                amountEthFor100Tokens.toFixed(18)
            );
            await market.mint(owner.address, amountMint, {
                value: priceFor100Tokens,
            });
            const amountToOffer = 60;
            await market.createOffer(amountToOffer);
            await market.cancelOffer(0);
            const offer = await market.offers(0);
            expect(offer.isActive).to.be.false;
        });
    });

    describe("getAllOffers", function () {
        it("Should return all active offers", async function () {
            const { market, owner } = await loadFixture(deployFixture);
            const ethPriceFromChainlink =
                await market.getChainlinkDataFeedLatestAnswer();
            const ethInDollars = hre.ethers.formatUnits(
                ethPriceFromChainlink,
                8
            );
            const amountMint = 100;
            const amountEthFor100Tokens =
                (100 * amountMint) / parseInt(ethInDollars);
            const priceFor100Tokens = hre.ethers.parseEther(
                amountEthFor100Tokens.toFixed(18)
            );
            await market.mint(owner.address, amountMint, {
                value: priceFor100Tokens,
            });
            await market.createOffer(60);
            await market.createOffer(40);
            const offers = await market.getAllOffers();
            expect(offers.length).to.equal(2);
            expect(offers[0].isActive).to.be.true;
            expect(offers[1].isActive).to.be.true;
        });
    });
});
