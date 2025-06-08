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
 *     description: Register a new user account with username, email, and password. No authentication required.
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
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Unique username for the account
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Password for the account (minimum 8 characters)
 *             example:
 *               username: "johndoe"
 *               email: "john@example.com"
 *               password: "securepassword123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: "user-abc123"
 *               created_at: "2023-04-01T12:00:00Z"
 *               name: "johndoe"
 *               email: "john@example.com"
 *               type: "USER"
 *               verified: true
 *               profile_color: "#3498db"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Conflict - Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Username or email already exists"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/create', createUserHandler);

/**
 * @swagger
 * /api/auth/check-existence:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Check if a user exists by username or email
 *     description: Check if a user exists with the given username or email (public endpoint for registration validation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username to check (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email to check (optional)
 *             example:
 *               username: "johndoe"
 *               email: "john@example.com"
 *     responses:
 *       200:
 *         description: Check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Whether a user with the provided username or email exists
 *             example:
 *               exists: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/check-existence', readUserByNameOrByEmailHandler);

/**
 * @swagger
 * /api/auth/read-by-name-or-by-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Get a user by username or email
 *     description: Retrieve a user's information by their username or email (requires authentication)
 *     security:
 *       - bearerAuth: []
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
 *                 description: Username or email of the user to retrieve
 *             example:
 *               usernameOrEmail: "johndoe"
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       description: Error message when user not found
 *             examples:
 *               userFound:
 *                 summary: User found
 *                 value:
 *                   id: "user-abc123"
 *                   created_at: "2023-04-01T12:00:00Z"
 *                   name: "johndoe"
 *                   email: "john@example.com"
 *                   type: "USER"
 *                   verified: true
 *                   profile_color: "#3498db"
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   error: "User not found"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/read-by-name-or-by-email', getUserByNameOrEmailHandler);

export default router;
