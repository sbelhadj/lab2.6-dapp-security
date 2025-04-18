// src/components/TransactionHistory.js
import React, { useState, useEffect } from 'react';
import { listenForPaymentEvents } from '../utils/contract';

const TransactionHistory = ({ provider }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    listenForPaymentEvents(provider, (from, to, amount) => {
      setTransactions((prev) => [
        ...prev,
        { from, to, amount, timestamp: new Date().toISOString() },
      ]);
    });
  }, [provider]);

  return (
    <div className="p-4 bg-gray-200 rounded shadow-md">
      <h2 className="text-xl font-semibold">Transaction History</h2>
      <ul className="space-y-2">
        {transactions.map((tx, index) => (
          <li key={index}>
            <div>
              <strong>From:</strong> {tx.from} <br />
              <strong>To:</strong> {tx.to} <br />
              <strong>Amount:</strong> {tx.amount} ETH <br />
              <strong>Time:</strong> {tx.timestamp} <br />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;