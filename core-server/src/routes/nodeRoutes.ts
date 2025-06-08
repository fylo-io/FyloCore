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
 *     description: Retrieve all nodes associated with a specific graph ID including their positions and content
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GraphId'
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
 *             example:
 *               nodes:
 *                 - id: "node-abc123"
 *                   graph_id: "graph-xyz789"
 *                   title: "AI Research Paper"
 *                   content: "Important findings about neural networks"
 *                   type: "document"
 *                   x: 100
 *                   y: 200
 *                   width: 300
 *                   height: 150
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
router.get('/:graphId', getNodesByGraphIdHandler);

/**
 * @swagger
 * /api/node:
 *   post:
 *     tags:
 *       - Nodes
 *     summary: Create a new node
 *     description: Create a new node in a graph
 *     security:
 *       - bearerAuth: []
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NodeId'
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NodeId'
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', deleteNodeHandler);

export default router;
