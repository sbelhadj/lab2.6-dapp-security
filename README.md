# lab2.6-dapp-security
Lab2.6 – Sécuriser un Smart Contract avec OpenZeppelin et Sécurisation de la Front-End ReactJs

Introduction
Dans ce laboratoire, vous apprendrez à sécuriser un smart contract en utilisant OpenZeppelin et à développer une interface front-end sécurisée avec ReactJS et WalletConnect pour interagir avec le smart contract.

Objectifs du Lab
À la fin de ce laboratoire, vous serez capable de :

Utiliser OpenZeppelin pour sécuriser un smart contract.

Déployer un smart contract sécurisé sur un réseau Ethereum.

Créer un front-end React sécurisé pour interagir avec le smart contract via WalletConnect.

Appliquer des bonnes pratiques de sécurité pour éviter les vulnérabilités communes.

Étape 1 : Sécurisation du Smart Contract avec OpenZeppelin
Objectif : Apprendre à sécuriser un smart contract à l’aide d'OpenZeppelin et des bonnes pratiques.

1.1. Initialisation du projet Hardhat
Créez un nouveau projet Hardhat :

Exécutez la commande suivante dans votre terminal :

```bash

mkdir PaymentHubSecure
cd PaymentHubSecure
npm init -y
npm install --save-dev hardhat
npx hardhat
```
Sélectionnez l’option "Create a basic sample project" lorsque Hardhat vous le demande.

1.2. Installer les dépendances OpenZeppelin
Installez les dépendances OpenZeppelin :

```bash
npm install @openzeppelin/contracts @openzeppelin/contracts-upgradeable
```

1.3. Créer le contrat PaymentHubSecure
Créez un fichier PaymentHubSecure.sol dans le répertoire contracts/.

Utilisez le code suivant pour sécuriser votre contrat avec OpenZeppelin :

Le contrat doit inclure des fonctionnalités de Pausable, ReentrancyGuard, Ownable, et AccessControl.


```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PaymentHubSecure is Ownable, ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    mapping(address => uint256) public balances;

    event PaymentSent(address indexed from, address indexed to, uint256 amount);

    constructor() {
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

    function pauseHub() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    function resumeHub() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }
}

```

1.4. Déployer le contrat sur un réseau de test
Créez un script de déploiement dans scripts/deploy.js :

```javascript
// scripts/deploy.js

import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const PaymentHubSecure = await ethers.getContractFactory("PaymentHubSecure");
  const paymentHub = await PaymentHubSecure.deploy();

  await paymentHub.waitForDeployment();

  console.log(`✅ PaymentHubSecure deployed at: ${paymentHub.target}`);
}

main().catch((error) => {
  console.error("Deployment failed ❌:", error);
  process.exit(1);
});

```

Déployez le contrat sur le réseau de test (par exemple, Sepolia) :

bash
Copy
npx hardhat run scripts/deploy.js --network sepolia
Étape 2 : Sécurisation du Front-End React avec WalletConnect
Objectif : Créer une interface front-end sécurisée pour interagir avec le smart contract via WalletConnect.

2.1. Initialisation du projet React
Créez un projet React :

bash
Copy
npx create-react-app payment-dapp
cd payment-dapp
npm install ethers @walletconnect/client
2.2. Implémentation de l’Interface Utilisateur
Créez le fichier App.js et ajoutez le code suivant pour gérer la connexion avec WalletConnect, interagir avec le contrat et afficher les informations pertinentes.

Code :

```jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/client";

const App = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [paymentHubContract, setPaymentHubContract] = useState(null);
  const [balance, setBalance] = useState(0);

  const contractAddress = "VOTRE_ADRESSE_CONTRAT";

  useEffect(() => {
    if (account && provider) {
      const contractABI = [
        "function getBalance() public view returns (uint256)",
        "function sendPayment(address payable to, uint256 amount) public",
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      setPaymentHubContract(contract);
    }
  }, [account, provider]);

  const connectWallet = async () => {
    const provider = new WalletConnectProvider({
      infuraId: "VOTRE_INFURA_ID",
    });

    await provider.enable();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const userAccount = await signer.getAddress();
    setAccount(userAccount);
    setProvider(web3Provider);
  };

  const getBalance = async () => {
    if (paymentHubContract) {
      const contractBalance = await paymentHubContract.getBalance();
      setBalance(ethers.utils.formatEther(contractBalance));
    }
  };

  const sendPayment = async (amount) => {
    if (paymentHubContract) {
      const tx = await paymentHubContract.sendPayment("ADDRESS_DESTINATAIRE", ethers.utils.parseEther(amount));
      await tx.wait();
      alert("Payment successful!");
    }
  };

  return (
    <div className="App">
      <h1>Payment DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <button onClick={getBalance}>Get Contract Balance</button>
          <p>Contract Balance: {balance} ETH</p>
          <button onClick={() => sendPayment("0.1")}>Send 0.1 ETH</button>
        </div>
      )}
    </div>
  );
};

export default App;
```

