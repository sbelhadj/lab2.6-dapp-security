import { ethers } from "ethers";
import Web3Modal from "web3modal";

const providerOptions = {};

export const connectWallet = async () => {
    const web3Modal = new Web3Modal({ cacheProvider: true, providerOptions });
    const instance = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(instance); // Updated for ethers v6
    const signer = await provider.getSigner(); // Updated for ethers v6
    const userAddress = await signer.getAddress(); // To get the user's address
    return { provider, signer, userAddress };
};