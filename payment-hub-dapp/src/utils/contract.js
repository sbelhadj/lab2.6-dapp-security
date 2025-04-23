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

const contractAddress = "0xbd5597A160f354276bb6C7fea0c996Df92870627"; // Replace with deployed contract address

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


export const listenForPaymentEvents = async (provider, callback) => {
  const contract = getContract(provider);

  // Define WebSocket provider if using Infura or other services that support WebSocket
  const webSocketProvider = new ethers.WebSocketProvider("wss://sepolia.infura.io/ws/v3/584c6beeca63454f8ec72198811a7969");
  const contractWithWS = new ethers.Contract(contractAddress, paymentHubABI, webSocketProvider);

  // Listen for events
  contractWithWS.on("PaymentSent", (from, to, amount) => {
    callback(from, to, formatEther(amount));
  });

  console.log('WebSocket: Listening for PaymentSent events...');
};