import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CounterSignature from "../CounterSignature";
import { counterSigned, agreementHashFunction } from "../ApiService";
import { useParams } from "react-router-dom";

jest.mock("../ApiService");

// Mock useParams to simulate URL-based hash
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ hash: "validHash123" }),
}));

describe("CounterSignature Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays agreement text on mount when hash is in URL", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Auto-loaded Agreement Text",
    });

    render(<CounterSignature />);

    await waitFor(() => {
      expect(
        screen.getByText("Auto-loaded Agreement Text"),
      ).toBeInTheDocument();
    });
  });

  it("shows error message if agreement not found", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "error",
    });

    render(<CounterSignature />);

    await waitFor(() => {
      expect(
        screen.getByText("Agreement not found. Please check the link."),
      ).toBeInTheDocument();
    });
  });

  it("shows error message if agreement loading fails", async () => {
    agreementHashFunction.mockRejectedValueOnce(new Error("Network error"));

    render(<CounterSignature />);

    await waitFor(() => {
      expect(screen.getByText("Error loading agreement.")).toBeInTheDocument();
    });
  });

  it("enables submit button when agreement is loaded and name is entered", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Agreement Text",
    });

    render(<CounterSignature />);

    await waitFor(() => {
      expect(screen.getByText("Agreement Text")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Jane Doe" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Countersign" })).toBeEnabled();
    });
  });

  it("handles successful counter signature and triggers download", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Agreement Text",
    });

    const mockDownloadData = {
      agreementHash: "validHash123",
      signedBy: "Jane Doe",
      timestamp: "2025-10-30T06:00:00Z",
    };

    counterSigned.mockResolvedValueOnce({
      success: true,
      downloadData: mockDownloadData,
    });

    render(<CounterSignature />);

    await waitFor(() => {
      expect(screen.getByText("Agreement Text")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Jane Doe" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Countersign" }));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Thank you, the agreement has been counter-signed!"),
      ).toBeInTheDocument();
    });
  });

  it("shows error message on counter signature failure", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Agreement Text",
    });

    counterSigned.mockRejectedValueOnce(new Error("Failed to sign agreement"));

    render(<CounterSignature />);

    await waitFor(() => {
      expect(screen.getByText("Agreement Text")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Jane Doe" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Countersign" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to sign agreement")).toBeInTheDocument();
    });
  });

  it("shows loading message during submission", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Agreement Text",
    });

    counterSigned.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100),
        ),
    );

    render(<CounterSignature />);

    await waitFor(() => {
      expect(screen.getByText("Agreement Text")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Jane Doe" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Countersign" }));

    expect(
      screen.getByText("Saving your agreement to the blockchain, please wait…"),
    ).toBeInTheDocument();
  });
});
