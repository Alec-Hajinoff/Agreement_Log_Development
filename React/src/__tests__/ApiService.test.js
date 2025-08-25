import {
  registerUser,
  loginUser,
  createAgreementFunction,
  counterSigned,
  logoutUser,
  agreementHashFunction,
  userDashboard,
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
        "http://localhost:8001/Climate_Bind_Development/logout_component.php",
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
});
