import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import RegisteredPage from "../RegisteredPage";

describe("RegisteredPage", () => {
  it("renders the registered page with thank you message and UserLogin component", () => {
    render(
      <Router>
        <RegisteredPage />
      </Router>
    );

    expect(
      screen.getByText(
        /Thank you for registering! Please log in using your credentials./i
      )
    ).toBeInTheDocument();

    expect(screen.getByText(/Registered user login:/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
  });
});