2.3. Sécurisation du Front-End
Ne jamais exposer la clé privée : Utilisez WalletConnect pour éviter d'exposer des clés privées dans votre application front-end. Le front-end doit seulement interagir avec le portefeuille.

Vérification de l'adresse : Avant d'effectuer des transactions, vérifiez l'adresse de l'utilisateur pour éviter toute interaction malveillante.

Sécurisation de l’interface : Limitez l'accès aux actions sensibles comme les paiements et les retraits aux utilisateurs autorisés.

Bonnes Pratiques de Sécurisation des Smart Contracts et Front-End
1. Sécurisation des Smart Contracts
Utiliser des contrats vérifiés : Ne réinventez pas la roue. Utilisez les contrats standards d'OpenZeppelin, comme Ownable, Pausable, AccessControl, et ReentrancyGuard, qui ont été largement audités.

Protéger contre la réentrance : Utilisez ReentrancyGuard pour éviter les attaques par réentrance lors des transferts de fonds.

Accès limité aux fonctions sensibles : Utilisez AccessControl pour gérer les rôles et garantir que seules les personnes autorisées peuvent appeler des fonctions critiques (par exemple, la mise en pause du contrat).

Arrêt d’urgence (Pause) : Implémentez la fonction Pausable pour mettre le contrat en pause en cas de problème de sécurité ou de maintenance.

2. Sécurisation du Front-End
Ne jamais stocker d’informations sensibles : Ne stockez pas de clés privées ou d'autres informations sensibles dans le front-end ou dans le code source.

Utilisation de WalletConnect ou MetaMask : Ces outils permettent de gérer la connexion au portefeuille de manière sécurisée sans exposer de clés privées.

Validation des transactions : Assurez-vous que l’utilisateur a bien validé la transaction avant d’effectuer un paiement ou un retrait. Utilisez les outils d’alerte ou des confirmations dans l’interface utilisateur.

Protection contre les attaques XSS et CSRF : Veillez à protéger votre application contre les attaques de type cross-site scripting (XSS) et cross-site request forgery (CSRF).

Conclusion
Ce laboratoire vous a permis d'apprendre à sécuriser un smart contract en utilisant OpenZeppelin et à créer un front-end React sécurisé pour interagir avec ce contrat via WalletConnect. Vous avez appris à appliquer des bonnes pratiques pour assurer la sécurité de votre contrat Ethereum ainsi que de l'interface utilisateur.

Avancement et TODO pour l'étudiant :
Étape 1 : Sécuriser le Smart Contract

 Initialiser le projet Hardhat.

 Installer les dépendances OpenZeppelin.

 Créer le contrat PaymentHubSecure.sol.

 Déployer le contrat sur un réseau de test.

Étape 2 : Créer l'Interface Front-End

 Initialiser un projet React.

 Créer le composant React pour interagir avec le contrat.

 Implémenter la connexion via WalletConnect.

 Tester la connexion et l'interaction avec le contrat.

Sécurisation

 Vérifier les bonnes pratiques de sécurité pour le smart contract.

 Tester et sécuriser le front-end React.



 Voici une version non sécurisée du smart contract PaymentHubSecure.sol. Cette version ne comporte pas les protections offertes par les bibliothèques OpenZeppelin telles que Ownable, ReentrancyGuard, Pausable, et AccessControl. Cela expose le contrat à plusieurs vulnérabilités communes, telles que des attaques par réentrance, l'absence de contrôle sur les fonctions sensibles, et des problèmes potentiels de gestion des fonds.

Version Non Sécurisée du Smart Contract

```solidity
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
        balances[msg.sender] -= amount;
        to.transfer(amount);

        emit PaymentSent(msg.sender, to, amount);
    }

    // Fonction pour consulter le solde du contrat
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```
Explications sur les Vulnérabilités et Absences de Sécurisation
Absence de protection contre les attaques par réentrance :

