// src/components/DepositForm.js
import React, { useState } from 'react';
import { deposit } from '../utils/contract';

const DepositForm = ({ signer }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    try {
      await deposit(signer, amount);
      alert(`Deposited ${amount} ETH successfully!`);
    } catch (error) {
      alert("Failed to deposit!");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-200 rounded shadow-md">
      <h2 className="text-xl font-semibold">Deposit Funds</h2>
      <input
        type="number"
        className="mt-2 p-2 w-full border border-gray-300 rounded"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handleDeposit}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        disabled={loading || !amount}
      >
        {loading ? "Depositing..." : "Deposit"}
      </button>
    </div>
  );
};

export default DepositForm;
