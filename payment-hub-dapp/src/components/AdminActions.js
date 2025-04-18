// src/components/AdminActions.js
import React, { useState } from 'react';
import { pauseHub, resumeHub } from '../utils/contract';

const AdminActions = ({ signer }) => {
  const [loading, setLoading] = useState(false);

  const handlePause = async () => {
    setLoading(true);
    try {
      await pauseHub(signer);
      alert("Hub paused successfully!");
    } catch (error) {
      alert("Failed to pause hub!");
    }
    setLoading(false);
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      await resumeHub(signer);
      alert("Hub resumed successfully!");
    } catch (error) {
      alert("Failed to resume hub!");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-200 rounded shadow-md">
      <h2 className="text-xl font-semibold">Admin Actions</h2>
      <button
        onClick={handlePause}
        className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Pausing..." : "Pause Hub"}
      </button>
      <button
        onClick={handleResume}
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Resuming..." : "Resume Hub"}
      </button>
    </div>
  );
};

export default AdminActions;