Le contrat ne possède pas la protection ReentrancyGuard. Cela signifie qu'un attaquant pourrait effectuer une attaque par réentrance en réappelant la fonction sendPayment() avant que le solde de l'utilisateur ne soit mis à jour, entraînant ainsi une possibilité de retrait de fonds indéfini.

Solution : Utilisez ReentrancyGuard pour éviter ce genre de vulnérabilité.

Absence de contrôle d'accès :

Il n'y a aucun contrôle sur les fonctions sensibles. N'importe qui peut appeler la fonction sendPayment() et effectuer un paiement à partir de son propre solde, ce qui peut être acceptable dans un cas simple, mais risqué si des permissions sont nécessaires.

Solution : Implémentez Ownable ou AccessControl pour restreindre l'accès à certaines fonctions.

Pas de mécanisme de pause (Pausable) :

Le contrat ne dispose pas de mécanisme permettant de le mettre en pause, ce qui est essentiel pour les cas où une vulnérabilité est découverte ou si des opérations doivent être interrompues temporairement.

Solution : Utilisez Pausable d'OpenZeppelin pour mettre le contrat en pause si nécessaire.

Aucune gestion des rôles pour les administrateurs :

Il n'y a pas de gestion des rôles, ce qui signifie que tout le monde a le droit de retirer des fonds ou de modifier le contrat. Cela n'est pas sécurisé pour des cas de production où des rôles spécifiques sont nécessaires (par exemple, un rôle d'administrateur ou d'opérateur).

Solution : Utilisez AccessControl ou Ownable pour gérer l'accès.

Gestion des fonds uniquement basée sur l'adresse :

Les paiements sont effectués simplement en soustrayant des fonds du solde de l'utilisateur. Il est nécessaire d'avoir une gestion des accès plus robuste pour éviter les erreurs et protéger les fonds des utilisateurs.

Risques de cette Version Non Sécurisée
Attaque par réentrance : Cela pourrait permettre à un attaquant de retirer plus de fonds que prévu en réentrant dans la fonction de retrait avant qu'elle ne termine.

Absence de contrôle d'accès : N'importe quel utilisateur peut retirer de l'argent sans aucune restriction. Ce manque de contrôle expose le contrat à de potentielles attaques ou des erreurs.

Impossible de mettre le contrat en pause : En cas de vulnérabilité découverte dans le contrat, il ne serait pas possible de le suspendre, ce qui pourrait permettre à un attaquant de continuer à exploiter une faille.

Risque de gestion de fonds incorrecte : Sans une protection adéquate des fonds, des erreurs ou des abus peuvent facilement se produire, comme un utilisateur envoyant plus d'argent qu'il n'en a ou un administrateur effectuant une action malveillante.

Conclusion
Cette version non sécurisée du smart contract sert principalement à illustrer les problèmes de sécurité courants dans les contrats Ethereum. Il est essentiel de suivre les bonnes pratiques et de sécuriser le contrat avec des outils comme OpenZeppelin pour protéger les utilisateurs et les fonds.


Voici une version non sécurisée du front-end React qui interagit avec le smart contract. Cette version ne contient pas de vérifications adéquates ni de protections pour la gestion des erreurs, des transactions ou de la sécurité en général.

Version Non Sécurisée du Front-End React
Créez un fichier App.js dans votre projet React avec le code suivant. Cette version ne prend pas en compte certaines pratiques de sécurité comme la validation des adresses, la gestion des erreurs ou la confirmation des transactions avant leur exécution.

```jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const App = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [paymentHubContract, setPaymentHubContract] = useState(null);
  const [balance, setBalance] = useState(0);

  const contractAddress = "VOTRE_ADRESSE_CONTRAT";  // Remplacez par l'adresse de votre contrat déployé

  useEffect(() => {
    if (account && provider) {
      const contractABI = [
        "function getBalance() public view returns (uint256)",
        "function sendPayment(address payable to, uint256 amount) public",
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      setPaymentHubContract(contract);
    }
  }, [account, provider]);

  // Fonction pour connecter le portefeuille
  const connectWallet = async () => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = web3Provider.getSigner();
      const userAccount = await signer.getAddress();
      setAccount(userAccount);
      setProvider(web3Provider);
    } else {
      alert("Please install MetaMask or another wallet.");
    }
  };

  // Fonction pour récupérer le solde du contrat
  const getBalance = async () => {
    if (paymentHubContract) {
      const contractBalance = await paymentHubContract.getBalance();
      setBalance(ethers.utils.formatEther(contractBalance));
    }
  };

  // Fonction pour envoyer des paiements
  const sendPayment = async (amount) => {
    if (paymentHubContract) {
      const tx = await paymentHubContract.sendPayment(
        "ADDRESS_DESTINATAIRE",  // L'adresse de destination pour le paiement
        ethers.utils.parseEther(amount)
      );
      await tx.wait();
      alert("Payment sent!");
    }
  };

  return (
    <div className="App">
      <h1>Payment DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <button onClick={getBalance}>Get Contract Balance</button>
          <p>Contract Balance: {balance} ETH</p>
          <button onClick={() => sendPayment("0.1")}>Send 0.1 ETH</button>
        </div>
      )}
    </div>
  );
};

export default App;
```

