import { EventEmitter } from 'events';

import WebSocket from 'ws';

import { handleErrors } from './errorHandler';
import { logInfo } from './logger';

export const websocketEvents = new EventEmitter();
const pythonWebSocketUrl: string = process.env.PYTHON_WEBSOCKET_URL || 'default_url';

let socket: WebSocket | null = null;

/**
 * Connects to the WebSocket server.
 * @param url The WebSocket server URL.
 */
export const connectWebSocket = (url: string = pythonWebSocketUrl): void => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    logInfo('WebSocket is already connected.');
    return;
  }

  socket = new WebSocket(url);

  socket.on('open', () => {
    logInfo('WebSocket connection established!');
    websocketEvents.emit('connected');
  });

  socket.on('message', (data) => {
    const message = data.toString();
    try {
      websocketEvents.emit('chat', message);
      if (message.includes('chat_completion')) {
        websocketEvents.emit('chat_complete', true);
      }
      if (message.includes('node_enrichment_update')) {
        websocketEvents.emit('node_enrichment_update', message);
      }
      // Handle graph update events
      if (message.includes('graph_update')) {
        try {
          const parsedData = JSON.parse(message);
          if (parsedData.type === 'graph_update' && parsedData.data) {
            // Extract graph_id from either the data object or the top-level object
            const graphId = parsedData.data.graph_id || parsedData.graph_id || null;
            websocketEvents.emit('graph_update', graphId, parsedData.data);
          }
        } catch (parseError) {
          logInfo(`Error parsing graph_update message: ${parseError}`);
        }
      }
    } catch (error) {
      websocketEvents.emit('error', error);
    }
  });

  socket.on('close', () => {
    logInfo('WebSocket connection closed');
    websocketEvents.emit('disconnected');
  });

  socket.on('error', (error) => {
    logInfo(`WebSocket error: ${error.message}`);
    // Optional reconnection logic
    socket = null;
    reconnectWebSocket();
  });
};

/**
 * Attempts to reconnect the WebSocket if the connection is lost.
 */
const reconnectWebSocket = (): void => {
  if (
    !socket ||
    socket.readyState === WebSocket.CLOSING ||
    socket.readyState === WebSocket.CLOSED
  ) {
    connectWebSocket();
  }
};

/**
 * Sends a message to the WebSocket server.
 * @param event The event type (e.g., 'chat').
 * @param payload The message payload.
 */
export const sendMessage = (event: string, payload: Record<string, unknown>): void => {
  const message = JSON.stringify({ event, ...payload });

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    handleErrors('WebSocket is not connected! Attempting to reconnect...');
    connectWebSocket(); // Reconnect WebSocket

    // Use a promise to ensure that the socket is connected before sending the message
    websocketEvents.once('connected', () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      } else {
        handleErrors('WebSocket reconnection failed!');
      }
    });
  }
};

/**
 * Disconnects from the WebSocket server.
 */
export const disconnectWebSocket = (): void => {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
      logInfo('WebSocket connection closed manually');
    }
    socket = null;
  }
};
