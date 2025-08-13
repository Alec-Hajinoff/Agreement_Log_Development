const express = require("express");
const { triggerClaimPayout } = require("./triggerClaim.js"); // Imports payout function

const app = express();
const port = 8002;

app.use(express.json()); // Ensures request body parsing

app.post("/trigger-payout", async (req, res) => {
  try {
    const { agreementHash } = req.body; // Extract address and amount from POST body
    const txDetails = await triggerClaimPayout(agreementHash);
    console.log("Tx Details:", txDetails);

    res.json({
      status: txDetails?.status,
      message: txDetails?.message,
      txHash: txDetails?.txHash,
    });
  } catch (error) {
    console.error("Error processing payout:", error);
    res.status(500).json({
      status: "error",
      message: "Blockchain transaction failed",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  // Listens on specified port
  console.log(`Server running on port ${port}`);
});

/*
const express = require("express");
const { triggerClaimPayout } = require("./triggerClaim.js"); // Imports payout function

const app = express();
const port = 3000;

app.use(express.json()); // Ensures request body parsing

app.post("/trigger-payout", async (req, res) => {
  try {
    const { address, amount } = req.body; // Extract address and amount from POST body
    const txDetails = await triggerClaimPayout(address, amount);
    console.log("Tx Details:", txDetails);

    res.json({
      status: txDetails?.status,
      message: txDetails?.message,
      txHash: txDetails?.txHash,
    });
  } catch (error) {
    console.error("Error processing payout:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Blockchain transaction failed",
        details: error.message,
      });
  }
});

app.listen(port, () => {
  // Listens on specified port
  console.log(`Server running on port ${port}`);
});
*/
