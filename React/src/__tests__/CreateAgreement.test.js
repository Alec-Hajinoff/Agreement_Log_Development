import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CreateAgreement from "../CreateAgreement";
import {
  createAgreementFunction,
  userDashboard,
  agreementHashUserDashboard,
  deleteAgreementFunction,
} from "../ApiService";

jest.mock("../ApiService");

jest.mock("../LogoutComponent", () => () => <button>Logout</button>);

jest.mock("../ApiService", () => ({
  ...jest.requireActual("../ApiService"),
  createAgreementFunction: jest.fn(),
  userDashboard: jest.fn(),
  agreementHashUserDashboard: jest.fn(),
  deleteAgreementFunction: jest.fn(), // Add this line
}));

describe("CreateAgreement Component", () => {
  const mockAgreements = [
    {
      agreement_hash: "hash123",
      counter_signed: false,
      needs_signature: true,
      category: "Clients",
    },
    {
      agreement_hash: "hash456",
      counter_signed: true,
      needs_signature: true,
      countersigner_name: "John Doe",
      countersigned_timestamp: "2025-08-25 10:00:00",
      category: "Clients",
    },
    {
      agreement_hash: "hash789",
      counter_signed: false,
      needs_signature: false,
      agreement_tag: "Test Agreement",
      created_timestamp: "2025-08-25 10:00:00",
      category: "Clients",
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

  screen.debug();

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

    screen.debug();

    await waitFor(() => {
      expect(screen.getByText(mockHash)).toBeInTheDocument();
    });
  });

  it("displays countersignature link when agreement needs signature", async () => {
    const mockHash = "generatedHash456";
    createAgreementFunction.mockResolvedValueOnce({
      success: true,
      hash: mockHash,
    });

    render(<CreateAgreement />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Step 2:/), {
        target: { value: "Agreement needing signature" },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "Clients" },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText(/Yes/)); // needs_signature = 1
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Generate hash/i }));
    });

    await waitFor(() => {
      const link = screen.getByRole("link", {
        name: `http://localhost:3000/CounterSignature/${mockHash}`,
      });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        `http://localhost:3000/CounterSignature/${mockHash}`
      );
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

    screen.debug();

    await waitFor(() => {
      const link = screen.getByRole("link", {
        name: `http://localhost:3000/CounterSignature/${mockHash}`,
      });
      expect(link).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Step 2:/), {
        target: { value: "New text" },
      });
    });

    expect(
      screen.queryByRole("link", {
        name: `http://localhost:3000/CounterSignature/${mockHash}`,
      })
    ).not.toBeInTheDocument();
  });

  describe("Delete Agreement Functionality", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      userDashboard.mockResolvedValue({
        success: true,
        agreements: mockAgreements,
      });
    });

    it("should show delete confirmation modal when delete button is clicked", async () => {
      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete this agreement?")
      ).toBeInTheDocument();
    });

    it("should successfully delete agreement when confirmed", async () => {
      deleteAgreementFunction.mockResolvedValueOnce({
        success: true,
      });

      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const confirmButton = screen.getByText("Delete", {
        selector: ".modal-footer button",
      });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(deleteAgreementFunction).toHaveBeenCalledWith("hash123");
        expect(screen.queryByText("hash123")).not.toBeInTheDocument();
      });
    });

    it("should handle delete agreement error", async () => {
      deleteAgreementFunction.mockRejectedValueOnce(
        new Error("Failed to delete agreement")
      );

      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      // Get the first delete button (from the table row)
      const deleteButton = screen.getAllByText("Delete")[0];
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // Get the delete button from the modal footer specifically
      const confirmButton = screen.getByText("Delete", {
        selector: ".modal-footer button",
      });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Failed to delete agreement")
        ).toBeInTheDocument();
      });
    });

    it("should close modal when cancel is clicked", async () => {
      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
    });

    it("should close modal when clicking outside", async () => {
      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      const modal = screen.getByText("Confirm Deletion").closest(".modal");
      fireEvent.click(modal);

      expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
    });
  });
});

/*
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CreateAgreement from "../CreateAgreement";
import {
  createAgreementFunction,
  userDashboard,
  agreementHashUserDashboard,
  deleteAgreementFunction,
} from "../ApiService";

jest.mock("../ApiService");

jest.mock("../LogoutComponent", () => () => <button>Logout</button>);

jest.mock("../ApiService", () => ({
  ...jest.requireActual("../ApiService"),
  createAgreementFunction: jest.fn(),
  userDashboard: jest.fn(),
  agreementHashUserDashboard: jest.fn(),
  deleteAgreementFunction: jest.fn(), // Add this line
}));

describe("CreateAgreement Component", () => {
  const mockAgreements = [
    {
      agreement_hash: "hash123",
      counter_signed: false,
      needs_signature: true,
      category: "Clients",
    },
    {
      agreement_hash: "hash456",
      counter_signed: true,
      needs_signature: true,
      countersigner_name: "John Doe",
      countersigned_timestamp: "2025-08-25 10:00:00",
      category: "Clients",
    },
    {
      agreement_hash: "hash789",
      counter_signed: false,
      needs_signature: false,
      agreement_tag: "Test Agreement",
      created_timestamp: "2025-08-25 10:00:00",
      category: "Clients",
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
  describe("Delete Agreement Functionality", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      userDashboard.mockResolvedValue({
        success: true,
        agreements: mockAgreements,
      });
    });

    it("should show delete confirmation modal when delete button is clicked", async () => {
      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete this agreement?")
      ).toBeInTheDocument();
    });

    it("should successfully delete agreement when confirmed", async () => {
      deleteAgreementFunction.mockResolvedValueOnce({
        success: true,
      });

      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const confirmButton = screen.getByText("Delete", {
        selector: ".modal-footer button",
      });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(deleteAgreementFunction).toHaveBeenCalledWith("hash123");
        expect(screen.queryByText("hash123")).not.toBeInTheDocument();
      });
    });

    it("should handle delete agreement error", async () => {
      deleteAgreementFunction.mockRejectedValueOnce(
        new Error("Failed to delete agreement")
      );

      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      // Get the first delete button (from the table row)
      const deleteButton = screen.getAllByText("Delete")[0];
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // Get the delete button from the modal footer specifically
      const confirmButton = screen.getByText("Delete", {
        selector: ".modal-footer button",
      });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Failed to delete agreement")
        ).toBeInTheDocument();
      });
    });

    it("should close modal when cancel is clicked", async () => {
      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
    });

    it("should close modal when clicking outside", async () => {
      render(<CreateAgreement />);

      await waitFor(() => {
        expect(screen.getByText("hash123")).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      const modal = screen.getByText("Confirm Deletion").closest(".modal");
      fireEvent.click(modal);

      expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
    });
  });
});
*/
