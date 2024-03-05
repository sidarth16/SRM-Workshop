const {time,loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Test Mint", function () {
    
    // We define a fixture to reuse the same setup in every test.
    async function deployTokenFixture() {  
        // Contracts are deployed using the first signer/account by default
        const [deployer, admin, pauser, minter, user] = await ethers.getSigners();
        const TokenSRM = await ethers.getContractFactory("TokenSRM");
        const tokenSRM = await TokenSRM.deploy(admin, pauser, minter);
        return { tokenSRM, deployer, admin, pauser, minter, user};
    }

    it("Only Minter can mint Tokens", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter, user } = await loadFixture(deployTokenFixture);
        
        // Confirming Minter role
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), minter.address)).to.equal(true)
        
        // Mint 1000 Tokens (By Minter)
        await tokenSRM.connect(minter).mint(user, 1000 );

        // others cannot mint Tokens
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), user.address)).to.equal(false)
        await expect(tokenSRM.connect(user).mint(user, 1000 ) ).to.be.reverted;
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), deployer.address)).to.equal(false)
        await expect(tokenSRM.connect(deployer).mint(deployer, 1000 ) ).to.be.reverted;
    });

    it ("Token balance correctly updated", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter, user } = await loadFixture(deployTokenFixture);

        // Confirming Minter role
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), minter.address)).to.equal(true)
    
        // Mint 1000 Tokens (By Minter)
        expect(await tokenSRM.balanceOf(user.address)).to.equal(0) // initial balance
        tx = await tokenSRM.connect(minter).mint(user, 1000 );
        await tx.wait();
        expect(await tokenSRM.balanceOf(user.address)).to.equal(1000) // balance after minting
 
    });

    it ("Total Supply correctly updated", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter, user } = await loadFixture(deployTokenFixture);

        // Confirming Minter role
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), minter.address)).to.equal(true)
    
        // Mint 1000 Tokens (By Minter)
        expect(await tokenSRM.totalSupply()).to.equal(0) // initial balance
        tx = await tokenSRM.connect(minter).mint(user, 1000 );
        await tx.wait();
        expect(await tokenSRM.totalSupply()).to.equal(1000) // balance after minting
 
    });

    it("Cannot Mint when paused", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter, user } = await loadFixture(deployTokenFixture);
        
        // Pausing the contract
        expect(await tokenSRM.paused()).to.equal(false) // unpaused initially
        tx = await tokenSRM.connect(pauser).pause();
        await tx.wait();
        expect(await tokenSRM.paused()).to.equal(true) // paused

        // Confirming Minter role
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), minter.address)).to.equal(true)
        
        // Mint 1000 Tokens (By Minter)
        await expect(tokenSRM.connect(minter).mint(user, 1000 ) ).to.be.reverted;
    });

});