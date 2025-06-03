import { Router } from 'express';

import { getCommentsByGraphIdHandler } from '../controllers/commentController';

const router = Router();

/**
 * @swagger
 * /api/comments/{graphId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments by graph ID
 *     description: Retrieve all comments associated with a specific graph
 *     parameters:
 *       - in: path
 *         name: graphId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the graph to fetch comments for
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
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Unable to fetch comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/:graphId', getCommentsByGraphIdHandler);

export default router;
