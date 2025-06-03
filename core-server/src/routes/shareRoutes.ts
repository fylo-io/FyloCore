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
 *     description: Share a graph with another user using their username
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - graphId
 *               - username
 *             properties:
 *               graphId:
 *                 type: string
 *                 description: ID of the graph to be shared
 *               username:
 *                 type: string
 *                 description: Username of the user to share with
 *     responses:
 *       201:
 *         description: Graph shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Graph shared successfully
 *       400:
 *         description: Invalid input or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 */
router.post('/', createShareHandler);

export default router;
