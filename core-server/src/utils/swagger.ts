import { Express } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fylo Core Server API',
      version: '1.0.0',
      description: `
## Fylo Core Server API Documentation

The Fylo Core Server provides a comprehensive API for managing graphs, nodes, edges, documents, users, and real-time collaboration features.

### Authentication
Most endpoints require JWT Bearer token authentication. Include the token in the Authorization header:
\`Authorization: Bearer <your-jwt-token>\`

### Rate Limiting
API requests are rate-limited to ensure fair usage:
- **Authenticated users**: 1000 requests per hour
- **Public endpoints**: 100 requests per hour per IP

### Pagination
List endpoints support pagination using \`offset\` and \`limit\` query parameters:
- \`offset\`: Number of items to skip (default: 0)
- \`limit\`: Number of items per page (default: 20, max: 100)

### WebSocket Events
Real-time features are available through Socket.IO namespaces:
- \`/graph\`: Graph collaboration events
- \`/users\`: User presence and activity events

### Error Handling
All endpoints return consistent error responses with appropriate HTTP status codes and descriptive error messages.
    `,
      contact: {
        name: 'Fylo Support',
        email: 'support@fylo.io',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development Server',
      },
      {
        url: 'https://api-qa.fylogenesis.com',
        description: 'QA server',
      },
      {
        url: 'https://api.fylogenesis.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Additional error details',
            },
            code: {
              type: 'string',
              description: 'Error code for programmatic handling',
            },
          },
        },
        ValidationError: {
          type: 'object',
          required: ['error', 'details'],
          properties: {
            error: {
              type: 'string',
              description: 'Validation error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that failed validation',
                  },
                  message: {
                    type: 'string',
                    description: 'Validation failure message',
                  },
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {},
              description: 'Array of results',
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page number',
                },
                limit: {
                  type: 'integer',
                  description: 'Number of items per page',
                },
                total: {
                  type: 'integer',
                  description: 'Total number of items',
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total number of pages',
                },
              },
            },
          },
        },
        SuccessMessage: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Additional data returned with success response',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input or missing required fields',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized - Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found - Resource does not exist',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation Error - Input validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
      parameters: {
        GraphId: {
          name: 'graphId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Unique identifier of the graph',
        },
        UserId: {
          name: 'userId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Unique identifier of the user',
        },
        Page: {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
          description: 'Page number for pagination',
        },
        Limit: {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
          description: 'Number of items per page',
        },
        NodeId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Unique identifier of the node',
        },
        Username: {
          name: 'username',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Username of the user',
        },
        GraphIdQuery: {
          name: 'graphId',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID of the graph',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    apis: [
      './src/routes/*.ts',
      './src/types/*.ts',
      './src/controllers/*.ts',
      './src/namespaces/*.ts',
      './src/server.ts',
    ],
  },
};

const specs = swaggerJsdoc(options);

