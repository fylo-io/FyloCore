import { render, screen } from "@testing-library/react";
import { ScrollArea } from "./ScrollArea";

describe("ScrollArea Component", () => {
  test("renders ScrollArea with content", () => {
    render(
      <ScrollArea>
        <div style={{ height: "1000px", width: "1000px" }}>Scrollable content</div>
      </ScrollArea>
    );

    const content = screen.getByText("Scrollable content");
    expect(content).toBeInTheDocument();
  });
});
