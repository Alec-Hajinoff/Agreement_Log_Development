import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CreateAgreement from "../CreateAgreement";
import { createAgreementFunction, userDashboard } from "../ApiService";

jest.mock("../ApiService");

jest.mock("../LogoutComponent", () => () => <button>Logout</button>);

describe("CreateAgreement Component", () => {
  const mockAgreements = [
    {
      agreement_hash: "hash123",
      counter_signed: false,
    },
    {
      agreement_hash: "hash456",
      counter_signed: true,
      countersigner_name: "John Doe",
      countersigned_timestamp: "2025-08-25 10:00:00",
    },
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
    expect(screen.getByRole("textbox")).toBeInTheDocument();
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
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Test agreement text" },
      });
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
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Test agreement text" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Generate hash/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Submission failed/)).toBeInTheDocument();
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
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Initial text" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Generate hash/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(mockHash)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "New text" },
      });
    });

    expect(screen.queryByText(mockHash)).not.toBeInTheDocument();
  });
});
