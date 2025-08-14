require("dotenv").config(); // Loads environment variables from .env file
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Connects to Ethereum node
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Signs transactions
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
  throw new Error(
    "Missing required environment variables: RPC_URL or PRIVATE_KEY."
  );
}

const insuranceFundABI = [
  // Defines interface for interacting with the contract
  "function publishedAgreementHash(bytes32 agreementHash) external",
  "event SignedAgreementPublished(address indexed sender, bytes32 indexed agreementHash)",
];
const insuranceFundAddress = "0x1aFDCa298d9502dd3df043368DAFF452cCc80Ea4"; // Replace with deployed contract address
const insuranceFund = new ethers.Contract(
  insuranceFundAddress,
  insuranceFundABI,
  wallet
);

// Function to trigger claimPayout() & registerPayout()
async function triggerClaimPayout(agreementHash) {
  try {
    console.log("Input agreementHash:", agreementHash); // Debug log
    console.log("Input type:", typeof agreementHash); // Debug log
    console.log("Input length:", agreementHash.length); // Debug log
    // NEW - This just ensures proper formatting with '0x' prefix
    const bytes32Hash = agreementHash.startsWith("0x")
      ? agreementHash
      : "0x" + agreementHash;

    console.log("Formatted hash:", bytes32Hash); // Debug log

    const registerTx = await insuranceFund.publishedAgreementHash(bytes32Hash);

    await registerTx.wait();
    return {
      status: "success",
      message: "Payout processed",
      txHash: registerTx.hash,
    };
  } catch (error) {
    console.error("Error triggering payout:", error);
    return {
      status: "error",
      message: "Transaction failed",
      details: error.message,
    };
  }
}

module.exports = { triggerClaimPayout };

/*
require("dotenv").config(); // Loads environment variables from .env file
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Connects to Ethereum node
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Signs transactions
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
    throw new Error("Missing required environment variables: RPC_URL or PRIVATE_KEY.");
}

const insuranceFundABI = [ // Defines interface for interacting with the contract
  "function registerPayout(address insured, uint256 amount) external",
  "function claimPayout(address insured) external",
];
const insuranceFundAddress = '0x811D1d73E6fae55f5f47B704b4102d5c7FD92903'; // Replace with deployed contract address
const insuranceFund = new ethers.Contract(
  insuranceFundAddress,
  insuranceFundABI,
  wallet
);

// Function to trigger claimPayout() & registerPayout()
async function triggerClaimPayout(insuredAddress, payoutAmount) {
  try {
    const registerTx = await insuranceFund.registerPayout(insuredAddress, payoutAmount);
    await registerTx.wait();
    const tx = await insuranceFund.claimPayout(insuredAddress);
    await tx.wait();
    return { status: "success", message: "Payout processed", txHash: tx.hash };
  } catch (error) {
    console.error("Error triggering payout:", error);
    return { status: "error", message: "Transaction failed", details: error.message };
  }
}

module.exports = { triggerClaimPayout };
*/