Explications sur les Vulnérabilités et Absences de Sécurisation
Absence de validation des entrées :

Aucune validation n'est effectuée sur l'adresse de destination pour les paiements. L'adresse ADDRESS_DESTINATAIRE est hardcodée dans le code, ce qui rend le contrat vulnérable à une utilisation malveillante.

Solution : Ajouter des validations pour l'adresse de destination (vérifier si l'adresse est valide avant d'effectuer une transaction).

Aucune gestion des erreurs :

Le code ne gère pas les erreurs potentielles comme les problèmes de connexion au portefeuille, des erreurs dans la transaction, ou des problèmes lors de la récupération du solde. Si une erreur se produit, l'utilisateur ne reçoit aucune information claire.

Solution : Ajouter des blocs try-catch pour intercepter et gérer les erreurs de manière appropriée. Afficher un message d'erreur en cas d'échec de la transaction ou de la connexion.

Absence de confirmation de la transaction :

Lors de l'envoi de fonds, l'application ne demande pas de confirmation avant d'exécuter la transaction. L'utilisateur peut accidentellement envoyer de l'argent sans validation explicite.

Solution : Afficher une fenêtre de confirmation avant de soumettre une transaction afin que l'utilisateur puisse vérifier les détails avant l'exécution.

Aucune gestion des changements d'adresse :

Le contrat ne prend pas en compte le changement d'adresse du portefeuille. Si l'utilisateur change de compte ou de réseau, cela peut entraîner des erreurs non gérées.

Solution : Implémenter un mécanisme pour gérer les changements d'adresse et informer l'utilisateur si son portefeuille est déconnecté ou s'il change de réseau.

Vulnérabilité en cas de portefeuille non sécurisé :

Si l'utilisateur se connecte avec un portefeuille non sécurisé ou avec des autorisations insuffisantes, l'application peut effectuer des transactions à son insu.

Solution : Vérifiez toujours que le portefeuille est valide et sécurisé avant d'effectuer des transactions.

Pas de gestion de la déconnexion :

Il n'y a pas de fonctionnalité pour déconnecter le portefeuille ou réinitialiser l'état de l'application, ce qui pourrait poser des problèmes si l'utilisateur veut se reconnecter avec un autre compte.

Solution : Ajouter un bouton de déconnexion et réinitialiser l'état de l'application en cas de changement de compte.

Améliorations possibles pour sécuriser le front-end
Validation des Entrées Utilisateur : Avant d'envoyer des paiements, validez soigneusement l'adresse et le montant pour vous assurer qu'ils sont corrects et sûrs.

Gestion des erreurs : Utilisez un bloc try-catch pour gérer les erreurs lors de la connexion au portefeuille ou de l'envoi des paiements. Affichez des messages d'erreur clairs et appropriés à l'utilisateur.

Fenêtre de Confirmation pour les Transactions : Demandez à l'utilisateur de confirmer avant d'envoyer un paiement, notamment en affichant les détails de la transaction (adresse, montant, etc.).

Suivi de l'État du Portefeuille : Ajoutez des vérifications pour détecter les changements d'adresse ou de réseau et informez l'utilisateur si ces changements sont détectés.

Sécurisation de la Connexion : Implémentez une logique pour vérifier que l'utilisateur est bien connecté avec un portefeuille valide et sécurisé. Vous pouvez également envisager d'utiliser des solutions comme MetaMask pour des connexions plus sûres.

Conclusion
Cette version non sécurisée du front-end React illustre les risques et les vulnérabilités qui peuvent survenir lorsque la validation, la gestion des erreurs et la sécurité ne sont pas correctement implémentées. Il est essentiel de prendre en compte ces aspects pour garantir une application sûre et fiable, notamment lorsqu'il s'agit de manipuler des fonds numériques.


