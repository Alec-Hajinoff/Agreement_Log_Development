import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CreateAgreement from "../CreateAgreement";
import { createAgreementFunction, userDashboard, agreementHashUserDashboard } from "../ApiService";

jest.mock("../ApiService");

jest.mock("../LogoutComponent", () => () => <button>Logout</button>);

describe("CreateAgreement Component", () => {
  const mockAgreements = [
    {
      agreement_hash: "hash123",
      counter_signed: false,
      needs_signature: true,
      category: "Clients"
    },
    {
      agreement_hash: "hash456",
      counter_signed: true,
      needs_signature: true,
      countersigner_name: "John Doe",
      countersigned_timestamp: "2025-08-25 10:00:00",
      category: "Clients"
    },
    {
      agreement_hash: "hash789",
      counter_signed: false,
      needs_signature: false,
      agreement_tag: "Test Agreement",
      created_timestamp: "2025-08-25 10:00:00",
      category: "Clients"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userDashboard.mockResolvedValue({
      success: true,
      agreements: mockAgreements,
    });
  });

  it("renders initial form elements correctly", async () => {
    render(<CreateAgreement />);

    expect(screen.getByLabelText(/Step 1:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Step 2:/)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate hash/i })
    ).toBeInTheDocument();
  });

  it("loads and displays agreements from dashboard", async () => {
    render(<CreateAgreement />);

    await waitFor(() => {
      expect(screen.getByText("hash123")).toBeInTheDocument();
      expect(screen.getByText("hash456")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Test Agreement")).toBeInTheDocument();
    });
  });

  it("handles dashboard loading error", async () => {
    userDashboard.mockRejectedValueOnce(new Error("Failed to load agreements"));

    render(<CreateAgreement />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load agreements")).toBeInTheDocument();
    });
  });

  it("submits agreement text and displays hash", async () => {
    const mockHash = "generatedHash123";
    createAgreementFunction.mockResolvedValueOnce({
      success: true,
      hash: mockHash,
    });

    render(<CreateAgreement />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Step 2:/), {
        target: { value: "Test agreement text" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByDisplayValue("Select a category"), {
        target: { value: "Clients" },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText(/Yes/));
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Generate hash/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(mockHash)).toBeInTheDocument();
    });
  });

  it("handles agreement submission error", async () => {
    createAgreementFunction.mockRejectedValueOnce(
      new Error("Submission failed")
    );

    render(<CreateAgreement />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Step 2:/), {
        target: { value: "Test agreement text" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByDisplayValue("Select a category"), {
        target: { value: "Clients" },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText(/Yes/));
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Generate hash/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Submission failed/)).toBeInTheDocument();
    });
  });

  it("displays agreement text when valid hash is entered", async () => {
    const mockAgreementText = "Test agreement text";
    agreementHashUserDashboard.mockResolvedValueOnce({
      status: "success",
      agreementText: mockAgreementText,
    });

    render(<CreateAgreement />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "validHash" },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(mockAgreementText)).toBeInTheDocument();
    });
  });

  it("displays error message when invalid hash is entered", async () => {
    agreementHashUserDashboard.mockResolvedValueOnce({
      status: "error",
    });

    render(<CreateAgreement />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Agreement hash"), {
        target: { value: "invalidHash" },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Incorrect hash/)).toBeInTheDocument();
    });
  });

  it("clears hash when agreement text changes", async () => {
    const mockHash = "generatedHash123";
    createAgreementFunction.mockResolvedValueOnce({
      success: true,
      hash: mockHash,
    });

    render(<CreateAgreement />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Step 2:/), {
        target: { value: "Initial text" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByDisplayValue("Select a category"), {
        target: { value: "Clients" },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText(/Yes/));
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Generate hash/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(mockHash)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Step 2:/), {
        target: { value: "New text" },
      });
    });

    expect(screen.queryByText(mockHash)).not.toBeInTheDocument();
  });
});