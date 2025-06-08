import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Button } from "./Button";

describe("Button Component", () => {
  test("renders with default variant and size", () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByText("Default Button");

    expect(button).toHaveClass(
      "inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background",
      "bg-primary text-primary-foreground hover:bg-primary/90",
      "px-4 py-2 text-sm"
    );
  });

  test("applies ghost variant styles", () => {
    render(<Button variant="ghost">Ghost Button</Button>);

    const button = screen.getByText("Ghost Button");

    expect(button).toHaveClass(
      "bg-transparent hover:bg-gray-700 text-gray-400",
      "inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background"
    );
  });

  test("applies icon size", () => {
    render(<Button size="icon">Icon Button</Button>);

    const button = screen.getByText("Icon Button");

    expect(button).toHaveClass("h-10 w-10 p-2");
  });

  test("renders with custom className", () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByText("Custom Button");

    expect(button).toHaveClass("custom-class");
  });

  test("fires click event", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByText("Click Me");

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
