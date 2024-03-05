const {time,loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Test Approval / TransferFrom", function () {
    
    // We define a fixture to reuse the same setup in every test.
    async function deployTokenFixture() {  
        // Contracts are deployed using the first signer/account by default
        const [deployer, admin, pauser, minter, user1, user2] = await ethers.getSigners();
        const TokenSRM = await ethers.getContractFactory("TokenSRM");
        const tokenSRM = await TokenSRM.deploy(admin, pauser, minter);
        return { tokenSRM, deployer, admin, pauser, minter, user1, user2};
    }

    it("User can approve token", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter,user1, user2 } = await loadFixture(deployTokenFixture);
        
        expect(await tokenSRM.allowance(user1.address, user2.address)).to.equal(0) // initial Allowance

        // Approve 500 Tokens of User1 to User2
        tx = await tokenSRM.connect(user1).approve(user2, 500 );
        await tx.wait();

        expect(await tokenSRM.allowance(user1.address, user2.address)).to.equal(500) // Final Allowance

    });

 
    it ("User can transfer approved tokens", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter,user1, user2 } = await loadFixture(deployTokenFixture);
        
        expect(await tokenSRM.allowance(user1.address, user2.address)).to.equal(0) // initial Allowance

        // Mint 1000 tokens to user1
        tx = await tokenSRM.connect(minter).mint(user1, 1000 );
        await tx.wait();

        // Approve 500 Tokens of User1 to User2
        tx = await tokenSRM.connect(user1).approve(user2, 500 );
        await tx.wait();

        expect(await tokenSRM.allowance(user1.address, user2.address)).to.equal(500) // Final Allowance

        // Transfer 500 Tokens of User1 by User2 to deployer(say)
        tx = await tokenSRM.connect(user2).transferFrom(user1, deployer.address, 500 );
        await tx.wait();

        expect(await tokenSRM.balanceOf(user1.address)).to.equal(500)
        expect(await tokenSRM.balanceOf(deployer.address)).to.equal(500)
    });

    it ("User cannot transfer more than approved tokens", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter,user1, user2 } = await loadFixture(deployTokenFixture);
        
        expect(await tokenSRM.allowance(user1.address, user2.address)).to.equal(0) // initial Allowance

        // Mint 1000 tokens to user1
        tx = await tokenSRM.connect(minter).mint(user1, 1000 );
        await tx.wait();

        // Approve 500 Tokens of User1 to User2
        tx = await tokenSRM.connect(user1).approve(user2, 500 );
        await tx.wait();

        expect(await tokenSRM.allowance(user1.address, user2.address)).to.equal(500) // Final Allowance

        // Transfer 500 Tokens of User1 by User2 to deployer(say)
        await expect(tokenSRM.connect(user2).transferFrom(user1, deployer.address, 700 )).to.be.reverted;;

    });

});