import { render, screen } from '@testing-library/react';
import React from 'react';
import Main from '../Main.js';

test("Main component renders without crashing", () => {
    const { container } = render(<Main />);
    expect(container).toBeInTheDocument();
  });
  
  test("Main component contains the correct text", () => {
    render(<Main />);
    const textElement = screen.getByText(/Climate Bind is a web application that enables digital parametri/i);
    expect(textElement).toBeInTheDocument();
  });
