import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import UserRegistration from "../UserRegistration";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("UserRegistration", () => {
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

  it("renders the registration form", () => {
    render(<UserRegistration />);

    expect(screen.getByPlaceholderText("Your first name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Choose a strong password (minimum 8 characters)"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  it("updates form data when input values change", () => {
    render(<UserRegistration />);

    const firstNameInput = screen.getByPlaceholderText("Your first name");
    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText(
      "Choose a strong password (minimum 8 characters)"
    );

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(firstNameInput.value).toBe("John");
    expect(emailInput.value).toBe("john@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("submits the form and navigates to RegisteredPage on success", async () => {
    render(<UserRegistration />);

    const firstNameInput = screen.getByPlaceholderText("Your first name");
    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText(
      "Choose a strong password (minimum 8 characters)"
    );
    const submitButton = screen.getByRole("button", { name: /register/i });

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Climate_Bind_Development/form_capture.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: "John",
          email: "john@example.com",
          password: "password123",
        }),
      }
    );

    expect(navigateMock).toHaveBeenCalledWith("/RegisteredPage");
  });

  it("displays an error message when registration fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false }),
      })
    );

    render(<UserRegistration />);

    const firstNameInput = screen.getByPlaceholderText("Your first name");
    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText(
      "Choose a strong password (minimum 8 characters)"
    );
    const submitButton = screen.getByRole("button", { name: /register/i });

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(
      screen.getByText("Registration failed. Please try again.")
    ).toBeInTheDocument();
  });

  it("displays an error message when fetch fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    render(<UserRegistration />);

    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters long")
      ).toBeInTheDocument();
    });
  });
});
