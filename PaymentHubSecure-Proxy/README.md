# Tutoriel Complet : Rendre PaymentHubSecure Upgradeable avec le Proxy UUPS

---

## 1. Phase de Smart Contract : Adapter PaymentHubSecure pour UUPS

Nous allons :
- Hériter de `UUPSUpgradeable`, `OwnableUpgradeable`, etc.
- Remplacer le `constructor` par une fonction `initialize()`.
- Utiliser `__Ownable_init()`, `__ReentrancyGuard_init()`, etc.
- Implémenter `_authorizeUpgrade()` pour sécuriser l'upgrade.

### Version adaptée du contrat

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PaymentHubSecureUpgradeable is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    mapping(address => uint256) public balances;

    event PaymentSent(address indexed from, address indexed to, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event WithdrawAll(address indexed user, uint256 amount);

    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(OPERATOR_ROLE, initialOwner);
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
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No balance to withdraw");

        payable(owner()).transfer(contractBalance);

        emit WithdrawAll(owner(), contractBalance);
    }

    function pauseHub() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    function resumeHub() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
```

---

## 2. Phase d'Implémentation : Configuration du Projet

Installez les dépendances :

```bash
npm install --save-dev hardhat @openzeppelin/hardhat-upgrades @openzeppelin/contracts-upgradeable @openzeppelin/contracts ethers dotenv
```

---

## 3. Phase de Déploiement : Script deploy.ts

Créer `scripts/deploy.ts` :

```typescript
import { ethers, upgrades } from "hardhat";

async function main() {
    const PaymentHub = await ethers.getContractFactory("PaymentHubSecureUpgradeable");
    const paymentHub = await upgrades.deployProxy(PaymentHub, [process.env.INITIAL_OWNER_ADDRESS], {
        initializer: "initialize",
    });

    await paymentHub.waitForDeployment();
    console.log(`Proxy déployé à : ${await paymentHub.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

---

## 4. Phase de Tests Unitaires : Test du Contrat

Créer `test/PaymentHubSecureUpgradeable.ts` :

```typescript
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("PaymentHubSecureUpgradeable", function () {
    let paymentHub: any;
    let owner: any;
    let user1: any;
    let user2: any;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const PaymentHub = await ethers.getContractFactory("PaymentHubSecureUpgradeable");
        paymentHub = await upgrades.deployProxy(PaymentHub, [owner.address], { initializer: "initialize" });
    });

    it("devrait s'initialiser correctement", async function () {
        expect(await paymentHub.owner()).to.equal(owner.address);
    });

    it("devrait permettre un dépôt et mettre à jour le solde", async function () {
        await paymentHub.connect(user1).deposit({ value: ethers.parseEther("1") });
        expect(await paymentHub.balances(user1.address)).to.equal(ethers.parseEther("1"));
    });

    it("devrait permettre un envoi de paiement", async function () {
        await paymentHub.connect(user1).deposit({ value: ethers.parseEther("2") });
        await paymentHub.connect(user1).sendPayment(user2.address, ethers.parseEther("1"));
        expect(await paymentHub.balances(user1.address)).to.equal(ethers.parseEther("1"));
    });

    it("devrait permettre un retrait utilisateur", async function () {
        await paymentHub.connect(user1).deposit({ value: ethers.parseEther("1") });
        await paymentHub.connect(user1).withdraw(ethers.parseEther("1"));
        expect(await paymentHub.balances(user1.address)).to.equal(0);
    });

    it("devrait seulement permettre à l'opérateur de suspendre", async function () {
        await expect(paymentHub.connect(user1).pauseHub()).to.be.reverted;
        await expect(paymentHub.connect(owner).pauseHub()).to.not.be.reverted;
    });

    it("devrait permettre un upgrade du contrat", async function () {
        const PaymentHubV2 = await ethers.getContractFactory("PaymentHubSecureUpgradeable");
        await upgrades.upgradeProxy(await paymentHub.getAddress(), PaymentHubV2);
    });
});
```

---

## 5. Vérification sur Etherscan

Après déploiement :

```bash
npx hardhat verify --network sepolia ADRESSE_IMPLEMENTATION
```

---

# Simulation d'un Upgrade de Contrat (V2)

---

## 1. Nouveau Contrat PaymentHubSecureUpgradeableV2

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PaymentHubSecureUpgradeable.sol";

contract PaymentHubSecureUpgradeableV2 is PaymentHubSecureUpgradeable {
    function version() external pure returns (string memory) {
        return "V2";
    }
}
```

---

## 2. Script d'Upgrade : upgrade.ts

```typescript
import { ethers, upgrades } from "hardhat";

async function main() {
    const proxyAddress = process.env.PROXY_ADDRESS!;
    const PaymentHubV2 = await ethers.getContractFactory("PaymentHubSecureUpgradeableV2");

    console.log("Mise à jour du proxy...");
    await upgrades.upgradeProxy(proxyAddress, PaymentHubV2);
    console.log("Proxy mis à jour avec succès !");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

---

## 3. Test de l'Upgrade

```typescript
it("devrait upgrader vers V2 et retourner la bonne version", async function () {
    const PaymentHubV2 = await ethers.getContractFactory("PaymentHubSecureUpgradeableV2");
    const upgraded = await upgrades.upgradeProxy(await paymentHub.getAddress(), PaymentHubV2);

    expect(await upgraded.version()).to.equal("V2");
});
```

---

# 📦 Structure du Projet
```yaml
contracts/
  PaymentHubSecureUpgradeable.sol
  PaymentHubSecureUpgradeableV2.sol

scripts/ 
  deploy.ts 
  upgrade.ts 

test/ 
  PaymentHubSecureUpgradeable.ts 

hardhat.config.ts 
.env
```

---

# 🎯 Checklist Finale

✅ Déploiement de V1  
✅ Script d'upgrade fonctionnel  
✅ Nouvelle fonction version() disponible  
✅ Proxy reste à la même adresse  
✅ Balances intactes

---
