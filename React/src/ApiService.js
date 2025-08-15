//Frontend - backend communication must happen over HTTPS on production
export const registerUser = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/form_capture.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

export const loginUser = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/login_capture.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

// captureAccountData() is the API call to send the agreement text submitted by the user to the backend.

export const captureAccountData = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/account_data_capture.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      }
    );

    const data = await response.json();
    return {
      success: true,
      hash: data.hash,
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

// The user clicks 'Start Policy' in the UI and createPolicy() sends to the backend a boolean true - the agreement is counter signed.

export const createPolicy = async (hash) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/claim_data_capture.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hash, signed: true }),
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to sign agreement");
  }
};

export const fetchClaimCalculations = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Climate_Bind_Development/claim_calculations.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching claim calculations:", error);
    throw new Error("An error occurred while fetching claim calculations.");
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Climate_Bind_Development/logout_component.php",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("An error occurred during logout.");
  }
};

// fetchPremiumPayout() checks the hash in the database, as the user types it, and when that matches displays the agreement text.

export const fetchPremiumPayout = async (hash) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/payout_premium.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ hash }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to verify agreement hash");
  }
};

// Sends user's wallet address to the database
export const saveWalletAddress = async (walletData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Climate_Bind_Development/save_wallet.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(walletData),
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred while saving wallet address.");
  }
};
