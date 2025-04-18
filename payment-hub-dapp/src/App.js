import React, { useState, useEffect } from 'react';
import WalletConnection from './components/WalletConnection';
import DepositForm from './components/DepositForm';
import PaymentForm from './components/PaymentForm';
import AdminActions from './components/AdminActions';
import Notification from './components/Notification';
import TransactionHistory from './components/TransactionHistory';
import { connectWallet } from './utils/wallet';

const App = () => {
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [provider, setProvider] = useState(null);

  // Function to update provider and signer when wallet is connected
  const handleWalletConnect = async () => {
    const { provider, signer, userAddress } = await connectWallet();
    setSigner(signer);
    setUserAddress(userAddress);
    setProvider(provider);
  };

  useEffect(() => {
    if (signer) {
      // Set up any additional logic if needed when wallet is connected
      console.log("Wallet connected: ", userAddress);
    }
  }, [signer, userAddress]);

  return (
    <div className="App">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Payment Hub DApp</h1>

        {/* Wallet Connection */}
        <WalletConnection setSigner={setSigner} setUserAddress={setUserAddress} />

        {/* Only show these components when the wallet is connected */}
        {signer && (
          <>
            <div className="mt-6">
              <DepositForm signer={signer} />
            </div>

            <div className="mt-6">
              <PaymentForm signer={signer} />
            </div>

            <div className="mt-6">
              <AdminActions signer={signer} />
            </div>

            <div className="mt-6">
              <TransactionHistory provider={provider} />
            </div>
          </>
        )}
      </div>

      {/* Notification Container */}
      <Notification />
    </div>
  );
};

export default App;