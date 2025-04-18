import { ethers } from 'ethers';  // Update this line
import { formatEther, parseEther } from 'ethers';  // Add this line for utils


// ABI for PaymentHubSecure contract (simplified for interaction)
const paymentHubABI = [
  "function deposit() external payable",
  "function sendPayment(address payable to, uint256 amount) external",
  "function pauseHub() external",
  "function resumeHub() external",
  "event PaymentSent(address indexed from, address indexed to, uint256 amount)",
];

const contractAddress = "<Your_Contract_Address>"; // Replace with deployed contract address

// Function to get contract instance
export const getContract = (provider) => {
  return new ethers.Contract(contractAddress, paymentHubABI, provider);  // ethers.js v6
};

// Deposit function
export const deposit = async (signer, amount) => {
  const contract = getContract(signer);
  const tx = await contract.deposit({ value: parseEther(amount) });
  await tx.wait();
};

// Send payment function
export const sendPayment = async (signer, to, amount) => {
  const contract = getContract(signer);
  const tx = await contract.sendPayment(to, parseEther(amount));
  await tx.wait();
};

// Pause the hub function
export const pauseHub = async (signer) => {
  const contract = getContract(signer);
  const tx = await contract.pauseHub();
  await tx.wait(); 
};

// Resume the hub function
export const resumeHub = async (signer) => {
  const contract = getContract(signer);
  const tx = await contract.resumeHub();
  await tx.wait();
};

// Listen for PaymentSent events
export const listenForPaymentEvents = (provider, callback) => {
  const contract = getContract(provider);
  contract.on("PaymentSent", (from, to, amount) => {
    callback(from, to, formatEther(amount));  // ethers.js v6
  });
};
