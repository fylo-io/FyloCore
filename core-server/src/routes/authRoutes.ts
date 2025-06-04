import { Router } from 'express';

import {
  createGoogleUserHandler,
  createUserHandler,
  readGoogleUserHandler,
  readUserByNameOrByEmailHandler,
  readUserByNameOrEmailHandler,
  verifyEmailHandler,
  sendPasswordResetEmailHandler,
  resetPasswordHandler,
  validateResetTokenHandler,
} from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /api/auth/read-google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get a Google user by email
 *     description: Retrieve a Google user's information by their email address
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: The email address of the Google user
 *     responses:
 *       200:
 *         description: Google user found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Unable to read Google user or invalid input
 *       500:
 *         description: Server error
 */
router.get('/read-google', readGoogleUserHandler);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify a user's email address
 *     description: Verify a user's email using a token sent to their email
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT token for email verification
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token or email already verified
 */
router.get('/verify-email', verifyEmailHandler);

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
 * /api/auth/create-google:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a new Google user
 *     description: Register a new user with Google authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Google user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       200:
 *         description: Google user already exists
 *       400:
 *         description: Unable to create Google user
 *       500:
 *         description: Server error
 */
router.post('/create-google', createGoogleUserHandler);

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
router.post('/read-by-name-or-email', readUserByNameOrEmailHandler);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Send a password reset email
 *     description: Send a password reset email to the user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: Unable to send password reset email or invalid input
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', sendPasswordResetEmailHandler);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset a user's password
 *     description: Reset a user's password using a token sent to their email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token or invalid input
 *       500:
 *         description: Server error
 */
router.post('/reset-password', resetPasswordHandler);

/**
 * @swagger
 * /api/auth/validate-reset-token:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Validate a password reset token
 *     description: Validate a password reset token sent to the user's email
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/validate-reset-token', validateResetTokenHandler);

export default router;
