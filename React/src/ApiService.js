// Frontend - backend communication must happen over HTTPS on production.

export const registerUser = async (formData) => {
  try {
    const response = await fetch(
      "https://agreementlog.com/Agreement_Log_Development/form_capture.php",
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
      "https://agreementlog.com/Agreement_Log_Development/login_capture.php",
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
      "https://agreementlog.com/Agreement_Log_Development/create_agreement.php",
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
      "https://agreementlog.com/Agreement_Log_Development/counter_signed.php",
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
      "https://agreementlog.com/Agreement_Log_Development/logout_component.php",
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

// agreementHashFunction() fetches the agreement text from the backend using the hash extracted from the URL. This allows the countersigner to view the agreement immediately upon visiting the link.

export const agreementHashFunction = async (hash) => {
  try {
    const response = await fetch(
      "https://agreementlog.com/Agreement_Log_Development/agreement_hash.php",
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
      "https://agreementlog.com/Agreement_Log_Development/agreement_hash_user.php",
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
      "https://agreementlog.com/Agreement_Log_Development/user_dashboard.php",
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

// passwordReset() checks if password exists in DB and if so sends out a pasword reset email to user.

export const passwordReset = async (email) => {
  try {
    const response = await fetch(
      "https://agreementlog.com/Agreement_Log_Development/password_reset.php",
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
      "https://agreementlog.com/Agreement_Log_Development/new_password.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token, newPassword }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

// deleteAgreementFunction() is a backend call to delete agreements.

export const deleteAgreementFunction = async (hash) => {
  try {
    const response = await fetch(
      "https://agreementlog.com/Agreement_Log_Development/delete_agreement.php",
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
    throw new Error("Failed to delete agreement");
  }
};
