//Frontend - backend communication must happen over HTTPS on production
export const registerUser = async (formData) => {
  try {
    const response = await fetch("http://localhost:8001/Agreement_Log_Development/form_capture.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

export const loginUser = async (formData) => {
  try {
    const response = await fetch("http://localhost:8001/Agreement_Log_Development/login_capture.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

export const captureAccountData = async (formData) => {
  try {
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    const response = await fetch("http://localhost:8001/Climate_Bind_Development/account_data_capture.php", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

//createPolicy() submits the policy data to the database and sends the user to the policy summary page.
export const createPolicy = async (policyData) => {
  try {
    const response = await fetch("http://localhost:8001/Climate_Bind_Development/claim_data_capture.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(policyData),
      credentials: "include",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

export const fetchClaimCalculations = async () => {
  try {
    const response = await fetch("http://localhost:8001/Climate_Bind_Development/claim_calculations.php", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching claim calculations:", error);
    throw new Error("An error occurred while fetching claim calculations.");
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch("http://localhost:8001/Climate_Bind_Development/logout_component.php", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("An error occurred during logout.");
  }
};

// fetchPremiumPayout pulls premium and payout data from the database to update the interface when a user changes coordinates or selected event.
export const fetchPremiumPayout = async (event, latitude, longitude) => { 
  try {
    const response = await fetch('http://localhost:8001/Climate_Bind_Development/payout_premium.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event,
        latitude, 
        longitude
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch premium and payout data");
  }
};

// Sends user's wallet address to the database
export const saveWalletAddress = async (walletData) => {
  try {
    const response = await fetch("http://localhost:8001/Climate_Bind_Development/save_wallet.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(walletData),
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred while saving wallet address.");
  }
};

