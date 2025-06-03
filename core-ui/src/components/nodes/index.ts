import type { Node } from "@xyflow/react";
import EntityNodeComponent from "./EntityNode";

export interface EntityNodeData {
  title?: string;
  description?: string;
  [key: string]: unknown; // Allows for additional properties
}

export type EntityNode = Node<EntityNodeData>;

export type CustomNodeType = EntityNode;

export const initialNodes: CustomNodeType[] = [
  {
    id: "1",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      title: "Node 1",
      description: "This is the first node"
    }
  },
  {
    id: "2",
    type: "entity",
    position: { x: 200, y: 100 },
    data: {
      title: "Node 2",
      description: "This is the second node"
    }
  }
];

export const nodeTypes = {
  entity: EntityNodeComponent
};
