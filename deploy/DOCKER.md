# FyloCore Docker Setup

Simple Docker setup for developers to run FyloCore locally with PostgreSQL.

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

# PostgreSQL database (automatically configured in Docker)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fylocore
DB_USER=fylocore
DB_PASSWORD=fylocore_password

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

# Optional: Zotero integration
ZOTERO_CLIENT_KEY=your_zotero_client_key
ZOTERO_CLIENT_SECRET=your_zotero_client_secret
ZOTERO_CALLBACK_URL=http://localhost:3000/api/zotero/callback
```

### 3. Build and Run
```bash
# Navigate to deploy directory
cd deploy

# Easy way
./start-docker.sh

# Manual way
docker-compose up --build
```

## What Gets Started

- **PostgreSQL Database**: PostgreSQL 15 with uuid-ossp extension on port 5433
- **Core Server** (Backend): Node.js API server on port 8000
- **Core UI** (Frontend): React application on port 3000

**All services run in containers** - no external dependencies required.

## Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api-docs
- PostgreSQL Database: localhost:5433 (username: fylocore, database: fylocore)

## Stopping the Application

```bash
# From the deploy/ directory
./stop-docker.sh
# OR
docker-compose down
```

## Development Workflow

### Making Changes
1. Edit code in `core-server/` or `core-ui/`
2. Restart containers to see changes:
   ```bash
   cd deploy
   docker-compose restart
   ```

### Rebuilding After Package Changes
```bash
cd deploy
docker-compose up --build
```

### Viewing Logs
```bash
# From deploy/ directory
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f core-server
docker-compose logs -f core-ui
docker-compose logs -f postgres
```

## Database Setup

### Automatic Initialization
The PostgreSQL database is automatically configured with:
- `uuid-ossp` extension for UUID generation
- Proper database and user setup
- Required permissions

The `init.sql` script runs automatically on first container startup.

### Database Access
```bash
# From deploy/ directory
# Connect to PostgreSQL database
docker-compose exec postgres psql -U fylocore -d fylocore

# View database tables
docker-compose exec postgres psql -U fylocore -d fylocore -c "\dt"
```

## File Structure

```
FyloCore/
├── core-ui/           # Frontend React application
├── core-server/       # Backend Node.js API
└── deploy/           # Docker deployment files
    ├── docker-compose.yml
    ├── init.sql      # PostgreSQL initialization
    ├── start-docker.sh
    ├── stop-docker.sh
    └── DOCKER.md
```

## Troubleshooting

### Container Health Checks
```bash
# From deploy/ directory
# Check container status
docker-compose ps

# Check health status
docker inspect fylo-core-server | grep Health
docker inspect fylo-core-ui | grep Health
```

### Common Issues
1. **Port conflicts**: Make sure ports 3000, 8000, and 5433 are not in use
2. **Environment variables**: Ensure .env files are properly configured
3. **Database connection**: PostgreSQL auto-initializes with uuid-ossp extension
4. **Build issues**: Try `docker-compose build --no-cache` for clean rebuild
5. **Permission errors**: Ensure Docker has proper permissions

### Clean Reset
```bash
# From deploy/ directory
# Stop and remove everything including volumes
docker-compose down -v

# Remove Docker images (optional)
docker-compose down --rmi all

# Start fresh
./start-docker.sh
```
