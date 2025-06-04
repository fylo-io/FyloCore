import { createServer } from 'http';

import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';

import { errorMiddleware } from './middleware/errorMiddleware';
import { handleGraphNamespace } from './namespaces/graphNamespace';
import { handleUsersNamespace } from './namespaces/userNamespace';
import authRoutes from './routes/authRoutes';
import commentRoutes from './routes/commentRoutes';
import documentRoutes from './routes/documentRoutes';
import downloadRoutes from './routes/downloadRoutes';
import edgeRoutes from './routes/edgeRoutes';
import graphRoutes from './routes/graphRoutes';
import nodeRoutes from './routes/nodeRoutes';
import noteRoutes from './routes/noteRoutes';
import shareRoutes from './routes/shareRoutes';
import userRoutes from './routes/userRoutes';
import { handleErrors } from './utils/errorHandler';
import { logInfo } from './utils/logger';
import { setupSwagger } from './utils/swagger';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Server health checks
 */

/**
 * @swagger
 * tags:
 *   name: WebSocket
 *   description: Socket.IO real-time communication endpoints
 */

/**
 * @swagger
 * /socket.io:
 *   get:
 *     tags: [WebSocket]
 *     summary: Socket.IO main endpoint
 *     description: |
 *       Socket.IO main connection endpoint. This is the entry point for all Socket.IO connections.
 *       Not meant to be accessed directly via HTTP.
 *     responses:
 *       200:
 *         description: WebSocket upgrade
 */

dotenv.config();

const PORT = process.env.PORT || 8000;

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all APIs
app.use(errorMiddleware);

// Setup Swagger documentation
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/edge', edgeRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/node', nodeRoutes);
app.use('/api/note', noteRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/user', userRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Check if the server is running
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running!
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running!' });
});

// Create HTTP server
const server = createServer(app);

// Integrate Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e8,
});

// Initialize Socket.IO namespaces
handleGraphNamespace(io.of('/graph'));
handleUsersNamespace(io.of('/users'));

// Start server with error handling
server.listen(PORT, (err?: Error) => {
  if (err) {
    handleErrors('Server error:', err);
    process.exit(1);
  }
  logInfo(`Server is running on http://localhost:${PORT}`);
});
