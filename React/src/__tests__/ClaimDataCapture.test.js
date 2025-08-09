import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import ClaimDataCapture from "../ClaimDataCapture";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("ClaimDataCapture", () => {
  let navigateMock;

  beforeEach(() => { // Runs before each test case
    navigateMock = jest.fn(); // Mock function to verify routing behaviour
    useNavigate.mockReturnValue(navigateMock); // Takes useNavigate line 7 and sets it to return mock function line 14

    global.fetch = jest.fn(() => // Replaces the global fetch function with a mock implementation
      Promise.resolve({
        json: () => Promise.resolve({ success: true }), // Returns API response true
      })
    );
  }); // This whole function simulates success API response for each test case

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the claim data capture form", () => {
    render(<ClaimDataCapture />);

    expect(
      screen.getByPlaceholderText(
        /Enter latitude of location you are insuring/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        /Enter longitude of location you are insuring/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select events you'd like your policy to cover:")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start policy/i })).toBeInTheDocument();
  });

  it("submits the form and navigates to ClaimSubmitted on success", async () => {
    render(<ClaimDataCapture />);

    // Simulates user input
    fireEvent.change(
      screen.getByPlaceholderText(
        /Enter latitude of location you are insuring/i
      ),
      { target: { value: "40.7128" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        /Enter longitude of location you are insuring/i
      ),
      { target: { value: "-74.0060" } }
    );
    fireEvent.click(screen.getByLabelText(/Wind > 50 km\/h/i));

    const submitButton = screen.getByRole("button", { name: /Start policy/i });
    fireEvent.click(submitButton);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String), // Checks if fetch was called with any URL
      expect.any(Object) // Contains request parameters (e.g. latitude, longitude, selectedEvent)
    );
    // Checks if navigation occurred
    expect(navigateMock).toHaveBeenCalledWith("/SubmittedClaim");
  });

  it("displays an error message when submission fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false }),
      })
    );

    render(<ClaimDataCapture />);

    const submitButton = screen.getByRole("button", { name: /Start policy/i });
    fireEvent.click(submitButton);

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Checks if the error message is displayed
    expect(
      screen.getByText("Submission failed. Please try again.")
    ).toBeInTheDocument();
  });

  it("displays an error message when fetch fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    render(<ClaimDataCapture />);

    // Sets required values to trigger useEffect
    fireEvent.change(screen.getByPlaceholderText(/Enter latitude/i), {
      target: { value: "40.7128" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter longitude/i), {
      target: { value: "-74.0060" },
    });
    fireEvent.click(screen.getByLabelText(/Wind > 50 km\/h/i));

    // Waits for the error message to appear
    await screen.findByText("Failed to fetch premium and payout data");

    expect(
      screen.getByText("Failed to fetch premium and payout data")
    ).toBeInTheDocument();
  });
});
