import { Router } from 'express';

import {
  checkIfConnectedHandler,
  createNewEdgeHandler,
  getEdgesByGraphIdHandler,
} from '../controllers/edgeController';

const router = Router();

/**
 * @swagger
 * /api/edge/{graphId}:
 *   get:
 *     tags:
 *       - Edges
 *     summary: Get all edges for a graph
 *     description: Retrieve all edges (connections) associated with a specific graph ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GraphId'
 *     responses:
 *       200:
 *         description: Edges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 edges:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FyloEdge'
 *             example:
 *               edges:
 *                 - id: "edge-abc123"
 *                   graph_id: "graph-xyz789"
 *                   source_node_id: "node-source123"
 *                   target_node_id: "node-target456"
 *                   type: "relates_to"
 *                   label: "influences"
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
router.get('/:graphId', getEdgesByGraphIdHandler);

/**
 * @swagger
 * /api/edge:
 *   post:
 *     tags:
 *       - Edges
 *     summary: Create a new edge
 *     description: Create a new connection between two nodes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FyloEdge'
 *     responses:
 *       201:
 *         description: Edge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 edge:
 *                   $ref: '#/components/schemas/FyloEdge'
 *             example:
 *               edge:
 *                 id: "edge-abc123"
 *                 graph_id: "graph-xyz789"
 *                 source_node_id: "node-source123"
 *                 target_node_id: "node-target456"
 *                 type: "relates_to"
 *                 label: "influences"
 *                 created_at: "2023-04-01T12:00:00Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', createNewEdgeHandler);

/**
 * @swagger
 * /api/edge/connected:
 *   post:
 *     tags:
 *       - Edges
 *     summary: Check if two nodes are connected
 *     description: Verify if there is an edge between two specific nodes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source
 *               - target
 *             properties:
 *               source:
 *                 type: string
 *                 description: ID of the source node
 *               target:
 *                 type: string
 *                 description: ID of the target node
 *     responses:
 *       200:
 *         description: Connection check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   description: Whether the nodes are connected
 *             example:
 *               connected: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/connected', checkIfConnectedHandler);

export default router;
