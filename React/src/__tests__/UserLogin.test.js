import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import UserLogin from "../UserLogin";

// Mock the ApiService module instead of global fetch
jest.mock("../ApiService", () => ({
  loginUser: jest.fn(),
  passwordReset: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("UserLogin", () => {
  let navigateMock;
  let loginUserMock;
  let passwordResetMock;

  beforeEach(() => {
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    // Get the mocked functions
    const { loginUser, passwordReset } = require("../ApiService");
    loginUserMock = loginUser;
    passwordResetMock = passwordReset;

    // Set default mock returns
    loginUserMock.mockResolvedValue({
      status: "success",
      registration_status: "Registration data is not complete",
    });
    passwordResetMock.mockResolvedValue(); // Default success for password reset
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<UserLogin />);

    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("updates form data when input values change", () => {
    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("john@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("submits the form and navigates to AccountPage on success", async () => {
    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    // Wait for async operations
    await screen.findByText("Login");

    expect(loginUserMock).toHaveBeenCalledWith({
      email: "john@example.com",
      password: "password123",
    });

    expect(navigateMock).toHaveBeenCalledWith("/CreateAgreement");
  });

  it("displays an error message when login fails", async () => {
    loginUserMock.mockRejectedValueOnce(
      new Error("Sign in failed. Please try again.")
    );

    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await screen.findByText("Sign in failed. Please try again.");

    expect(
      screen.getByText("Sign in failed. Please try again.")
    ).toBeInTheDocument();
  });

  it("displays an error message when loginUser throws an error", async () => {
    loginUserMock.mockRejectedValueOnce(new Error("An error occurred."));

    render(<UserLogin />);

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);

    await screen.findByText("An error occurred.");

    expect(screen.getByText("An error occurred.")).toBeInTheDocument();
  });

  // New tests for forgot password functionality
  it("renders the forgot password link", () => {
    render(<UserLogin />);
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("shows error message when forgot password is clicked without email", () => {
    render(<UserLogin />);
    const forgotLink = screen.getByText("Forgot password?");
    fireEvent.click(forgotLink);

    expect(
      screen.getByText(
        "Please enter your email address to reset your password."
      )
    ).toBeInTheDocument();
  });

  it("calls passwordReset and shows success message when forgot password is clicked with email", async () => {
    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const forgotLink = screen.getByText("Forgot password?");

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.click(forgotLink);

    await screen.findByText(
      "If we have an account for that email, we've sent a password reset link. Please check your inbox and spam folder."
    );

    expect(passwordResetMock).toHaveBeenCalledWith("john@example.com");
    expect(screen.getByText("Password reset email sent")).toBeInTheDocument();
  });

  it("displays error message when passwordReset fails", async () => {
    passwordResetMock.mockRejectedValueOnce(new Error("Reset failed"));

    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const forgotLink = screen.getByText("Forgot password?");

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.click(forgotLink);

    await screen.findByText(
      "An error occurred while sending the reset email. Please try again."
    );

    expect(
      screen.getByText(
        "An error occurred while sending the reset email. Please try again."
      )
    ).toBeInTheDocument();
  });

  it("shows loading spinner and text on forgot password link during reset", async () => {
    passwordResetMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const forgotLink = screen.getByText("Forgot password?");

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.click(forgotLink);

    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();

    await screen.findByText("Password reset email sent");
  });

  // Tests for CSS class application
  it("applies 'show' class to forgot-message when message is displayed", async () => {
    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const forgotLink = screen.getByText("Forgot password?");

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.click(forgotLink);

    await screen.findByText(
      "If we have an account for that email, we've sent a password reset link. Please check your inbox and spam folder."
    );

    const forgotMessageDiv = screen
      .getByText(
        "If we have an account for that email, we've sent a password reset link. Please check your inbox and spam folder."
      )
      .closest("div");
    expect(forgotMessageDiv).toHaveClass("forgot-message show");
  });

  it("applies 'disabled' class to forgot password link after successful reset", async () => {
    render(<UserLogin />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const forgotLink = screen.getByText("Forgot password?");

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.click(forgotLink);

    await screen.findByText("Password reset email sent");

    expect(forgotLink).toHaveClass("disabled");
  });
});
