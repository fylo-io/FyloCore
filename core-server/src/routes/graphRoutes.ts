import { Router } from 'express';

import {
  createGraphHandler,
  deleteGraphHandler,
  getGraphByIdHandler,
  getGraphViewersHandler,
  getPublicGraphsHandler,
  getVisibleGraphsByUserHandler,
} from '../controllers/graphController';

const router = Router();

/**
 * @swagger
 * /api/graph/id/{graphId}:
 *   get:
 *     tags:
 *       - Graphs
 *     summary: Get a graph by ID
 *     description: Retrieve a specific graph by its unique identifier
 *     parameters:
 *       - in: path
 *         name: graphId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the graph to retrieve
 *     responses:
 *       200:
 *         description: Graph retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 graph:
 *                   $ref: '#/components/schemas/FyloGraph'
 *       400:
 *         description: Unable to fetch graph or invalid input
 */
router.get('/id/:graphId', getGraphByIdHandler);

/**
 * @swagger
 * /api/graph/public:
 *   get:
 *     tags:
 *       - Graphs
 *     summary: Get all public graphs
 *     description: Retrieve all public graphs with node count and contributor information
 *     responses:
 *       200:
 *         description: Public graphs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 graphs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     allOf:
 *                       - $ref: '#/components/schemas/FyloGraph'
 *                       - type: object
 *                         properties:
 *                           node_count:
 *                             type: integer
 *                           contributors:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Unable to fetch public graphs
 */
router.get('/public', getPublicGraphsHandler);

/**
 * @swagger
 * /api/graph/user/{userId}:
 *   get:
 *     tags:
 *       - Graphs
 *     summary: Get visible graphs for a user
 *     description: Retrieve all graphs visible to a specific user (owned and shared)
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Visible graphs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 graphs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     allOf:
 *                       - $ref: '#/components/schemas/FyloGraph'
 *                       - type: object
 *                         properties:
 *                           node_count:
 *                             type: integer
 *                           contributors:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Unable to fetch visible graphs or invalid input
 */
router.get('/user/:userId', getVisibleGraphsByUserHandler);

/**
 * @swagger
 * /api/graph/viewers/{graphId}:
 *   get:
 *     tags:
 *       - Graphs
 *     summary: Get graph viewers/contributors
 *     description: Retrieve all users who have access to view a specific graph
 *     parameters:
 *       - in: path
 *         name: graphId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the graph
 *     responses:
 *       200:
 *         description: Graph viewers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 viewers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Unable to fetch viewers or invalid input
 */
router.get('/viewers/:graphId', getGraphViewersHandler);

/**
 * @swagger
 * /api/graph:
 *   post:
 *     tags:
 *       - Graphs
 *     summary: Create a new graph
 *     description: Create a new graph with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - creatorId
 *               - creatorName
 *               - creatorProfileColor
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the graph
 *               description:
 *                 type: string
 *                 description: A description of the graph
 *               creatorId:
 *                 type: string
 *                 description: The ID of the user creating the graph
 *               creatorName:
 *                 type: string
 *                 description: The name of the user creating the graph
 *               creatorProfileColor:
 *                 type: string
 *                 description: The profile color of the user creating the graph
 *               sourceGraphId:
 *                 type: string
 *                 description: Optional ID of a source graph to clone from
 *     responses:
 *       201:
 *         description: Graph created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 graph:
 *                   $ref: '#/components/schemas/FyloGraph'
 *       400:
 *         description: Unable to create graph or invalid input
 */
router.post('/', createGraphHandler);

/**
 * @swagger
 * /api/graph:
 *   delete:
 *     tags:
 *       - Graphs
 *     summary: Delete a graph
 *     description: Delete a graph by its ID
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
 *                 description: The ID of the graph to delete
 *     responses:
 *       200:
 *         description: Graph deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Unable to delete graph or invalid input
 */
router.delete('/', deleteGraphHandler);

export default router;
