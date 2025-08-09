import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PremiumPaymentRequest from "../PremiumPaymentRequest";
import { ethers } from "ethers";
import { saveWalletAddress } from "../ApiService";

// Mocks ApiService
jest.mock("../ApiService", () => ({
  saveWalletAddress: jest.fn()
}));

// Mocks ethers
jest.mock("ethers");

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PremiumPaymentRequest Component", () => {
  const mockEthereum = {
    request: jest.fn()
  };

  const mockContract = {
    payPremium: jest.fn()
  };

  const mockTransaction = {
    wait: jest.fn(),
    hash: "0x123"
  };

  const mockAddress = "0xTestAddress";

  beforeEach(() => {
    global.window.ethereum = mockEthereum;
    
    ethers.providers.Web3Provider = jest.fn().mockImplementation(() => ({
      getSigner: () => ({
        getAddress: jest.fn().mockResolvedValue(mockAddress)
      })
    }));
    
    ethers.Contract = jest.fn().mockImplementation(() => mockContract);
    ethers.BigNumber = {
      from: jest.fn().mockImplementation(value => value)
    };
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete global.window.ethereum;
  });

  test("alerts when no premium amount is provided", async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();
    
    renderWithRouter(<PremiumPaymentRequest premiumAmount={null} />);
    const button = screen.getByText("Pay Premium");
    fireEvent.click(button);

    expect(alertMock).toHaveBeenCalledWith("Please select a valid policy first");
    alertMock.mockRestore();
  });

  test("processes complete transaction flow with premium amount", async () => {
    mockContract.payPremium.mockResolvedValue(mockTransaction);
    mockTransaction.wait.mockResolvedValue({});
    saveWalletAddress.mockResolvedValue({});

    renderWithRouter(<PremiumPaymentRequest premiumAmount="13.00" />);
    const button = screen.getByText("Pay Premium");
    fireEvent.click(button);

    expect(screen.getByText("Processing...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockContract.payPremium).toHaveBeenCalledWith({
        value: "13"
      });
      expect(saveWalletAddress).toHaveBeenCalledWith({
        wallet_address: mockAddress,
        transaction_hash: "0x123"
      });
      expect(screen.getByText("Pay Premium")).toBeInTheDocument();
    });
  });

  test("handles MetaMask not installed", async () => {
    delete global.window.ethereum;
    const alertMock = jest.spyOn(window, 'alert').mockImplementation();

    renderWithRouter(<PremiumPaymentRequest premiumAmount="13.00" />);
    const button = screen.getByText("Pay Premium");
    fireEvent.click(button);

    expect(alertMock).toHaveBeenCalledWith("Please install MetaMask first.");
    alertMock.mockRestore();
  });

  test("handles API save error", async () => {
    mockContract.payPremium.mockResolvedValue(mockTransaction);
    mockTransaction.wait.mockResolvedValue({});
    saveWalletAddress.mockRejectedValue(new Error("API Error"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderWithRouter(<PremiumPaymentRequest premiumAmount="13.00" />);
    const button = screen.getByText("Pay Premium");
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(screen.getByText("Pay Premium")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test("handles transaction error", async () => {
    mockContract.payPremium.mockRejectedValue(new Error("Transaction failed"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderWithRouter(<PremiumPaymentRequest premiumAmount="13.00" />);
    const button = screen.getByText("Pay Premium");
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(screen.getByText("Pay Premium")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});