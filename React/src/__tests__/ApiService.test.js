import {
  registerUser,
  loginUser,
  createAgreementFunction,
  counterSigned,
  logoutUser,
  agreementHashFunction,
  userDashboard,
  passwordReset,
  updatePassword,
} from "../ApiService";

describe("ApiService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      const mockResponse = { success: true };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        })
      );

      const formData = { username: "test", password: "pass123" };
      const result = await registerUser(formData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/form_capture.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
    });

    it("should handle registration error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(registerUser({})).rejects.toThrow("An error occurred.");
    });
  });

  describe("loginUser", () => {
    it("should login user successfully", async () => {
      const mockResponse = { success: true };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        })
      );

      const formData = { username: "test", password: "pass123" };
      const result = await loginUser(formData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/login_capture.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
    });

    it("should handle login error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(loginUser({})).rejects.toThrow("An error occurred.");
    });
  });

  describe("createAgreementFunction", () => {
    it("should create agreement successfully", async () => {
      const mockResponse = { hash: "abc123" };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        })
      );

      const formData = { agreement: "Test agreement" };
      const result = await createAgreementFunction(formData);

      expect(result).toEqual({
        success: true,
        hash: mockResponse.hash,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/create_agreement.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
    });

    it("should handle agreement creation error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(createAgreementFunction({})).rejects.toThrow(
        "An error occurred."
      );
    });
  });

  describe("counterSigned", () => {
    it("should counter sign agreement successfully", async () => {
      const mockResponse = { success: true };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        })
      );

      const hash = "abc123";
      const userName = "testUser";
      const result = await counterSigned(hash, userName);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/counter_signed.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash, signed: true, userName }),
          credentials: "include",
        }
      );
    });

    it("should handle counter signing error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(counterSigned("hash", "user")).rejects.toThrow(
        "Failed to sign agreement"
      );
    });
  });

  describe("logoutUser", () => {
    it("should logout user successfully", async () => {
      global.fetch.mockImplementationOnce(() => Promise.resolve({ ok: true }));

      await expect(logoutUser()).resolves.not.toThrow();
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/logout_component.php",
        {
          method: "POST",
          credentials: "include",
        }
      );
    });

    it("should handle logout error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(logoutUser()).rejects.toThrow(
        "An error occurred during logout."
      );
    });
  });

  describe("agreementHashFunction", () => {
    it("should verify hash successfully", async () => {
      const mockResponse = { agreement: "Test agreement" };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        })
      );

      const hash = "abc123";
      const result = await agreementHashFunction(hash);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/agreement_hash.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash }),
          credentials: "include",
        }
      );
    });

    it("should handle hash verification error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(agreementHashFunction("hash")).rejects.toThrow(
        "Failed to verify agreement hash"
      );
    });
  });

  describe("userDashboard", () => {
    it("should fetch dashboard data successfully", async () => {
      const mockResponse = { agreements: [] };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await userDashboard();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/user_dashboard.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
    });

    it("should handle dashboard fetch error", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(userDashboard()).rejects.toThrow(
        "Failed to fetch dashboard data"
      );
    });
  });

  describe("passwordReset", () => {
    // Clear the fetch mock before each test to ensure isolation
    beforeEach(() => {
      fetch.mockClear();
    });

    it("should successfully call passwordReset with valid email and return response data", async () => {
      // Set up the mock response for a successful API call
      const mockResponse = {
        json: jest
          .fn()
          .mockResolvedValue({ success: true, message: "Reset email sent" }), // Simulate backend response
      };
      fetch.mockResolvedValue(mockResponse); // Mock fetch to resolve with the mock response

      const email = "test@example.com"; // Test input email

      // Call the passwordReset function
      const result = await passwordReset(email);

      // Verify fetch was called with the correct URL, method, headers, credentials, and body
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/password_reset.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email }), // Ensure email is stringified correctly
        }
      );

      // Check that the function returns the expected data
      expect(result).toEqual({ success: true, message: "Reset email sent" });

      // Verify response.json() was called once
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it("should throw a generic error when fetch fails (e.g., network error)", async () => {
      // Mock fetch to reject with a network error
      fetch.mockRejectedValue(new Error("Network error"));

      const email = "test@example.com"; // Test input email

      // Expect the function to throw the generic error message
      // The function catches any error from fetch and throws "An error occurred."
      await expect(passwordReset(email)).rejects.toThrow("An error occurred.");

      // Verify fetch was still called with correct parameters despite the error
      expect(fetch).toHaveBeenCalledWith(
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
    });

    it("should handle non-OK responses (e.g., server error status)", async () => {
      // Mock a response that represents a server error (e.g., 500 status)
      const mockResponse = {
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")), // Simulate json parsing error
      };
      fetch.mockResolvedValue(mockResponse);

      const email = "test@example.com";

      // Expect the function to throw the generic error
      await expect(passwordReset(email)).rejects.toThrow("An error occurred.");

      // Verify fetch and json were called
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });

  describe("updatePassword", () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    it("should successfully update password with valid token and password", async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: true,
          message: "Password updated successfully",
        }),
      };
      fetch.mockResolvedValue(mockResponse);

      const token = "valid-token-123";
      const newPassword = "newSecurePassword123";
      const result = await updatePassword(token, newPassword);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/new_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token, newPassword }),
        }
      );

      expect(result).toEqual({
        success: true,
        message: "Password updated successfully",
      });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it("should throw a generic error when fetch fails", async () => {
      fetch.mockRejectedValue(new Error("Network error"));

      const token = "valid-token-123";
      const newPassword = "newSecurePassword123";

      await expect(updatePassword(token, newPassword)).rejects.toThrow(
        "An error occurred."
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Agreement_Log_Development/new_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token, newPassword }),
        }
      );
    });

    it("should handle non-OK responses", async () => {
      const mockResponse = {
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };
      fetch.mockResolvedValue(mockResponse);

      const token = "valid-token-123";
      const newPassword = "newSecurePassword123";

      await expect(updatePassword(token, newPassword)).rejects.toThrow(
        "An error occurred."
      );

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });
});