// Add a custom doc section for WebSocket documentation
const addWebSocketDocs = (specs: OpenAPIV3.Document): OpenAPIV3.Document => {
  // Create WebSocket Components section if it doesn't exist
  if (!specs.components) {
    specs.components = {};
  }

  if (!specs.components.schemas) {
    specs.components.schemas = {};
  }

  // Add WebSocket connection schema
  specs.components.schemas['WebSocketConnection'] = {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'WebSocket connection URL',
        example: 'ws://localhost:8000/socket.io/?EIO=4&transport=websocket',
      },
      namespaces: {
        type: 'object',
        properties: {
          graph: {
            type: 'string',
            description: 'Namespace for graph operations',
            example: '/graph',
          },
          users: {
            type: 'string',
            description: 'Namespace for user operations',
            example: '/users',
          },
        },
      },
    },
  } as OpenAPIV3.SchemaObject;

  // Add WebSocket event schemas
  specs.components.schemas['GraphWebSocketEvents'] = {
    type: 'object',
    description: 'WebSocket events for graph namespace',
    properties: {
      clientEvents: {
        type: 'object',
        description: 'Events that clients can emit',
        properties: {
          join_room: {
            type: 'object',
            description: 'Join a graph room for real-time updates',
            properties: {
              graphId: { type: 'string' },
              userId: { type: 'string' },
            },
          },
          leave_room: {
            type: 'object',
            description: 'Leave a graph room',
            properties: {
              graphId: { type: 'string' },
            },
          },
          graph_update: {
            type: 'object',
            description: 'Send graph update (add/move/delete nodes/edges)',
            properties: {
              action: { type: 'string', enum: ['ADD_NODE', 'MOVE_NODE', 'ADD_EDGE', 'DELETE_NODE', 'UPDATE_NODE'] },
              graphId: { type: 'string' },
              data: { type: 'object' },
            },
          },
          cursor_position: {
            type: 'object',
            description: 'Update cursor position for collaboration',
            properties: {
              graphId: { type: 'string' },
              userId: { type: 'string' },
              x: { type: 'number' },
              y: { type: 'number' },
              color: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
      serverEvents: {
        type: 'object',
        description: 'Events that server emits to clients',
        properties: {
          graph_update: {
            type: 'object',
            description: 'Broadcast graph updates to all clients in room',
          },
          cursor_position: {
            type: 'object',
            description: 'Broadcast cursor positions to all clients',
          },
          user_joined: {
            type: 'object',
            description: 'Notify when user joins graph room',
          },
          user_left: {
            type: 'object',
            description: 'Notify when user leaves graph room',
          },
          error: {
            type: 'object',
            description: 'Error notification',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
  } as OpenAPIV3.SchemaObject;

  specs.components.schemas['UserWebSocketEvents'] = {
    type: 'object',
    description: 'WebSocket events for user namespace',
    properties: {
      clientEvents: {
        type: 'object',
        description: 'Events that clients can emit',
        properties: {
          join_room: {
            type: 'object',
            description: 'Join a graph room for user presence tracking',
            properties: {
              graphId: { type: 'string' },
              userName: { type: 'string' },
              color: { type: 'string' },
            },
          },
          leave_room: {
            type: 'object',
            description: 'Leave a graph room',
            properties: {
              graphId: { type: 'string' },
            },
          },
        },
      },
      serverEvents: {
        type: 'object',
        description: 'Events that server emits to clients',
        properties: {
          current_joined_users: {
            type: 'object',
            description: 'List of users currently in the graph room',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    color: { type: 'string' },
                  },
                },
              },
            },
          },
          error: {
            type: 'object',
            description: 'Error notification',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
  } as OpenAPIV3.SchemaObject;

  // Add Socket.IO client setup instructions
  if (!specs.paths) {
    specs.paths = {};
  }

  specs.paths['/socket.io-guide'] = {
    get: {
      tags: ['WebSocket'],
      summary: 'Socket.IO Connection Guide',
      description: `
## Socket.IO Connection Guide

To connect to the Fylo WebSocket services, use a Socket.IO client with the following configuration:

### Client setup (JavaScript/TypeScript):

\`\`\`javascript
import { io } from "socket.io-client";

// Connect to main Socket.IO server
const socket = io("http://localhost:8000", {
  transports: ["websocket"],
  autoConnect: true
});

// Connect to specific namespaces
const graphSocket = io("http://localhost:8000/graph");
const usersSocket = io("http://localhost:8000/users");
\`\`\`

### Available Namespaces:

1. **/graph** - For real-time graph manipulation and collaboration
2. **/users** - For tracking user presence and activity

See the detailed documentation for each namespace for specific events and usage.
      `,
      responses: {
        '200': {
          description: 'Guide only - no actual endpoint',
        },
      },
    } as OpenAPIV3.OperationObject,
  };

  // Add cross-reference section to make navigation easier
  specs.paths['/websocket-namespaces'] = {
    get: {
      tags: ['WebSocket'],
      summary: 'WebSocket Namespaces Overview',
      description: `
## WebSocket Namespaces

Fylo's real-time functionality is divided into these namespaces:

### Graph Namespace (/graph)
- **Purpose**: Real-time graph manipulation, node and edge creation/editing
- **Documentation**: See the [Graph WebSocket](/api-docs/#/Graph%20WebSocket) section

### Users Namespace (/users)
- **Purpose**: User presence tracking, showing who's viewing a graph
- **Documentation**: See the [Users WebSocket](/api-docs/#/Users%20WebSocket) section

Each namespace has its own set of events that clients can emit and listen for.
      `,
      responses: {
        '200': {
          description: 'Guide only - no actual endpoint',
        },
      },
    } as OpenAPIV3.OperationObject,
  };

  specs.paths['/graph-websocket-events'] = {
    get: {
      tags: ['WebSocket'],
      summary: 'Graph WebSocket Events',
      description: `
## Graph WebSocket Events

### Client Events

* **join_room**: Join a graph room for real-time updates
* **leave_room**: Leave a graph room
* **graph_update**: Send graph update (add/move/delete nodes/edges)
* **cursor_position**: Update cursor position for collaboration

### Server Events

* **graph_update**: Broadcast graph updates to all clients in room
* **cursor_position**: Broadcast cursor positions to all clients
* **user_joined**: Notify when user joins graph room
* **user_left**: Notify when user leaves graph room
* **error**: Error notification
      `,
      responses: {
        '200': {
          description: 'Guide only - no actual endpoint',
        },
      },
    } as OpenAPIV3.OperationObject,
  };

  specs.paths['/user-websocket-events'] = {
    get: {
      tags: ['WebSocket'],
      summary: 'User WebSocket Events',
      description: `
## User WebSocket Events

### Client Events

* **join_room**: Join a graph room for user presence tracking
* **leave_room**: Leave a graph room

### Server Events

* **current_joined_users**: List of users currently in the graph room
* **error**: Error notification
      `,
      responses: {
        '200': {
          description: 'Guide only - no actual endpoint',
        },
      },
    } as OpenAPIV3.OperationObject,
  };

  return specs;
};

export const setupSwagger = (app: Express): void => {
  // Enhance specs with WebSocket documentation
  const enhancedSpecs = addWebSocketDocs(specs as OpenAPIV3.Document);

  // Serve Swagger documentation at /api-docs
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(enhancedSpecs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Fylo API Documentation',
    }),
  );

  // Serve OpenAPI spec in JSON format at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(enhancedSpecs);
  });
};
