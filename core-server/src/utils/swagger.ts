import { Express } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fylo Server API Documentation',
      version: '1.0.0',
      description: 'Documentation for the Fylo Server REST APIs and WebSocket interfaces',
      contact: {
        name: 'Fylo Team',
        url: 'https://github.com/fylo-io/FyloServer',
        email: 'info@fylo.io',
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
    },
  },
  apis: [
    './src/routes/*.ts',
    './src/types/*.ts',
    './src/controllers/*.ts',
    './src/namespaces/*.ts',
    './src/server.ts',
  ],
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
