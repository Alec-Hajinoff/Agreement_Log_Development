import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import AccountDataCapture from "../AccountDataCapture";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("AccountDataCapture", () => {
  let navigateMock;

  beforeEach(() => {
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the account data capture form", () => {
    render(<AccountDataCapture />);

    expect(screen.getByText("Surname")).toBeInTheDocument();
    expect(screen.getByText("Date of birth")).toBeInTheDocument();
    expect(screen.getByText("Phone number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("updates form data when input values change", () => {
    render(<AccountDataCapture />);

    const lastNameInput = screen.getByLabelText(/surname/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });

    expect(lastNameInput.value).toBe("Doe");
    expect(phoneInput.value).toBe("1234567890");
});

  it("submits the form and navigates to DataSubmittedThenClaim on success", async () => {
    render(<AccountDataCapture />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Climate_Bind_Development/account_data_capture.php",
      expect.any(Object)
    );
    expect(navigateMock).toHaveBeenCalledWith("/DataSubmittedThenClaim");
  });

  it("displays an error message when submission fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false }),
      })
    );

    render(<AccountDataCapture />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(
      screen.getByText("Submission failed. Please try again.")
    ).toBeInTheDocument();
  });

  it("displays an error message when fetch fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    render(<AccountDataCapture />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.getByText("An error occurred.")).toBeInTheDocument();
  });
});
