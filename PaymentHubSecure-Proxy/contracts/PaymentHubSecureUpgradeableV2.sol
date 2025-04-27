// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PaymentHubSecureUpgradeable.sol";

contract PaymentHubSecureUpgradeableV2 is PaymentHubSecureUpgradeable {
    function version() external pure returns (string memory) {
        return "V2";
    }
}