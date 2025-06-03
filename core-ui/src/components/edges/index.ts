import type { Edge, EdgeTypes } from "@xyflow/react";

import FloatingEdge from "./FloatingEdge";

export interface FloatingEdgeData {
  label: string;
  [key: string]: unknown;
}

export type FloatingEdgeType = Edge<FloatingEdgeData>;

export type CustomEdgeType = FloatingEdgeType;

export const edgeTypes: EdgeTypes = {
  floating: FloatingEdge as unknown as EdgeTypes[string] // Necessary casting
};
