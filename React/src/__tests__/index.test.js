import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";
import reportWebVitals from "../reportWebVitals";

test("renders App component and calls reportWebVitals", () => {
  const { getByText } = render(<App />);

  expect(getByText(/New user/i)).toBeInTheDocument();
});
