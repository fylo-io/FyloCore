import { Namespace, Socket } from 'socket.io';

import { handleErrors } from '../utils/errorHandler';

/**
 * @swagger
 * tags:
 *   name: Users WebSocket
 *   description: WebSocket events for user presence and collaboration
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPresence:
 *       type: object
 *       required:
 *         - name
 *         - color
 *       properties:
 *         name:
 *           type: string
 *           description: Username of the connected user
 *         color:
 *           type: string
 *           description: Color associated with the user
 */

// Use a Set to prevent duplicate user IDs and ensure efficient add/remove operations
const viewers = new Map<string, Set<string>>();
const colors = new Map<string, string>();

/**
 * Handles the users namespace for Socket.IO
 * @param usersNamespace - Socket.IO namespace for user operations
 *
 * @swagger
 * /users:
 *   get:
 *     tags: [Users WebSocket]
 *     summary: WebSocket endpoint for user presence
 *     description: |
 *       This is a Socket.IO namespace endpoint for tracking user presence in graph rooms.
 *       Connect to this endpoint using Socket.IO client to see who is viewing a graph.
 *
 *       **Events emitted by client:**
 *       - `join_room`: Join a specific graph room and announce presence
 *       - `leave_room`: Leave a specific graph room
 *
 *       **Events emitted by server:**
 *       - `current_joined_users`: List of users currently in the graph room
 *       - `error`: Error notification
 */
export const handleUsersNamespace = (usersNamespace: Namespace): void => {
  usersNamespace.on('connection', (socket: Socket) => {
    // Store the user's current rooms to handle disconnections
    const userRooms = new Set<string>();

    /**
     * @swagger
     * /users#join_room:
     *   post:
     *     tags: [Users WebSocket]
     *     summary: Join a graph room
     *     description: |
     *       Socket event to join a graph room and announce user presence.
     *
     *       **Event name:** `join_room`
     *
     *       **Response events:**
     *       - `current_joined_users`: List of users currently in the graph room
     *       - `error`: Error message if something went wrong
     *     parameters:
     *       - name: graphId
     *         description: ID of the graph to join
     *         required: true
     *         schema:
     *           type: string
     *       - name: userName
     *         description: Username of the user joining
     *         required: true
     *         schema:
     *           type: string
     *       - name: color
     *         description: Color associated with the user
     *         required: true
     *         schema:
     *           type: string
     */
    socket.on('join_room', (graphId: string, userName: string, color: string) => {
      try {
        if (!graphId || !userName) {
          socket.emit('error', 'Invalid graphId or userName');
          return;
        }

        if (!viewers.has(graphId)) {
          viewers.set(graphId, new Set());
        }

        const userSet = viewers.get(graphId)!;
        userSet.add(userName);
        colors.set(userName, color);

        socket.join(graphId);
        userRooms.add(graphId);

        emitCurrentUsers(graphId, usersNamespace);
      } catch (error) {
        handleErrors('Error joining room:', error as Error);
      }
    });

    /**
     * @swagger
     * /users#leave_room:
     *   post:
     *     tags: [Users WebSocket]
     *     summary: Leave a graph room
     *     description: |
     *       Socket event to leave a graph room and remove user presence.
     *
     *       **Event name:** `leave_room`
     *
     *       **Response events:**
     *       - `current_joined_users`: Updated list of users currently in the graph room
     *     parameters:
     *       - name: graphId
     *         description: ID of the graph to leave
     *         required: true
     *         schema:
     *           type: string
     *       - name: userName
     *         description: Username of the user leaving
     *         required: true
     *         schema:
     *           type: string
     */
    socket.on('leave_room', (graphId: string, userName: string) => {
      try {
        const userSet = viewers.get(graphId);
        if (userSet) {
          userSet.delete(userName);
          if (userSet.size === 0) viewers.delete(graphId);
        }

        socket.leave(graphId);
        userRooms.delete(graphId);

        emitCurrentUsers(graphId, usersNamespace);
      } catch (error) {
        handleErrors('Error leaving room:', error as Error);
      }
    });

    /**
     * Handle socket disconnection
     */
    socket.on('disconnect', () => {
      userRooms.forEach((graphId) => {
        const userSet = viewers.get(graphId);
        if (userSet) userSet.delete(socket.data.userName);
        if (userSet && userSet.size === 0) viewers.delete(graphId);
        emitCurrentUsers(graphId, usersNamespace);
      });
    });
  });
};

/**
 * Emit current users in a graph room to all users in the room
 * @param graphId - ID of the graph room
 * @param usersNamespace - Socket.IO namespace for user operations
 */
const emitCurrentUsers = (graphId: string, usersNamespace: Namespace) => {
  const currentUsers = Array.from(viewers.get(graphId) || []);
  usersNamespace.to(graphId).emit(
    'current_joined_users',
    currentUsers.map((user) => ({
      name: user,
      color: colors.get(user),
    })),
  );
};
