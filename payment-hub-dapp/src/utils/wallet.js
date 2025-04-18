import { ethers } from 'ethers';


import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

// Function to connect wallet
export const connectWallet = async () => {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          80001: "https://rpc-mumbai.maticvigil.com",  // Polygon Testnet
          11155111: "https://rpc.sepolia.org",  // Sepolia Testnet
        },
      },
    },
  };

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });

  const instance = await web3Modal.connect();
  //const provider = new ethers.providers.Web3Provider(instance);  // ethers.js v6
  const provider = new ethers.JsonRpcProvider(instance);
  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();  // To get the user's address

  return { provider, signer, userAddress };
};