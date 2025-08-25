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

jest.mock("../ApiService");

describe("CounterSignature Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial form elements correctly", () => {
    render(<CounterSignature />);

    expect(screen.getByPlaceholderText("Agreement hash")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
    expect(screen.getByText("Countersign")).toBeDisabled();
  });

  it("displays agreement text when valid hash is entered", async () => {
    const mockAgreementText = "Test Agreement Content";
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: mockAgreementText,
    });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "validHash123" },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(mockAgreementText)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Incorrect hash/)).not.toBeInTheDocument();
  });

  it("shows error message for invalid hash", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "error",
    });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "invalidHash" },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Incorrect hash, please ask the agreement owner for the correct hash"
        )
      ).toBeInTheDocument();
    });
  });

  it("enables submit button when agreement text and name are provided", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Valid Agreement",
    });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "validHash123" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Your full name"), {
        target: { value: "John Doe" },
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Countersign")).toBeEnabled();
    });
  });

  it("handles successful counter signature", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Valid Agreement",
    });

    counterSigned.mockResolvedValueOnce({ success: true });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "validHash123" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Your full name"), {
        target: { value: "John Doe" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Countersign" }));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Thank you, the agreement has been counter-signed!")
      ).toBeInTheDocument();
    });
  });

  it("handles counter signature error", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Valid Agreement",
    });

    counterSigned.mockRejectedValueOnce(new Error("Failed to sign agreement"));

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "validHash123" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Your full name"), {
        target: { value: "John Doe" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Countersign" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to sign agreement")).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreementText: "Valid Agreement",
    });

    counterSigned.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "validHash123" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Your full name"), {
        target: { value: "John Doe" },
      });
    });

    fireEvent.submit(screen.getByRole("button", { name: "Countersign" }));

    expect(
      screen.getByText("Saving your agreement to the blockchain, please wait…")
    ).toBeInTheDocument();
  });
});
