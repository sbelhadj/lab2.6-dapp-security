require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, // Sepolia RPC URL from your .env file
      accounts: [process.env.PRIVATE_KEY, // Private key of your account
      process.env.PRIVATE_KEY_BCT, // Private key of BCT Bank
      process.env.PRIVATE_KEY_AMEN, // Private key of Amen Bank
    ].filter(Boolean), // Prevents undefined keys if any are missing      
    },
  },
};