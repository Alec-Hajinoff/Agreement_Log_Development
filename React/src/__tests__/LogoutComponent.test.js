import "mutationobserver-shim";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LogoutComponent from "../LogoutComponent";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
  })
);

describe("LogoutComponent", () => {
  it("should navigate to the home page on successful logout", async () => {
    render(
      <MemoryRouter initialEntries={["./LogoutComponent"]}>
        <LogoutComponent />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    await screen.findByText(/logout/i);

    expect(window.location.pathname).toBe("/");
  });

  it("should log an error if logout fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    );

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(
      <MemoryRouter initialEntries={["./LogoutComponent"]}>
        <LogoutComponent />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    await screen.findByText(/logout/i);

    expect(consoleErrorSpy).toHaveBeenCalledWith("An error occurred during logout.");

    consoleErrorSpy.mockRestore();
  });
});
