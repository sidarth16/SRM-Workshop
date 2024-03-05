const {time,loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Deployment", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployTokenFixture() {  
        // Contracts are deployed using the first signer/account by default
        const [deployer, admin, pauser, minter] = await ethers.getSigners();
        const TokenSRM = await ethers.getContractFactory("TokenSRM");
        const tokenSRM = await TokenSRM.deploy(admin, pauser, minter);
        return { tokenSRM, admin, pauser, minter };
    }

    it("Should set the right Constants", async function () {
        const { tokenSRM } = await loadFixture(deployTokenFixture);
        // console.log(await tokenSRM.getAddress());
        expect(await tokenSRM.DEFAULT_ADMIN_ROLE()).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
        expect(await tokenSRM.PAUSER_ROLE()).to.equal("0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a");
        expect(await tokenSRM.MINTER_ROLE()).to.equal("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6");
    });

});