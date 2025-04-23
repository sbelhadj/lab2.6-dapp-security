// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PaymentHubSecure is Ownable, ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    mapping(address => uint256) public balances;

    event PaymentSent(address indexed from, address indexed to, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event WithdrawAll(address indexed user, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    function deposit() external payable whenNotPaused {
        balances[msg.sender] += msg.value;
    }

    function sendPayment(address payable to, uint256 amount)
        external
        nonReentrant
        whenNotPaused
    {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        to.transfer(amount);

        emit PaymentSent(msg.sender, to, amount);
    }

    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        emit Withdraw(msg.sender, amount);
    }

    function withdrawAll() external nonReentrant whenNotPaused {
        uint256 contractBalance = address(this).balance; // Get the contract's balance
        require(contractBalance > 0, "No balance to withdraw"); // Ensure the contract has funds

        payable(owner()).transfer(contractBalance); // Transfer all funds to the owner

        emit WithdrawAll(owner(), contractBalance); // Emit the event with the owner's address and amount
    }

    function pauseHub() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    function resumeHub() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }
}
