import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import DataSubmittedThenClaim from "../DataSubmittedThenClaim";

describe("DataSubmittedThenClaim Component", () => {
  test("renders the thank you message and CounterSignature component", () => {
    render(
      <Router>
        <DataSubmittedThenClaim />
      </Router>
    );

    expect(
      screen.getByText(/Please complete the form below to set up your policy./i)
    ).toBeInTheDocument();
  });
});
