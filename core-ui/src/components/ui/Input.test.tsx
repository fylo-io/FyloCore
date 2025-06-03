import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input Component", () => {
  test("renders Input with default styles", () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");

    expect(input).toHaveClass("bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400");
    expect(input).toHaveClass("px-3 py-2");
  });

  test("renders Input with custom className", () => {
    render(<Input className="custom-input" placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");

    expect(input).toHaveClass("custom-input");
  });

  test("renders Input with 'large' sizeVariant", () => {
    render(<Input sizeVariant="large" placeholder="Large input" />);

    const input = screen.getByPlaceholderText("Large input");

    expect(input).toHaveClass("px-4 py-3 text-base");
  });

  test("renders Input with 'default' variant", () => {
    render(<Input variant="default" placeholder="Default input" />);

    const input = screen.getByPlaceholderText("Default input");

    expect(input).toHaveClass("bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400");
  });

  test("handles value changes correctly", () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");

    fireEvent.change(input, { target: { value: "Hello, world!" } });

    expect(input).toHaveValue("Hello, world!");
  });
});
