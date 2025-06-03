/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - id
 *         - created_at
 *         - graph_id
 *         - author
 *         - color
 *         - text
 *       properties:
 *         id:
 *           type: string
 *           description: The comment's unique identifier
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the comment was created
 *         graph_id:
 *           type: string
 *           description: The ID of the graph this comment belongs to
 *         node_id:
 *           type: string
 *           description: The ID of the node this comment is attached to (if applicable)
 *         edge_id:
 *           type: string
 *           description: The ID of the edge this comment is attached to (if applicable)
 *         author:
 *           type: string
 *           description: The username or identifier of the comment author
 *         color:
 *           type: string
 *           description: The color associated with this comment (typically matches the author's profile color)
 *         text:
 *           type: string
 *           description: The content of the comment
 */

export interface Comment {
  id: string;
  created_at: Date | string;
  graph_id: string;
  node_id?: string;
  edge_id?: string;
  author: string;
  color: string;
  text: string;
}
