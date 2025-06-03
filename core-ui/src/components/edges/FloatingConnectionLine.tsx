import { Node, Position, getBezierPath } from "@xyflow/react";
import { getNearestPointOnNodeBoundary } from "./utils";

type FloatingConnectionLineProps = {
  toX: number;
  toY: number;
  fromNode: Node | null;
  fromX: number;
  fromY: number;
};

const FloatingConnectionLine = ({ toX, toY, fromY, fromNode }: FloatingConnectionLineProps) => {
  if (!fromNode) {
    return null;
  }

  const toPoint = { x: toX, y: toY };

  // Calculate the vertical center of the source node for directional logic
  const nodeCenterY = fromY + (fromNode.height || 0) / 2;

  let sourcePos: Position;
  if (toY < nodeCenterY) {
    sourcePos = Position.Top;
  } else {
    sourcePos = Position.Bottom;
  }

  // Set target position as the opposite of source position for consistent Bezier curve direction
  let targetPos: Position;
  if (sourcePos === Position.Top) {
    targetPos = Position.Bottom;
  } else {
    targetPos = Position.Top;
  }

  const sourceIntersection = getNearestPointOnNodeBoundary(fromNode, toPoint);

  const [edgePath] = getBezierPath({
    sourceX: sourceIntersection.x,
    sourceY: sourceIntersection.y,
    sourcePosition: sourcePos,
    targetX: toX,
    targetY: toY,
    targetPosition: targetPos,
    curvature: 0.25
  });

  return (
    <g>
      <circle
        cx={sourceIntersection.x}
        cy={sourceIntersection.y}
        fill="#fff"
        r={3}
        stroke="#222"
        strokeWidth={1.5}
      />
      <path
        fill="none"
        stroke="#222"
        strokeWidth={1.5}
        strokeDasharray="5,5"
        className="animated"
        d={edgePath}
      />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
};

export default FloatingConnectionLine;
