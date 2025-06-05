import { Router } from 'express';

import {
  createUserHandler,
  readUserByNameOrByEmailHandler,
  getUserByNameOrEmailHandler,
} from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /api/auth/create:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a new user
 *     description: Register a new user with username, email, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Unable to create user or invalid input
 *       500:
 *         description: Server error
 */
router.post('/create', createUserHandler);

/**
 * @swagger
 * /api/auth/read-by-name-or-by-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Check if a user exists by username or email
 *     description: Check if a user exists with the given username or email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
router.post('/read-by-name-or-by-email', readUserByNameOrByEmailHandler);

/**
 * @swagger
 * /api/auth/read-by-name-or-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Get a user by username or email
 *     description: Retrieve a user's information by their username or email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: User information retrieved successfully or user not found
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.post('/read-by-name-or-email', getUserByNameOrEmailHandler);

export default router;
