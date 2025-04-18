// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentHubUnsecure {

    mapping(address => uint256) public balances;
    event PaymentSent(address indexed from, address indexed to, uint256 amount);

    constructor() {}

    // Fonction permettant aux utilisateurs de déposer des fonds dans le contrat
    receive() external payable {
        balances[msg.sender] += msg.value;
    }

    // Fonction pour envoyer des paiements sans vérification de sécurité
    function sendPayment(address payable to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        to.transfer(amount);
        balances[msg.sender] -= amount;

        emit PaymentSent(msg.sender, to, amount);
    }

    // Fonction pour consulter le solde du contrat
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
