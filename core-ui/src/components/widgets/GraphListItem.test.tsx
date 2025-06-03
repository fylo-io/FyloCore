import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import GraphListItem from "./GraphListItem";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn()
}));

describe("GraphListItem", () => {
  const graph = {
    id: "1",
    name: "Graph 1",
    description: "This is a test graph"
  };

  const onDelete = jest.fn();
  const onShare = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  it("should render graph name and description", () => {
    render(<GraphListItem graph={graph} isCreated={true} onDelete={onDelete} onShare={onShare} />);

    expect(screen.getByText("Graph 1")).toBeInTheDocument();
    expect(screen.getByText("This is a test graph")).toBeInTheDocument();
  });

  it("should navigate to the graph page when 'Open' button is clicked", () => {
    render(<GraphListItem graph={graph} isCreated={true} onDelete={onDelete} onShare={onShare} />);

    fireEvent.click(screen.getByText("Open"));

    expect(mockPush).toHaveBeenCalledWith(`/graph/${graph.id}`);
  });

  it("should call onShare when 'Share' button is clicked", () => {
    render(<GraphListItem graph={graph} isCreated={true} onDelete={onDelete} onShare={onShare} />);

    fireEvent.click(screen.getByText("Share"));

    expect(onShare).toHaveBeenCalledWith(graph.id);
  });

  it("should call onDelete when 'Delete' button is clicked", () => {
    render(<GraphListItem graph={graph} isCreated={true} onDelete={onDelete} onShare={onShare} />);

    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(graph.id);
  });

  it("should not render 'Share' and 'Delete' buttons when isCreated is false", () => {
    render(<GraphListItem graph={graph} isCreated={false} onDelete={onDelete} onShare={onShare} />);

    expect(screen.queryByText("Share")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });
});
