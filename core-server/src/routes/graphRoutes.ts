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
 *     description: Retrieve a specific graph by its unique identifier with all associated nodes and edges
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GraphId'
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
 *             example:
 *               graph:
 *                 id: "graph-abc123"
 *                 name: "Research Project Graph"
 *                 description: "Graph for tracking research papers and concepts"
 *                 created_at: "2023-04-01T12:00:00Z"
 *                 is_public: false
 *                 owner_id: "user-xyz789"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
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
 *             example:
 *               graphs:
 *                 - id: "graph-abc123"
 *                   name: "Research Project Graph"
 *                   description: "Graph for tracking research papers and concepts"
 *                   created_at: "2023-04-01T12:00:00Z"
 *                   is_public: true
 *                   owner_id: "user-xyz789"
 *                   node_count: 10
 *                   contributors:
 *                     - id: "user-xyz789"
 *                       name: "John Doe"
 *                       profile_color: "#3498db"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
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
 *             example:
 *               graphs:
 *                 - id: "graph-abc123"
 *                   name: "Research Project Graph"
 *                   description: "Graph for tracking research papers and concepts"
 *                   created_at: "2023-04-01T12:00:00Z"
 *                   is_public: false
 *                   owner_id: "user-xyz789"
 *                   node_count: 10
 *                   contributors:
 *                     - id: "user-xyz789"
 *                       name: "John Doe"
 *                       profile_color: "#3498db"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GraphId'
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
 *             example:
 *               viewers:
 *                 - id: "user-xyz789"
 *                   name: "John Doe"
 *                   profile_color: "#3498db"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     security:
 *       - bearerAuth: []
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
 *             example:
 *               title: "Research Project Graph"
 *               description: "Graph for tracking research papers and concepts"
 *               creatorId: "user-xyz789"
 *               creatorName: "John Doe"
 *               creatorProfileColor: "#3498db"
 *               sourceGraphId: "graph-abc123"
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
 *             example:
 *               graph:
 *                 id: "graph-abc123"
 *                 name: "Research Project Graph"
 *                 description: "Graph for tracking research papers and concepts"
 *                 created_at: "2023-04-01T12:00:00Z"
 *                 is_public: false
 *                 owner_id: "user-xyz789"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *                 description: The ID of the graph to delete
 *             example:
 *               id: "graph-abc123"
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
 *             example:
 *               message: "Graph deleted successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/', deleteGraphHandler);

export default router;
