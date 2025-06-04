# FyloCore Docker Setup

Simple Docker setup for developers to run FyloCore locally.

## For New Developers

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd FyloCore

# Copy environment file templates
cp core-server/.env.example core-server/.env
cp core-ui/.env.example core-ui/.env

# Edit the .env files with your actual API keys (see below)
```

### 2. Required Environment Variables

**core-server/.env** must include:
```env
# Required for AI features
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Required for database
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for authentication
JWT_SECRET=your_jwt_secret_here

# Required for app configuration
APP_URL=http://localhost:3000
```

**core-ui/.env** should include:
```env
# Required for API connection
NEXT_PUBLIC_API_URL=http://localhost:8000

# Required for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Build and Run
```bash
# Easy way
./start-docker.sh

# Manual way
docker-compose -f deploy/docker/docker-compose.dev.yml up --build
```

## What Gets Started

- **Core Server** (Backend): Node.js API server on port 8000
- **Core UI** (Frontend): React application on port 3000

**No additional services required** - everything runs in these two containers.

## Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api-docs

## Stopping the Application

```bash
./stop-docker.sh
# OR
docker-compose -f deploy/docker/docker-compose.dev.yml down
```

## Development Workflow

### Making Changes
1. Edit code in `core-server/` or `core-ui/`
2. Restart containers to see changes:
   ```bash
   docker-compose -f deploy/docker/docker-compose.dev.yml restart
   ```

### Rebuilding After Package Changes
```bash
docker-compose -f deploy/docker/docker-compose.dev.yml up --build
```

### Viewing Logs
```bash
# All services
docker-compose -f deploy/docker/docker-compose.dev.yml logs

# Specific service
docker-compose -f deploy/docker/docker-compose.dev.yml logs core-server
docker-compose -f deploy/docker/docker-compose.dev.yml logs core-ui
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 8000 are not in use
2. **Missing API keys**: Check your `.env` files have valid values
3. **Build failures**: Try `docker system prune` to clean up Docker cache

### Complete Reset
```bash
docker-compose -f deploy/docker/docker-compose.dev.yml down
docker system prune -a
docker-compose -f deploy/docker/docker-compose.dev.yml up --build
```

### Checking Container Status
```bash
docker-compose -f deploy/docker/docker-compose.dev.yml ps
