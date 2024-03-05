// SPDX-License-Identifier: MIT
import {ERC20} from "./ERC20.sol";
import {AccessControl} from "./AccessControl.sol";
import {Pausable} from "./Pausable.sol";

pragma solidity ^0.8.20;

contract TokenSRM is ERC20, AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address defaultAdmin, address pauser, address minter)
        ERC20("TokenSRM", "SRM")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20){
        super._update(from, to, value);
    }

}