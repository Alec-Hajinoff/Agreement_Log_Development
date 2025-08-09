import {
  captureAccountData,
  createPolicy,
  fetchClaimCalculations,
  fetchPremiumPayout,
  registerUser,
} from "../ApiService";

describe("ApiService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("captureAccountData", () => {
    it("should capture account data successfully", async () => {
      const mockData = { success: true };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData),
        })
      );

      const formData = { key: "value" };
      const result = await captureAccountData(formData);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Climate_Bind_Development/account_data_capture.php",
        {
          method: "POST",
          body: expect.any(FormData),
          credentials: "include",
        }
      );
    });

    it("should handle error", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error"))
      );

      const formData = { key: "value" };
      await expect(captureAccountData(formData)).rejects.toThrow();
    });
  });

  describe("createPolicy", () => {
    it("should create policy successfully", async () => {
      const mockData = { success: true };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData),
        })
      );

      const policyData = { key: "value" };
      const result = await createPolicy(policyData);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Climate_Bind_Development/claim_data_capture.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(policyData),
          credentials: "include",
        }
      );
    });

    it("should handle error", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error"))
      );

      const policyData = { key: "value" };
      await expect(createPolicy(policyData)).rejects.toThrow();
    });
  });

  describe("fetchClaimCalculations", () => {
    it("should fetch claim calculations successfully", async () => {
      const mockData = { success: true };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData),
        })
      );

      const result = await fetchClaimCalculations();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Climate_Bind_Development/claim_calculations.php",
        {
          method: "GET",
          credentials: "include",
        }
      );
    });

    it("should handle error", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error"))
      );

      await expect(fetchClaimCalculations()).rejects.toThrow();
    });
  });

  describe("fetchPremiumPayout", () => {
    it("should fetch premium payout data successfully", async () => {
      const mockData = { premium: 100, payout: 1000 };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData),
        })
      );

      const result = await fetchPremiumPayout("2000", "flood");

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Climate_Bind_Development/payout_premium.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "2000",
            latitude: "flood",
          }),
        }
      );
    });
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      const mockData = { success: true };
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData),
        })
      );

      const formData = { key: "value" };
      const result = await registerUser(formData);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Climate_Bind_Development/form_capture.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
    });

    it("should handle error", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error"))
      );

      const formData = { key: "value" };
      await expect(registerUser(formData)).rejects.toThrow();
    });
  });
});
