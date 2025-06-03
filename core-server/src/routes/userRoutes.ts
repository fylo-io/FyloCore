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
 *     description: Retrieve a user's information by their ID
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's ID
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
 *       400:
 *         description: Unable to fetch user or invalid input
 */
router.get('/', getUserByIdHandler);

/**
 * @swagger
 * /api/user/share:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get available usernames for sharing
 *     description: Get a list of usernames that a graph can be shared with
 *     parameters:
 *       - in: query
 *         name: graphId
 *         schema:
 *           type: string
 *         required: true
 *         description: The graph's ID
 *     responses:
 *       200:
 *         description: Available usernames retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usernames:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Error fetching usernames or invalid input
 */
router.get('/share', getAvailableUsernamesHandler);

/**
 * @swagger
 * /api/user/upload:
 *   post:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update a user's profile color and avatar
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
 *         description: Error updating profile or invalid input
 */
router.post('/upload', upload.single('avatar'), updateUserProfileHandler);

export default router;
