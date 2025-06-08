import { Router } from 'express';

import { getCommentsByGraphIdHandler } from '../controllers/commentController';

const router = Router();

/**
 * @swagger
 * /api/comments/{graphId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments for a graph
 *     description: Retrieve all comments associated with a specific graph ID including author information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GraphId'
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Comment'
 *                       - type: object
 *                         properties:
 *                           author_name:
 *                             type: string
 *                             description: Name of the comment author
 *                           author_profile_color:
 *                             type: string
 *                             description: Profile color of the comment author
 *             example:
 *               comments:
 *                 - id: "comment-abc123"
 *                   graph_id: "graph-xyz789"
 *                   author: "user-abc123"
 *                   author_name: "John Doe"
 *                   author_profile_color: "#3498db"
 *                   text: "This is an insightful connection between concepts"
 *                   created_at: "2023-04-01T12:00:00Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:graphId', getCommentsByGraphIdHandler);

export default router;
