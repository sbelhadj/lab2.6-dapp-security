// scripts/deploy.js
// npx hardhat run scripts/deploy.js --network sepolia

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Convert balance from Wei to ETH
  const balanceInEth = ethers.formatEther(await deployer.provider.getBalance(deployer.address));
  console.log("Account balance:", balanceInEth, "ETH");

  const PaymentHubSecure = await ethers.getContractFactory("PaymentHubSecure");
  const paymentHub = await PaymentHubSecure.deploy(deployer.address);

  await paymentHub.waitForDeployment();

  console.log(`✅ PaymentHubSecure deployed at: ${paymentHub.target}`);
}

main().catch((error) => {
  console.error("Deployment failed ❌:", error);
  process.exit(1);
});
