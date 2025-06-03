import { Router } from 'express';

import {
  createNodeHandler,
  deleteNodeHandler,
  getNodesByGraphIdHandler,
  saveNodePositionsHandler,
  updateNodeHandler,
  updateNodeHandlerConference,
} from '../controllers/nodeController';

const router = Router();

/**
 * @swagger
 * /api/node/{graphId}:
 *   get:
 *     tags:
 *       - Nodes
 *     summary: Get all nodes for a graph
 *     description: Retrieve all nodes associated with a specific graph ID
 *     parameters:
 *       - in: path
 *         name: graphId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the graph
 *     responses:
 *       200:
 *         description: Nodes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FyloNode'
 *       400:
 *         description: Bad request, unable to fetch nodes or missing graph ID
 *       500:
 *         description: Server error
 */
router.get('/:graphId', getNodesByGraphIdHandler);

/**
 * @swagger
 * /api/node:
 *   post:
 *     tags:
 *       - Nodes
 *     summary: Create a new node
 *     description: Create a new node in a graph
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FyloNode'
 *     responses:
 *       201:
 *         description: Node created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 node:
 *                   $ref: '#/components/schemas/FyloNode'
 *       400:
 *         description: Bad request, unable to create node or invalid data
 *       500:
 *         description: Server error
 */
router.post('/', createNodeHandler);

/**
 * @swagger
 * /api/node/saveNodePositions:
 *   post:
 *     tags:
 *       - Nodes
 *     summary: Save node positions
 *     description: Save the positions of multiple nodes at once
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nodes
 *             properties:
 *               nodes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - position
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Node ID
 *                     position:
 *                       type: object
 *                       properties:
 *                         x:
 *                           type: number
 *                         y:
 *                           type: number
 *     responses:
 *       200:
 *         description: Node positions saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request, missing data
 *       500:
 *         description: Server error
 */
router.post('/saveNodePositions', saveNodePositionsHandler);

/**
 * @swagger
 * /api/node:
 *   put:
 *     tags:
 *       - Nodes
 *     summary: Update a node
 *     description: Update a node's data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Node ID
 *               graph_id:
 *                 type: string
 *                 description: Graph ID
 *               type:
 *                 type: string
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *               data:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                   node_type:
 *                     type: string
 *                   document_content:
 *                     type: string
 *     responses:
 *       200:
 *         description: Node updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 node:
 *                   $ref: '#/components/schemas/FyloNode'
 *       400:
 *         description: Bad request, unable to update node or invalid data
 *       500:
 *         description: Server error
 */
router.put('/', updateNodeHandler);

/**
 * @swagger
 * /api/node/{id}:
 *   put:
 *     tags:
 *       - Nodes
 *     summary: Update a node for the conference
 *     description: Update a node's data for the conference with specific permissions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the node to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                   node_type:
 *                     type: string
 *                   document_content:
 *                     type: string
 *     responses:
 *       200:
 *         description: Node updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 node:
 *                   $ref: '#/components/schemas/FyloNode'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request, unable to update node or invalid data
 *       403:
 *         description: Unauthorized to update this node
 *       404:
 *         description: Node or graph not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateNodeHandlerConference);

/**
 * @swagger
 * /api/node/{id}:
 *   delete:
 *     tags:
 *       - Nodes
 *     summary: Delete a node
 *     description: Delete a node and its associated edges
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the node to delete
 *     responses:
 *       200:
 *         description: Node deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 graphId:
 *                   type: string
 *                   description: The ID of the graph the node belonged to
 *                 refrencedGraphId:
 *                   type: string
 *                   nullable: true
 *                   description: The ID of the source graph, if any
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request, missing node ID
 *       403:
 *         description: Unauthorized to delete this node
 *       404:
 *         description: Node or graph not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteNodeHandler);

export default router;
