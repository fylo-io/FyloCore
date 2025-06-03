import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";

describe("Card Components", () => {
  test("renders Card with default styles", () => {
    render(<Card>Card Content</Card>);

    const card = screen.getByText("Card Content");

    expect(card).toHaveClass("rounded-lg border bg-card text-card-foreground shadow-sm");
  });

  test("renders Card with custom className", () => {
    render(<Card className="custom-card">Card Content</Card>);

    const card = screen.getByText("Card Content");

    expect(card).toHaveClass("custom-card");
  });

  test("renders CardHeader with default styles", () => {
    render(<CardHeader>Header Content</CardHeader>);

    const header = screen.getByText("Header Content");

    expect(header).toHaveClass("flex flex-col space-y-1.5 p-6");
  });

  test("renders CardTitle with default styles", () => {
    render(<CardTitle>Card Title</CardTitle>);

    const title = screen.getByText("Card Title");

    expect(title).toHaveClass("text-2xl font-semibold leading-none tracking-tight");
  });

  test("renders CardDescription with default styles", () => {
    render(<CardDescription>Description Text</CardDescription>);

    const description = screen.getByText("Description Text");

    expect(description).toHaveClass("text-sm text-muted-foreground");
  });

  test("renders CardContent with default styles", () => {
    render(<CardContent>Content Text</CardContent>);

    const content = screen.getByText("Content Text");

    expect(content).toHaveClass("p-6 pt-0");
  });

  test("renders CardFooter with default styles", () => {
    render(<CardFooter>Footer Content</CardFooter>);

    const footer = screen.getByText("Footer Content");

    expect(footer).toHaveClass("flex items-center p-6 pt-0");
  });

  test("renders CardFooter with custom className", () => {
    render(<CardFooter className="custom-footer">Footer Content</CardFooter>);

    const footer = screen.getByText("Footer Content");

    expect(footer).toHaveClass("custom-footer");
  });
});
