# FyloCore API Documentation

Complete REST API and WebSocket documentation for the FyloCore knowledge graph platform.

## 🔗 Quick Links

- **[OpenAPI Specification](openapi.yaml)** - Machine-readable API spec
- **[Authentication Guide](authentication.md)** - JWT and OAuth setup
- **[WebSocket Documentation](websockets.md)** - Real-time collaboration API
- **[Testing Guide](testing.md)** - Postman collections and examples

## 📋 API Overview

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.fylocore.org`

### Content Type
All API requests and responses use `application/json` unless otherwise specified.

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🛠️ Core Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new user account |
| `POST` | `/api/auth/login` | Authenticate user and get JWT |
| `POST` | `/api/auth/refresh` | Refresh JWT token |
| `POST` | `/api/auth/logout` | Invalidate JWT token |
| `GET` | `/api/auth/me` | Get current user profile |

### Graphs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/graphs` | List user's graphs |
| `POST` | `/api/graphs` | Create new graph |
| `GET` | `/api/graphs/:id` | Get graph by ID |
| `PUT` | `/api/graphs/:id` | Update graph |
| `DELETE` | `/api/graphs/:id` | Delete graph |

### Nodes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/graphs/:graphId/nodes` | Get all nodes in graph |
| `POST` | `/api/graphs/:graphId/nodes` | Create new node |
| `GET` | `/api/nodes/:id` | Get node by ID |
| `PUT` | `/api/nodes/:id` | Update node |
| `DELETE` | `/api/nodes/:id` | Delete node |

### Edges
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/graphs/:graphId/edges` | Get all edges in graph |
| `POST` | `/api/graphs/:graphId/edges` | Create new edge |
| `GET` | `/api/edges/:id` | Get edge by ID |
| `PUT` | `/api/edges/:id` | Update edge |
| `DELETE` | `/api/edges/:id` | Delete edge |

### AI Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/analyze-document` | Analyze document with AI |
| `POST` | `/api/ai/generate-nodes` | Generate nodes from text |
| `POST` | `/api/ai/suggest-connections` | Suggest node connections |
| `POST` | `/api/ai/semantic-search` | Search nodes semantically |

### Collaboration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/graphs/:id/collaborators` | List graph collaborators |
| `POST` | `/api/graphs/:id/collaborators` | Add collaborator |
| `DELETE` | `/api/graphs/:id/collaborators/:userId` | Remove collaborator |
| `POST` | `/api/graphs/:id/share` | Generate share link |

## 📊 Data Models

### Graph Object
```json
{
  "id": "graph_123",
  "title": "Climate Change Research",
  "description": "Comprehensive analysis of climate data",
  "creator_id": "user_456",
  "type": "research",
  "created_at": "2024-01-01T00:00:00.000Z",
  "node_count": 25,
  "contributors": [
    {
      "name": "Dr. Jane Smith",
      "profile_color": "#3b82f6"
    }
  ]
}
```

### Node Object
```json
{
  "id": "node_789",
  "graph_id": "graph_123",
  "type": "evidence",
  "position": { "x": 100, "y": 200 },
  "data": {
    "id": "node_789",
    "description": "Temperature data shows 1.5°C increase",
    "node_type": "evidence",
    "citation": {
      "title": "Climate Data Analysis 2023",
      "authors": ["Dr. John Doe"],
      "year": 2023,
      "url": "https://example.com/study"
    },
    "confidence": 0.95,
    "embeddings": [0.1, 0.2, 0.3, "..."]
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Edge Object
```json
{
  "id": "edge_101",
  "graph_id": "graph_123",
  "source": "node_789",
  "target": "node_790",
  "type": "supports",
  "data": {
    "confidence": 0.8,
    "description": "Strong correlation between datasets"
  },
  "style": {
    "color": "#10b981",
    "width": 2
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters

### Pagination
```
GET /api/graphs?page=1&limit=20&sort=created_at&order=desc
```

### Filtering
```
GET /api/graphs?type=research&creator_id=user_456
GET /api/nodes?graph_id=graph_123&node_type=evidence
```

### Search
```
GET /api/graphs?search=climate&fields=title,description
GET /api/nodes?q=temperature&semantic=true
```

## 🚨 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/graphs",
  "method": "POST"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## 🔐 Rate Limiting

### Limits
- **Authenticated**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **AI Endpoints**: 100 requests per hour

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Authentication Test
```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Graph
```bash
curl -X POST http://localhost:8000/api/graphs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Graph","description":"My first graph","type":"research"}'
```

## 📚 Additional Resources

- **[WebSocket API](websockets.md)** - Real-time collaboration
- **[Authentication](authentication.md)** - JWT and OAuth details
- **[Testing Guide](testing.md)** - Postman collections
- **[Schema Validation](../../schemas/README.md)** - JSON Schema specs
- **[Rate Limiting](rate-limiting.md)** - API usage limits

## 🐛 Reporting Issues

Found a bug or have a feature request? 

1. Check existing [GitHub Issues](https://github.com/fylocore/fylocore/issues)
2. Create a new issue with:
   - API endpoint and method
   - Request/response examples
   - Expected vs actual behavior
   - Error messages and logs

---

**Happy coding! 🚀**

For more detailed examples and advanced usage, see the [Testing Guide](testing.md) and [OpenAPI Specification](openapi.yaml).
