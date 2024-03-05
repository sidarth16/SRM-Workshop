const {time,loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
  
describe("Test Roles", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployTokenFixture() {  
        // Contracts are deployed using the first signer/account by default
        const [deployer, admin, pauser, minter] = await ethers.getSigners();
        const TokenSRM = await ethers.getContractFactory("TokenSRM");
        const tokenSRM = await TokenSRM.deploy(admin, pauser, minter);
        return { tokenSRM, deployer, admin, pauser, minter };
    }

    it("Roles are set as defined during deployment", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter } = await loadFixture(deployTokenFixture);
        expect(await tokenSRM.hasRole(await tokenSRM.DEFAULT_ADMIN_ROLE(), admin.address)).to.equal(true)
        expect(await tokenSRM.hasRole(await tokenSRM.DEFAULT_ADMIN_ROLE(), minter.address)).to.equal(false)
    
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), minter.address)).to.equal(true)
        expect(await tokenSRM.hasRole(await tokenSRM.MINTER_ROLE(), deployer.address)).to.equal(false)
    
        expect(await tokenSRM.hasRole(await tokenSRM.PAUSER_ROLE(), pauser.address)).to.equal(true)
        expect(await tokenSRM.hasRole(await tokenSRM.PAUSER_ROLE(), admin.address)).to.equal(false)
    });

    it("Only Admin Role [ Revoke roles ] ", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter } = await loadFixture(deployTokenFixture);

        // pauser.address : has existing pauser role
        expect(await tokenSRM.hasRole(await tokenSRM.PAUSER_ROLE(), pauser.address)).to.equal(true)
    
        // 'Revoking' the Pauser role from: pauser.address
        tx = await tokenSRM.connect(admin).revokeRole(await tokenSRM.PAUSER_ROLE(), pauser.address);
        await tx.wait();
    
        // pauser role revoked
        expect(await tokenSRM.hasRole(await tokenSRM.PAUSER_ROLE(), pauser.address)).to.equal(false)  
        
        // pauser.address:  now cannot pause the contract as no pauser role
        await expect( tokenSRM.connect(pauser).pause() ).to.be.reverted;
        
        // Only admin can revoke roles 
        await expect(tokenSRM.connect(deployer).revokeRole(await tokenSRM.MINTER_ROLE(), minter.address))
        .to.be.reverted;
    
    });
    
    it("Only Admin Role [ Grant roles ] ", async function () {
        const {  tokenSRM, deployer, admin, pauser, minter } = await loadFixture(deployTokenFixture);
    
        // Admin makes deployer as the new pauser: (  deployer --[Admin Grants]> Pauser Role )
    
        //  deployer has no role of pauser
        expect(await tokenSRM.hasRole(await tokenSRM.PAUSER_ROLE(), deployer.address)).to.equal(false);
    
        // 'Granting' the Pauser role to: user3.address
        tx = await tokenSRM.connect(admin).grantRole(await tokenSRM.PAUSER_ROLE(), deployer.address);
        await tx.wait();
    
        // pauser role granted
        expect(await tokenSRM.hasRole(await tokenSRM.PAUSER_ROLE(), deployer.address)).to.equal(true);
        
        // pauser.address:  can now pause the contract as he has pauser role
        tx = await tokenSRM.connect(deployer).pause() ;
        await tx.wait();
        
        // Only Admin can Grant roles 
        await expect(tokenSRM.connect(pauser).grantRole(await tokenSRM.MINTER_ROLE(), pauser.address))
        .to.be.reverted;
        
    });

});