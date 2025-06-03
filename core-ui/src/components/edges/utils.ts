import { MarkerType, Node, Position } from "@xyflow/react";

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

// eslint-disable-next-line
const getNodeCenter = (node: any) => {
  const { width = 0, height = 0 } = node.measured || {};
  const { x = 0, y = 0 } = node.internals?.positionAbsolute || node.positionAbsolute || {};
  return {
    x: x + width / 2,
    y: y + height / 2
  };
};

// eslint-disable-next-line
const isPointInNode = (point: any, node: any) => {
  const { width = 0, height = 0 } = node.measured || {};
  const { x = 0, y = 0 } = node.internals?.positionAbsolute || node.positionAbsolute || {};
  const center = {
    x: x + width / 2,
    y: y + height / 2
  };

  const sx = center.x - width / 2 + 24,
    sy = center.y - height / 2 + 24;
  const ex = center.x + width / 2 - 24,
    ey = center.y + height / 2 - 24;

  if (point.x >= sx && point.x <= ex && point.y >= sy - 24 && point.y <= ey + 24) return true;
  if (point.x >= sx - 24 && point.x <= ex + 24 && point.y >= sy && point.y <= ey) return true;
  if (getDistance(point.x, point.y, sx, sy) <= 24) return true;
  if (getDistance(point.x, point.y, sx, ey) <= 24) return true;
  if (getDistance(point.x, point.y, ex, sy) <= 24) return true;
  if (getDistance(point.x, point.y, ex, ey) <= 24) return true;
  return false;
};

// eslint-disable-next-line
export const getNearestPointOnNodeBoundary = (node: any, point: { x: number; y: number }) => {
  const { width = 0, height = 0 } = node.measured || {};
  const { x = 0, y = 0 } = node.internals?.positionAbsolute || node.positionAbsolute || {};
  const center = {
    x: x + width / 2,
    y: y + height / 2
  };

  let start = { ...center },
    end = { ...point };
  for (let i = 0; i < 100; i++) {
    const mdx = (start.x + end.x) / 2;
    const mdy = (start.y + end.y) / 2;
    if (isPointInNode({ x: mdx, y: mdy }, node)) start = { x: mdx, y: mdy };
    else end = { x: mdx, y: mdy };
  }

  return start;
};

export const getEdgeParams = (source: Node, target: Node) => {
  const sourceCenter = getNodeCenter(source);
  const targetCenter = getNodeCenter(target);

  const sourceIntersection = getNearestPointOnNodeBoundary(source, targetCenter);
  const targetIntersection = getNearestPointOnNodeBoundary(target, sourceCenter);

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  // Determine if the target is to the left or right of the source
  const isTargetLeft = dx < 0;

  // Calculate control point offset based on the distance between nodes
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(distance / 2, 150); // Cap the offset to prevent extreme curves

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos: isTargetLeft ? Position.Left : Position.Right,
    targetPos: isTargetLeft ? Position.Right : Position.Left,
    controlOffset: offset,
    isTargetLeft
  };
};

export const createNodesAndEdges = () => {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: "target", data: { label: "Target" }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: "Source" }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: "target",
      source: `${i}`,
      type: "floating",
      markerEnd: {
        type: MarkerType.Arrow
      }
    });
  }

  return { nodes, edges };
};
