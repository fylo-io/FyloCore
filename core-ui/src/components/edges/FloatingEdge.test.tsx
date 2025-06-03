import { render, screen } from "@testing-library/react";
import { Position } from "@xyflow/react";
import React from "react";
import FloatingEdge from "./FloatingEdge";

// Mock the necessary dependencies
jest.mock("@xyflow/react", () => ({
  ...jest.requireActual("@xyflow/react"),
  useInternalNode: (id: string) => ({
    id,
    positionAbsolute: { x: 0, y: 0 },
    width: 100,
    height: 50,
    type: "default",
    data: {}
  }),
  useStore: () => 1, // This mocks the zoom level to be 1
  getBezierPath: () => ["M0 0 C0 0, 0 0, 0 0", 0, 0], // Mock return [edgePath, labelX, labelY]
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BaseEdge: ({ path }: { path: string }) => <path d={path} />,
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right"
  }
}));

// Mock the store
jest.mock("../../store/useCommentStore", () => ({
  __esModule: true,
  default: () => ({
    type: "",
    setType: jest.fn(),
    setText: jest.fn(),
    setNodeId: jest.fn(),
    markAsReady: jest.fn()
  })
}));

// Mock utility functions
jest.mock("./utils", () => ({
  getEdgeParams: () => ({
    sx: 0,
    sy: 0,
    tx: 100,
    ty: 100,
    sourcePos: "bottom",
    targetPos: "top",
    controlOffset: 50,
    isTargetLeft: false
  })
}));

describe("FloatingEdge Component", () => {
  const defaultProps = {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    style: {},
    data: {
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      label: "Test Edge",
      data: {}
    },
    markerEnd: "url(#arrow)",
    animated: false,
    selected: false,
    selectable: false,
    deletable: false,
    sourceX: 0,
    sourceY: 0,
    targetX: 0,
    targetY: 0,
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom
  };

  it("renders the edge with label", () => {
    render(<FloatingEdge {...defaultProps} />);
    expect(screen.getByText("Test Edge")).toBeInTheDocument();
  });
});
