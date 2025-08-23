const express = require("express");
const { pushOnchainHash } = require("./pushOnchain.js"); // Imports payout function

const app = express();
const port = 8002;

app.use(express.json()); // Parses incoming http request from PHP containing JSON data making it available in req.body (see below).

app.post("/call-express", async (req, res) => {
  try {
    const { agreementHash, timestamp } = req.body; // Extracts data (in this case 'agreementHash') from JSON.
    const txDetails = await pushOnchainHash(agreementHash, timestamp); // Calls pushOnchainHash() in file pushOnchain.js passing it the value of 'agreementHash'.
    console.log("Tx Details:", txDetails);

    res.json({
      // Data being sent back to PHP in response.
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
  // Listens on the specified port
  console.log(`Server running on port ${port}`);
});
