const {time,loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Test Pause", function () {

    // We define a fixture to reuse the same setup in every test.
    async function deployTokenFixture() {  
        // Contracts are deployed using the first signer/account by default
        const [deployer, admin, pauser, minter] = await ethers.getSigners();
        const TokenSRM = await ethers.getContractFactory("TokenSRM");
        const tokenSRM = await TokenSRM.deploy(admin, pauser, minter);
        return { tokenSRM, deployer, admin, pauser, minter };
    }

    it("Only Pauser can pause/unpause contract", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter } = await loadFixture(deployTokenFixture);
    
        // pauser can pause/unpause the contract
        expect(await tokenSRM.hasRole(await tokenSRM.PAUSER_ROLE(), pauser.address)).to.equal(true)
        
        // Pause
        tx = await tokenSRM.connect(pauser).pause();
        await tx.wait();
        expect(await tokenSRM.paused()).to.equal(true)

        // UnPause
        tx = await tokenSRM.connect(pauser).unpause();
        await tx.wait();
        expect(await tokenSRM.paused()).to.equal(false)

        // others cannot pause/unpause the contract
        await expect( tokenSRM.connect(minter).pause() ).to.be.reverted;
        await expect( tokenSRM.connect(deployer).unpause() ).to.be.reverted;
        await expect( tokenSRM.connect(admin).pause() ).to.be.reverted;
    });
});