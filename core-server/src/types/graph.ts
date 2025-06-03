import { GraphType } from '../consts';

import { Comment } from './comment';

/**
 * @swagger
 * components:
 *   schemas:
 *     GraphType:
 *       type: string
 *       enum: [PUBLIC, PRIVATE]
 *       description: Type of graph visibility
 *
 *     FyloGraph:
 *       type: object
 *       required:
 *         - id
 *         - created_at
 *         - title
 *         - description
 *         - creator_id
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: The graph's unique identifier
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the graph was created
 *         title:
 *           type: string
 *           description: The title of the graph
 *         description:
 *           type: string
 *           description: A description of what the graph represents
 *         creator_id:
 *           type: string
 *           description: The user ID of the creator
 *         type:
 *           $ref: '#/components/schemas/GraphType'
 *         source_graph_id:
 *           type: string
 *           description: ID of the source graph if this is a clone/fork
 *
 *     EnhancedGraph:
 *       allOf:
 *         - $ref: '#/components/schemas/FyloGraph'
 *         - type: object
 *           properties:
 *             node_count:
 *               type: integer
 *               description: Total number of nodes in the graph
 *             contributors:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProfile'
 *               description: Users who have access to the graph
 */

export interface FyloGraph {
  id: string;
  created_at: Date | string;
  title: string;
  description: string;
  creator_id: string;
  type: GraphType;
  source_graph_id?: string;
  node_count: number;
  contributors?: {
    name: string;
    profile_color: string;
  }[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Citation:
 *       type: object
 *       properties:
 *         ref_id:
 *           type: string
 *           description: Reference ID for the citation
 *         title:
 *           type: string
 *           description: Title of the cited work
 *         doi:
 *           type: string
 *           description: Digital Object Identifier for the citation
 *
 *     FyloNode:
 *       type: object
 *       required:
 *         - id
 *         - created_at
 *         - graph_id
 *         - type
 *         - position
 *         - data
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the node
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the node was created
 *         graph_id:
 *           type: string
 *           description: ID of the graph this node belongs to
 *         type:
 *           type: string
 *           description: Type of the node
 *         position:
 *           type: object
 *           required:
 *             - x
 *             - y
 *           properties:
 *             x:
 *               type: number
 *               description: X coordinate of the node position
 *             y:
 *               type: number
 *               description: Y coordinate of the node position
 *         data:
 *           type: object
 *           required:
 *             - id
 *             - description
 *             - node_type
 *           properties:
 *             id:
 *               type: string
 *               description: ID reference for the node data
 *             description:
 *               type: string
 *               description: Content description of the node
 *             node_type:
 *               type: string
 *               description: Type classification of the node
 *             is_moving:
 *               type: boolean
 *               description: Flag indicating if the node is being moved
 *             picker_color:
 *               type: string
 *               description: Color associated with the node
 *             is_root:
 *               type: boolean
 *               description: Flag indicating if this is a root node
 *             document_content:
 *               type: string
 *               description: Document content associated with the node
 *             comments:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *               description: Array of comments associated with the node
 *             citation:
 *               $ref: '#/components/schemas/Citation'
 *         measured:
 *           type: object
 *           properties:
 *             width:
 *               type: number
 *               description: Measured width of the node
 *             height:
 *               type: number
 *               description: Measured height of the node
 *         selected:
 *           type: boolean
 *           description: Flag indicating if the node is selected
 *         dragging:
 *           type: boolean
 *           description: Flag indicating if the node is being dragged
 *         hidden:
 *           type: boolean
 *           description: Flag indicating if the node is hidden
 */

interface Citation {
  ref_id?: string;
  title?: string;
  year?: number;
  doi?: string;
  authors?: string[];
  link?: string;
}

export interface FyloNode {
  id: string;
  created_at: Date | string;
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
    citation?: Citation;
    citations?: Citation[];
    confidence_score?: number;
  };
  measured?: {
    width: number;
    height: number;
  };
  selected?: boolean;
  dragging?: boolean;
  hidden?: boolean;
  embeddings?: number[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the comment
 *         user_id:
 *           type: string
 *           description: ID of the user who created the comment
 *         text:
 *           type: string
 *           description: Content of the comment
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the comment was created
 *
 *     FyloEdge:
 *       type: object
 *       required:
 *         - graph_id
 *         - type
 *         - source
 *         - target
 *         - data
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the edge
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the edge was created
 *         graph_id:
 *           type: string
 *           description: ID of the graph this edge belongs to
 *         type:
 *           type: string
 *           description: Type of the edge (e.g., 'default', 'custom')
 *         source:
 *           type: string
 *           description: ID of the source node
 *         target:
 *           type: string
 *           description: ID of the target node
 *         data:
 *           type: object
 *           required:
 *             - label
 *             - description
 *           properties:
 *             label:
 *               type: string
 *               description: Short label for the edge
 *             description:
 *               type: string
 *               description: Detailed description of the relationship
 *             comments:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *               description: Comments attached to this edge
 */

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
  };
}
