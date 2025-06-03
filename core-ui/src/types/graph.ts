import { Comment } from "@/types/comment";

export interface FyloGraph {
  id: string;
  created_at: Date;
  title: string;
  description: string;
  creator_id: string;
  type?: string;
  source_graph_id?: string;
  node_count?: number;
  contributors?: {
    name: string;
    profile_color: string;
  }[];
}

export interface FyloNode {
  id: string;
  created_at?: Date;
  graph_id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    id: string;
    description: string;
    node_type: string;
    is_moving?: boolean;
    picker_color?: string;
    is_root?: boolean;
    document_content?: string;
    comments?: Comment[];
    reference?: boolean;
    locked?: boolean;
  };
  measured?: {
    width: number;
    height: number;
  };
  selected?: boolean;
  dragging?: boolean;
  hidden?: boolean;
}

export interface FyloEdge {
  id: string;
  created_at?: Date;
  graph_id: string;
  type: string;
  source: string;
  target: string;
  data: {
    label: string;
    description: string;
    comments?: Comment[];
    reference?: boolean;
  };
}
