import { Router } from 'express';

import { createShareHandler } from '../controllers/shareController';

const router = Router();

/**
 * @swagger
 * /api/share:
 *   post:
 *     tags:
 *       - Sharing
 *     summary: Share a graph with another user
 *     description: Grant access to a graph for another user, allowing them to view and collaborate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - graphId
 *               - targetUsername
 *             properties:
 *               graphId:
 *                 type: string
 *                 description: ID of the graph to share
 *               targetUsername:
 *                 type: string
 *                 description: Username of the user to share the graph with
 *             example:
 *               graphId: "graph-abc123"
 *               targetUsername: "johndoe"
 *     responses:
 *       200:
 *         description: Graph shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Graph successfully shared with johndoe"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Graph or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Graph or target user not found"
 *       409:
 *         description: Graph already shared with user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Graph is already shared with this user"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', createShareHandler);

export default router;
