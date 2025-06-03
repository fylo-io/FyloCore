import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge Component", () => {
  test("renders with default variant", () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText("Default Badge");

    expect(badge).toHaveClass(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
    );
  });

  test("applies secondary variant styles", () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);

    const badge = screen.getByText("Secondary Badge");

    expect(badge).toHaveClass(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
    );
  });

  test("applies destructive variant styles", () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);

    const badge = screen.getByText("Destructive Badge");

    expect(badge).toHaveClass(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80"
    );
  });

  test("applies outline variant styles", () => {
    render(<Badge variant="outline">Outline Badge</Badge>);

    const badge = screen.getByText("Outline Badge");

    expect(badge).toHaveClass(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "text-foreground"
    );
  });

  test("renders with custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);

    const badge = screen.getByText("Custom Badge");

    expect(badge).toHaveClass("custom-class");
  });
});
