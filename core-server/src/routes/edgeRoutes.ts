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
 *     description: Retrieve all edges that belong to a specific graph
 *     parameters:
 *       - in: path
 *         name: graphId
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique ID of the graph
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
 *       400:
 *         description: Unable to fetch edges
 *       500:
 *         description: Server error
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
 *       400:
 *         description: Unable to create edge or invalid input
 *       500:
 *         description: Server error
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
 *       400:
 *         description: Missing source or target
 *       500:
 *         description: Server error
 */
router.post('/connected', checkIfConnectedHandler);

export default router;
