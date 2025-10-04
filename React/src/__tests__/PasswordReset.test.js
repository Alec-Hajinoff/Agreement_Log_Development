import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PasswordReset from "../PasswordReset";
import { updatePassword } from "../ApiService";

// Mock the API service
jest.mock("../ApiService", () => ({
  updatePassword: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("PasswordReset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the password reset form correctly", () => {
    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    expect(
      screen.getByPlaceholderText("Enter New Password")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Re-enter New Password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows error message when token is missing", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    expect(screen.getByText("Invalid reset link.")).toBeInTheDocument();
  });

  it("updates form data on input change", () => {
    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByPlaceholderText("Enter New Password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Re-enter New Password"
    );

    fireEvent.change(newPasswordInput, { target: { value: "newpassword123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "newpassword123" },
    });

    expect(newPasswordInput.value).toBe("newpassword123");
    expect(confirmPasswordInput.value).toBe("newpassword123");
  });

  it("shows error for password too short", async () => {
    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByPlaceholderText("Enter New Password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Re-enter New Password"
    );
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: "short" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "short" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters long.")
      ).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByPlaceholderText("Enter New Password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Re-enter New Password"
    );
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "different" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
  });

  it("submits successfully and navigates to home", async () => {
    updatePassword.mockResolvedValue({ status: "success" });

    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByPlaceholderText("Enter New Password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Re-enter New Password"
    );
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith("test-token", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error on API failure", async () => {
    updatePassword.mockResolvedValue({ status: "error", message: "API error" });

    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByPlaceholderText("Enter New Password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Re-enter New Password"
    );
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("API error")).toBeInTheDocument();
    });
  });

  it("shows generic error on exception", async () => {
    updatePassword.mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByPlaceholderText("Enter New Password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Re-enter New Password"
    );
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("disables button during loading and shows spinner", async () => {
    updatePassword.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ status: "success" }), 100)
        )
    );

    render(
      <MemoryRouter initialEntries={["/?token=test-token"]}>
        <PasswordReset />
      </MemoryRouter>
    );

    const newPasswordInput = screen.getByPlaceholderText("Enter New Password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Re-enter New Password"
    );
    const submitButton = screen.getByRole("button", {
      name: /reset password/i,
    });

    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    expect(screen.getByRole("button", { name: /resetting/i })).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
