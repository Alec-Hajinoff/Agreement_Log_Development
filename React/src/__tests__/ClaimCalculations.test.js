import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ClaimCalculations from "../ClaimCalculations";
import { fetchClaimCalculations } from "../ApiService";

jest.mock("../ApiService"); // Two dots as we go up one directory

const renderWithRouter = (component) => {
  // Wraps component for routing context
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ClaimCalculations Component", () => {
  const mockData = [
    {
      premium_amount: "100",
      payout_amount: "1000",
      event_type: "Temperature",
      comparison_operator: ">",
      threshold_value: "30",
      threshold_unit: "°C",
    },
  ];

  beforeEach(() => {
    fetchClaimCalculations.mockResolvedValue(mockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders table headers correctly", () => {
    renderWithRouter(<ClaimCalculations />);
    expect(
      screen.getByText("Your monthly premium amount is USDC:")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Automatic payout to you is USDC:")
    ).toBeInTheDocument();
  });

  test("displays parameter conditions correctly", async () => {
    renderWithRouter(<ClaimCalculations />);
    await waitFor(() => {
      expect(screen.getByText("Temperature > 30 °C")).toBeInTheDocument();
    });
  });

  test("handles API fetch error", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    fetchClaimCalculations.mockRejectedValue(new Error("API Error"));

    renderWithRouter(<ClaimCalculations />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
