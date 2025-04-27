import { ethers, upgrades } from "hardhat";

async function main() {
    // Get the signer (deployer) account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);  

    const proxyAddress = process.env.PROXY_ADDRESS!;
    const PaymentHubV2 = await ethers.getContractFactory("PaymentHubSecureUpgradeableV2");

    console.log("Mise à jour du proxy...");
    const upgraded =  await upgrades.upgradeProxy(proxyAddress, PaymentHubV2);
    console.log("PaymentHubSecure upgraded to:", upgraded.target);    
    console.log("Proxy mis à jour avec succès !");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});