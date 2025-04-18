import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig, useAccount, useConnect, useDisconnect, usePublicClient } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// ---------- CONFIG ----------

const chains = [mainnet, sepolia];
const projectId = "584c6beeca63454f8ec72198811a7969";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient: w3mProvider({ projectId }),
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

// ---------- APP COMPONENT ----------

const PaymentDapp = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const provider = usePublicClient();

  const [paymentHubContract, setPaymentHubContract] = useState(null);
  const [balance, setBalance] = useState(0);

  const contractAddress = "YOUR_CONTRACT_ADDRESS";

  useEffect(() => {
    if (isConnected && provider) {
      const contractABI = [
        "function getBalance() public view returns (uint256)",
        "function sendPayment(address payable to, uint256 amount) public",
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      setPaymentHubContract(contract);
    }
  }, [isConnected, provider]);

  const getBalance = async () => {
    if (paymentHubContract) {
      const contractBalance = await paymentHubContract.getBalance();
      setBalance(ethers.formatEther(contractBalance));
    }
  };

  const sendPayment = async (amount) => {
    if (paymentHubContract && provider) {
      const signer = await provider.getSigner({ account: address });
      const contractWithSigner = paymentHubContract.connect(signer);
      const tx = await contractWithSigner.sendPayment("DESTINATION_ADDRESS", ethers.parseEther(amount));
      await tx.wait();
      alert("Payment successful!");
    }
  };

  return (
    <div className="App">
      <h1>Payment DApp</h1>
      {!isConnected ? (
        <button onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Account: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
          <button onClick={getBalance}>Get Contract Balance</button>
          <p>Contract Balance: {balance} ETH</p>
          <button onClick={() => sendPayment("0.1")}>Send 0.1 ETH</button>
        </div>
      )}
    </div>
  );
};

// ---------- ROOT COMPONENT ----------

const App = () => (
  <WagmiConfig config={wagmiConfig}>
    <PaymentDapp />
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </WagmiConfig>
);

export default App;
