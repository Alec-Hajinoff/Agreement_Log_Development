// Frontend - backend communication must happen over HTTPS on production.

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

// createAgreementFunction() is the API call to send the agreement text submitted by the user to the backend.

export const createAgreementFunction = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/create_agreement.php",
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

// The user clicks 'Countersign' in the UI and counterSigned() sends to the backend a boolean true - the agreement is countersigned, as well as the countersigner's name.

export const counterSigned = async (hash, userName) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/counter_signed.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hash, signed: true, userName: userName }),
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to sign agreement");
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/logout_component.php",
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

// agreementHashFunction() checks the hash in the database, as the user types it, and when that matches displays the agreement text.

export const agreementHashFunction = async (hash) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/agreement_hash.php",
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

// When a user enters agreement hash, agreementHashUserDashboard() fetches agreement text from the database.

export const agreementHashUserDashboard = async (hash) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/agreement_hash_user.php",
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

// userDashboard() fetches data from the database to populate the user dashboard tables with created and countersigned agreements.

export const userDashboard = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/user_dashboard.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch dashboard data");
  }
};

export const passwordReset = async (email) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/password_reset.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

// updatePassword() handles a password reset after the user clicked on a reset link in their email.

export const updatePassword = async (token, newPassword) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Agreement_Log_Development/new_password.php", // Updated URL to point to the actual backend PHP script for password update
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Included for consistency with other API calls (e.g., session handling)
        body: JSON.stringify({ token, newPassword }), // Structured payload with token and newPassword
      }
    );

    const data = await response.json();
    return data; // Return the response data for handling in the component
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred."); // Throw error for component-level handling
  }
};

// ... rest of existing code in ApiService.js ...
