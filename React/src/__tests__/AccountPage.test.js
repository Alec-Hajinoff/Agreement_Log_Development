import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import AccountPage from "../AccountPage";

describe("AccountPage", () => {
  it("renders the account page with welcome message and AccountDataCapture component", () => {
    render(
      <Router>
        <AccountPage />
      </Router>
    );

    expect(
      screen.getByText(
        /Thank you for logging in and welcome to your account page! Please fill in the form below to start your insurance policy./i
      )
    ).toBeInTheDocument();

    expect(screen.getByText(/save your progress/i)).toBeInTheDocument();
  });
});
