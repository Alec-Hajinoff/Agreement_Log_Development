import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

test("renders the Header component", () => {
  render(<Header />);

  const logo = screen.getByAltText(/a company logo/i);
  expect(logo).toBeInTheDocument();
  expect(logo).toHaveAttribute("src", "blue.svg");
  expect(logo).toHaveAttribute("title", "A company logo");
});
