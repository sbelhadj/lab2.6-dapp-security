// src/components/PaymentForm.js
import React, { useState } from 'react';
import { sendPayment } from '../utils/contract';

const PaymentForm = ({ signer }) => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendPayment = async () => {
    setLoading(true);
    try {
      await sendPayment(signer, toAddress, amount);
      alert(`Payment of ${amount} ETH sent to ${toAddress}`);
    } catch (error) {
      alert("Failed to send payment!");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-200 rounded shadow-md">
      <h2 className="text-xl font-semibold">Send Payment</h2>
      <input
        type="text"
        className="mt-2 p-2 w-full border border-gray-300 rounded"
        placeholder="Recipient Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
      />
      <input
        type="number"
        className="mt-2 p-2 w-full border border-gray-300 rounded"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handleSendPayment}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        disabled={loading || !toAddress || !amount}
      >
        {loading ? "Sending..." : "Send Payment"}
      </button>
    </div>
  );
};

export default PaymentForm;
