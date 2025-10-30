import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

jest.mock("../Header", () => () => <div data-testid="header">Header</div>);
jest.mock("../MainRegLog", () => () => (
  <div data-testid="main-reg-log">MainRegLog</div>
));
jest.mock("../Footer", () => () => <div data-testid="footer">Footer</div>);
jest.mock("../RegisteredPage", () => () => (
  <div data-testid="registered-page">RegisteredPage</div>
));
jest.mock("../AccountPage", () => () => (
  <div data-testid="account-page">AccountPage</div>
));
jest.mock("../CreateAgreement", () => () => (
  <div data-testid="create-agreement">CreateAgreement</div>
));
jest.mock("../LogoutComponent", () => () => (
  <button data-testid="logout-component">Logout</button>
));
jest.mock("../CounterSignature", () => () => (
  <div data-testid="counter-signature">CounterSignature</div>
));
jest.mock("../PasswordReset", () => () => (
  <div data-testid="password-reset">PasswordReset</div>
));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  BrowserRouter: ({ children }) => <>{children}</>,
}));

describe("App", () => {
  const renderWithRouter = (initialEntries = ["/"]) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>,
    );

  it("renders Header and Footer on all routes", () => {
    renderWithRouter();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders MainRegLog component on default route", () => {
    renderWithRouter(["/"]);
    expect(screen.getByTestId("main-reg-log")).toBeInTheDocument();
  });

  it("renders RegisteredPage component on /RegisteredPage", () => {
    renderWithRouter(["/RegisteredPage"]);
    expect(screen.getByTestId("registered-page")).toBeInTheDocument();
  });

  it("renders AccountPage component on /AccountPage", () => {
    renderWithRouter(["/AccountPage"]);
    expect(screen.getByTestId("account-page")).toBeInTheDocument();
  });

  it("renders CreateAgreement component on /CreateAgreement", () => {
    renderWithRouter(["/CreateAgreement"]);
    expect(screen.getByTestId("create-agreement")).toBeInTheDocument();
  });

  it("renders LogoutComponent on /LogoutComponent", () => {
    renderWithRouter(["/LogoutComponent"]);
    expect(screen.getByTestId("logout-component")).toBeInTheDocument();
  });

  it("renders CounterSignature component on /CounterSignature", () => {
    renderWithRouter(["/CounterSignature"]);
    expect(screen.getByTestId("counter-signature")).toBeInTheDocument();
  });

  it("renders CounterSignature component on /CounterSignature/:hash", () => {
    renderWithRouter(["/CounterSignature/abc123"]);
    expect(screen.getByTestId("counter-signature")).toBeInTheDocument();
  });

  it("renders PasswordReset component on /reset-password", () => {
    renderWithRouter(["/reset-password"]);
    expect(screen.getByTestId("password-reset")).toBeInTheDocument();
  });
});
