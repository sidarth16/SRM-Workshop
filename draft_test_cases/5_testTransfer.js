const {time,loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Test Transfer", function () {
    
    // We define a fixture to reuse the same setup in every test.
    async function deployTokenFixture() {  
        // Contracts are deployed using the first signer/account by default
        const [deployer, admin, pauser, minter, user1, user2] = await ethers.getSigners();
        const TokenSRM = await ethers.getContractFactory("TokenSRM");
        const tokenSRM = await TokenSRM.deploy(admin, pauser, minter);
        return { tokenSRM, deployer, admin, pauser, minter, user1, user2};
    }

    it("Transfer updates balance correctly", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter,user1, user2 } = await loadFixture(deployTokenFixture);
        
        expect(await tokenSRM.balanceOf(user1.address)).to.equal(0) // initial balance User1
        expect(await tokenSRM.balanceOf(user2.address)).to.equal(0) // initial balance User2

        // Mint 1000 Tokens to user1
        tx = await tokenSRM.connect(minter).mint(user1, 1000 );
        await tx.wait();
        expect(await tokenSRM.balanceOf(user1.address)).to.equal(1000) // After Mint

        // Transfer 500 Tokens from User1 to User2
        tx = await tokenSRM.connect(user1).transfer(user2, 500 );
        await tx.wait();

        expect(await tokenSRM.balanceOf(user1.address)).to.equal(500) // Final balance User1
        expect(await tokenSRM.balanceOf(user2.address)).to.equal(500) // Final balance User2

    });

    it ("Should not Transfer more than balance", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter,user1, user2 } = await loadFixture(deployTokenFixture);

        // Write your scenario here
        // . . . . . . . . . . . . . . 

    });

    it("Should not Transfer when paused", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter,user1, user2 } = await loadFixture(deployTokenFixture);

        expect(await tokenSRM.balanceOf(user1.address)).to.equal(0) // initial balance User1
        expect(await tokenSRM.balanceOf(user2.address)).to.equal(0) // initial balance User2

        // Write your scenario here
        // . . . . . . . . . . . . . . 

    });

});