// src/components/WalletConnection.js
import React, { useState } from 'react';
import { connectWallet } from '../utils/wallet';

const WalletConnection = ({ setSigner, setUserAddress }) => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { signer, userAddress } = await connectWallet();
      setSigner(signer);
      setUserAddress(userAddress);
      setWalletAddress(userAddress);
    } catch (error) {
      alert("Failed to connect wallet!");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-200 rounded shadow-md">
      <h2 className="text-xl font-semibold">Connect Wallet</h2>
      {walletAddress ? (
        <div>
          <p className="text-sm">Connected: {walletAddress}</p>
        </div>
      ) : (
        <button 
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={handleConnect} 
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
};

export default WalletConnection;
