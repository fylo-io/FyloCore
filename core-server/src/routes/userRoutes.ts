import { Router } from 'express';

import {
  getAvailableUsernamesHandler,
  getUserByIdHandler,
  updateUserProfileHandler,
} from '../controllers/userController';
import upload from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a user's information by their ID (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: "user-abc123"
 *                 created_at: "2023-04-01T12:00:00Z"
 *                 name: "johndoe"
 *                 email: "john@example.com"
 *                 type: "USER"
 *                 verified: true
 *                 profile_color: "#3498db"
 *                 avatar_url: "https://example.com/avatars/johndoe.jpg"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', getUserByIdHandler);

/**
 * @swagger
 * /api/user/sharing:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get available usernames for sharing
 *     description: Retrieve a list of all usernames available for sharing graphs (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available usernames retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: User ID
 *                       name:
 *                         type: string
 *                         description: Username
 *                       profile_color:
 *                         type: string
 *                         description: User's profile color
 *             example:
 *               users:
 *                 - id: "user-abc123"
 *                   name: "johndoe"
 *                   profile_color: "#3498db"
 *                 - id: "user-def456"
 *                   name: "janedoe"
 *                   profile_color: "#e74c3c"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/sharing', getAvailableUsernamesHandler);

/**
 * @swagger
 * /api/user/upload:
 *   post:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update a user's profile color and avatar (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: avatar
 *         type: file
 *         description: User's avatar image
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - profileColor
 *             properties:
 *               userId:
 *                 type: string
 *               profileColor:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/upload', upload.single('avatar'), updateUserProfileHandler);

export default router;
