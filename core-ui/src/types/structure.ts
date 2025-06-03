export interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  count: number;
  x: number;
  y: number;
}

export interface Node {
  id: string;
  title: string;
  description: string;
  type: string;
  connectedNodeIds: string[];
  childNodeIds: string[];
  parentId: string;
  x: number;
  y: number;
}
