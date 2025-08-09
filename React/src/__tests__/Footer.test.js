import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer Component", () => {
  test("renders the footer with correct text and link", () => {
    render(<Footer />);

    expect(
      screen.getByText(
        /Company address: 4 Bridge Gate, London, N21 2AH, United Kingdom./i
      )
    ).toBeInTheDocument();

    expect(screen.getByText(/Email address:/i)).toBeInTheDocument();

    const emailLink = screen.getByRole("link", {
      name: /team@climatebind.com/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", "mailto:team@climatebind.com");
  });
});
