import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CustomTooltip from "../common/CustomTooltip";

describe("CustomTooltip", () => {
  it("should render the tooltip content when hovered over", async () => {
    render(
      <CustomTooltip content="This is a tooltip">
        <button>Hover me</button>
      </CustomTooltip>
    );

    expect(screen.queryByText("This is a tooltip")).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByText("Hover me"));

    await waitFor(() => screen.getByText("This is a tooltip"));

    expect(screen.getByText("This is a tooltip")).toBeInTheDocument();
  });

  it("should hide the tooltip when hover ends", async () => {
    render(
      <CustomTooltip content="This is a tooltip">
        <button>Hover me</button>
      </CustomTooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Hover me"));

    await waitFor(() => screen.getByText("This is a tooltip"));

    const tooltip = screen.getByText("This is a tooltip");
    expect(tooltip).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText("Hover me"));

    await waitFor(() => {
      expect(screen.queryByText("This is a tooltip")).not.toBeInTheDocument();
    });
  });
});
