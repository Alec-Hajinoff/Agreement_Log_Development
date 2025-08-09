import { render, screen } from "@testing-library/react";
import React from 'react';
import "@testing-library/jest-dom";
import App from "../App";

test("Checks the component is rendered", () => {
  render(<App />);
  const linkElement = screen.getByText(/New user/i);
  expect(linkElement).toBeInTheDocument();
});

