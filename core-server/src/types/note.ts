/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       required:
 *         - id
 *         - created_at
 *         - author
 *         - node_id
 *         - text
 *       properties:
 *         id:
 *           type: string
 *           description: The note's unique identifier
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the note was created
 *         author:
 *           type: string
 *           description: Username of the note author
 *         node_id:
 *           type: string
 *           description: ID of the node this note is associated with
 *         text:
 *           type: string
 *           description: Content of the note
 *       example:
 *         id: "note-123456"
 *         created_at: "2023-04-01T12:00:00Z"
 *         author: "johndoe"
 *         node_id: "node-789012"
 *         text: "This is an important note about this concept."
 */

export interface Note {
  id: string;
  created_at: Date | string;
  author: string;
  node_id: string;
  text: string;
}
