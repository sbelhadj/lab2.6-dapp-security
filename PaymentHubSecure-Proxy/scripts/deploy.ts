import { ethers, upgrades } from "hardhat";

async function main() {
    // Get the signer (deployer) account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);  
      
    const PaymentHub = await ethers.getContractFactory("PaymentHubSecureUpgradeable");
    const paymentHub = await upgrades.deployProxy(PaymentHub, [deployer.address], {
        initializer: "initialize",
    });

    await paymentHub.waitForDeployment();
    console.log(`Proxy déployé à : ${await paymentHub.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});