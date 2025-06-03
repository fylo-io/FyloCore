import { render, screen } from "@testing-library/react";
import { ScrollArea } from "./ScrollArea";

describe("ScrollArea Component", () => {
  test("renders ScrollArea with children", () => {
    render(
      <ScrollArea>
        <div>Scrollable Content</div>
      </ScrollArea>
    );

    const content = screen.getByText("Scrollable Content");
    expect(content).toBeInTheDocument();
  });
});
