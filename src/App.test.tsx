import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("App renders without issue and displays header title", () => {
  render(<App />);

  // Check header title exists
  const title = screen.getByText("Tic Tack Toe");
  expect(title).toBeInTheDocument();
});
