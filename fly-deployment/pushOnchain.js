require("dotenv").config(); // Loads environment variables from .env file
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Connects to Ethereum node
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Signs transactions
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
  throw new Error(
    "Missing required environment variables: RPC_URL or PRIVATE_KEY."
  );
}

const AgreementSignedABI = [
  // Defines interface for interacting with the contract
  "function publishedAgreementHash(bytes32 agreementHash, uint256 timestamp) external",
  "event SignedAgreementPublished(address indexed sender, bytes32 indexed agreementHash, uint256 timestamp)",
];
const AgreementSignedAddress = "0x82c086a29C39Cf184050A0687652f4e16b392014"; // The actual deployed contract address
const AgreementSigned = new ethers.Contract(
  AgreementSignedAddress,
  AgreementSignedABI,
  wallet
);

async function pushOnchainHash(agreementHash, timestamp) {
  try {
    const bytes32Hash = agreementHash.startsWith("0x") // Hexadecimal numbers for Etherum need to have 0x in front.
      ? agreementHash
      : "0x" + agreementHash;

    const registerTx = await AgreementSigned.publishedAgreementHash(
      bytes32Hash,
      timestamp
    );

    await registerTx.wait();
    return {
      // This return the value of pushOnchainHash(), and it goes into console.log("Tx Details:", txDetails); in file server.js.
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

module.exports = { pushOnchainHash };
