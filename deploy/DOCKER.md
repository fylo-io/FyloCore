# FyloCore Docker Setup

Simple Docker setup for developers to run FyloCore locally with PostgreSQL.

## For New Developers

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/fylo-io/FyloCore.git
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
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=fylocore
POSTGRES_USER=fylocore
POSTGRES_PASSWORD=fylocore_password

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

### 3. Run with Docker

From the project root:
```bash
cd deploy
./start-docker.sh
```

Or manually:
```bash
cd deploy
docker-compose up --build
```

### 4. What Gets Started

- **PostgreSQL Database**: Port 5433 (external), auto-initialized with UUID extension
- **Core Server API**: Port 8000, connects to PostgreSQL
- **Core UI Frontend**: Port 3000, connects to Core Server

### 5. Access Points

- **Application**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api-docs
- **Health Check**: http://localhost:8000/api/health
- **Database**: localhost:5433 (external port)

### 6. Stop Everything

```bash
cd deploy
./stop-docker.sh
```

Or:
```bash
cd deploy
docker-compose down
```

## Container Details

### PostgreSQL Container
- **Image**: postgres:15
- **External Port**: 5433
- **Internal Port**: 5432
- **Database**: fylocore
- **Auto-initialization**: UUID extension installed
- **Data Persistence**: Docker volume

### Core Server Container
- **Runtime**: Node.js 18
- **Mode**: Development (npm run dev)
- **Health Check**: /api/health endpoint
- **Dependencies**: PostgreSQL container

### Core UI Container
- **Framework**: Next.js
- **Mode**: Development (npm start)
- **Environment**: DOCKER_ENVIRONMENT=true
- **Dependencies**: Core Server container

## Troubleshooting

### Port Conflicts
If you get port errors:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5433
lsof -i :8000

# Stop any conflicting services
sudo service postgresql stop  # If you have local PostgreSQL
```

### Container Health Issues
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs core-server
docker-compose logs core-ui
docker-compose logs postgres

# Restart specific service
docker-compose restart core-server
```

### Clean Rebuild
```bash
# Stop everything
docker-compose down

# Remove old images
docker-compose down --rmi all

# Clean rebuild
docker-compose build --no-cache
docker-compose up
```

### Database Issues
```bash
# Connect to PostgreSQL directly
docker exec -it fylo-postgres psql -U fylocore -d fylocore

# Check if tables exist
\dt

# Check UUID extension
\dx
```

## Environment Variables Reference

### Required Variables
- `ANTHROPIC_API_KEY`: Get from [console.anthropic.com](https://console.anthropic.com)
- `JWT_SECRET`: Any secure random string
- `NEXTAUTH_SECRET`: Any secure random string (can be same as JWT_SECRET)

### Optional Variables
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `ZOTERO_CLIENT_KEY`, `ZOTERO_CLIENT_SECRET`: For Zotero integration
- `RESEND_API_KEY`: For email functionality

### Auto-configured Variables (Don't change)
- Database connection variables are set automatically for Docker
- API URLs are configured for container communication

## Development Tips

1. **File Watching**: Changes to code will auto-reload in development mode
2. **Database Persistence**: Database data persists between container restarts
3. **Log Files**: Check `core-server/logs/` for application logs
4. **Container Communication**: Services communicate via Docker network names
5. **Environment Switching**: DOCKER_ENVIRONMENT=true switches API URLs automatically

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

## Stopping the Application

```bash
# From the deploy/ directory
./stop-docker.sh
# OR
docker-compose down
```
