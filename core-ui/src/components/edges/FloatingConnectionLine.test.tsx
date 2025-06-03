import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Node, Position, getBezierPath } from "@xyflow/react";
import FloatingConnectionLine from "./FloatingConnectionLine";
import { getNearestPointOnNodeBoundary } from "./utils";

// Mock the dependencies
jest.mock("@xyflow/react", () => ({
  getBezierPath: jest.fn().mockReturnValue(["mockedPath", {}]),
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right"
  }
}));

jest.mock("./utils", () => ({
  getNearestPointOnNodeBoundary: jest.fn().mockReturnValue({ x: 100, y: 100 })
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Setup to suppress warnings about SVG elements
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (
      (typeof args[0] === "string" &&
        args[0].includes("The tag <circle> is unrecognized in this browser")) ||
      args[0].includes("The tag <path> is unrecognized in this browser") ||
      args[0].includes("The tag <g> is unrecognized in this browser")
    ) {
      return;
    }
    originalConsoleError(...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("FloatingConnectionLine", () => {
  const mockFromNode: Node = {
    id: "node1",
    position: { x: 50, y: 50 },
    width: 100,
    height: 50,
    type: "default",
    data: {}
  };

  const defaultProps = {
    toX: 300,
    toY: 200,
    fromX: 100,
    fromY: 75,
    fromNode: mockFromNode
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it("renders nothing when fromNode is null", () => {
    const { container } = render(<FloatingConnectionLine {...defaultProps} fromNode={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("sets localStorage values when fromNode is provided", () => {
    render(<FloatingConnectionLine {...defaultProps} />);

    expect(localStorageMock.setItem).toHaveBeenCalledWith("connecting", "true");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "source_node",
      JSON.stringify(mockFromNode)
    );
  });

  it("uses Position.Top when target is above source node", () => {
    render(
      <FloatingConnectionLine
        {...defaultProps}
        toY={20} // Above the node's center
      />
    );

    expect(getBezierPath).toHaveBeenCalledWith(
      expect.objectContaining({
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom
      })
    );
  });

  it("uses Position.Bottom when target is below source node", () => {
    render(
      <FloatingConnectionLine
        {...defaultProps}
        toY={120} // Below the node's center
      />
    );

    expect(getBezierPath).toHaveBeenCalledWith(
      expect.objectContaining({
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
    );
  });

  it("calls getNearestPointOnNodeBoundary with correct params", () => {
    render(<FloatingConnectionLine {...defaultProps} />);

    expect(getNearestPointOnNodeBoundary).toHaveBeenCalledWith(mockFromNode, {
      x: defaultProps.toX,
      y: defaultProps.toY
    });
  });

  it("renders SVG elements correctly", () => {
    const { container } = render(<FloatingConnectionLine {...defaultProps} />);

    // Check for SVG elements
    const group = container.querySelector("g");
    expect(group).not.toBeNull();

    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);

    const path = container.querySelector("path");
    expect(path).not.toBeNull();

    // Check path attributes - use DOM property names (kebab-case)
    if (path) {
      expect(path).toHaveAttribute("d", "mockedPath");
      expect(path).toHaveAttribute("stroke", "#222");
      expect(path).toHaveAttribute("stroke-width", "1.5");
      expect(path).toHaveAttribute("stroke-dasharray", "5,5");
      expect(path).toHaveClass("animated");
    }
  });

  it("positions source circle at intersection point", () => {
    const { container } = render(<FloatingConnectionLine {...defaultProps} />);

    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThan(0);

    const sourceCircle = circles[0];

    expect(sourceCircle).toHaveAttribute("cx", "100");
    expect(sourceCircle).toHaveAttribute("cy", "100");
  });

  it("positions target circle at toX/toY coordinates", () => {
    const { container } = render(<FloatingConnectionLine {...defaultProps} />);

    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThan(1);

    const targetCircle = circles[1];

    expect(targetCircle).toHaveAttribute("cx", defaultProps.toX.toString());
    expect(targetCircle).toHaveAttribute("cy", defaultProps.toY.toString());
  });
});
