# FyloCore Quick Start Guide

Get FyloCore running locally in under 5 minutes with Docker Compose.

## Prerequisites

- **Docker**: 20.10+ with Docker Compose
- **Git**: For cloning the repository
- **Environment**: Linux, macOS, or Windows with WSL2

## Step 1: Clone the Repository

```bash
git clone https://github.com/fylocore/fylocore.git
cd fylocore
```

## Step 2: Configure Environment Variables

**Option A: Use the automated setup script (Recommended)**
```bash
./setup-env.sh
```

**Option B: Manual setup**
```bash
# Copy environment templates for both services
cp core-server/.env.example core-server/.env
cp core-ui/.env.example core-ui/.env

# Edit the files with your values
nano core-server/.env
nano core-ui/.env
```

Required environment variables:

**core-server/.env** (Backend configuration):
```bash
# Required: Anthropic Claude API for AI features
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Required: Supabase database connection
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Optional: Email service
RESEND_API_KEY=your_resend_api_key_for_emails

# Optional: OpenAI API (if using OpenAI features)
OPENAI_API_KEY=your_openai_api_key

# Application URLs
APP_URL=http://localhost:3000
```

**core-ui/.env** (Frontend configuration):
```bash
# Required: API connection to backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Zotero integration
ZOTERO_CLIENT_KEY=your_zotero_client_key
ZOTERO_CLIENT_SECRET=your_zotero_client_secret
ZOTERO_CALLBACK_URL=http://localhost:3000/api/zotero/callback
```

### Getting API Keys

1. **Anthropic API Key**: Sign up at [console.anthropic.com](https://console.anthropic.com)
2. **Supabase**: Create a project at [supabase.com](https://supabase.com)
3. **Resend** (Optional): Get API key at [resend.com](https://resend.com)

## Step 3: Launch with Docker Compose

```bash
# Navigate to the deployment directory
cd deploy/docker

# Start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# Or start with logs visible
docker-compose -f docker-compose.dev.yml up
```

## Step 4: Verify Installation

### Check Service Status
```bash
# View running containers
docker-compose ps

# Check service logs
docker-compose logs core-server
docker-compose logs core-ui
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api-docs
- **Health Check**: http://localhost:8000/api/health

### Test API Connection
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","uptime":123.456}
```

## Step 5: Create Your First Knowledge Graph

1. **Open the Frontend**: Navigate to http://localhost:3000
2. **Sign Up**: Create a new account (or sign in if you have one)
3. **Create Graph**: Click "New Graph" and give it a title
4. **Add Nodes**: Double-click on the canvas to add knowledge nodes
5. **Connect Nodes**: Drag between nodes to create relationships
6. **Save**: Your graph auto-saves as you work

## Common Issues & Solutions

### Container Startup Issues
```bash
# Check if ports are already in use
netstat -tlnp | grep :3000
netstat -tlnp | grep :8000

# Stop conflicting services or change ports in docker-compose.dev.yml
```

### Database Connection Issues
```bash
# Verify Supabase credentials
curl -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "apikey: YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/"
```

### Environment Variable Issues
```bash
# Check if .env file is properly loaded
docker-compose config

# Restart services after changing .env
docker-compose down
docker-compose -f docker-compose.dev.yml up -d
```

## Next Steps

### Development Setup
- **[Development Environment](development.md)** - Set up local development
- **[API Testing](../api/testing.md)** - Test the API with Postman
- **[Frontend Development](../../core-ui/README.md)** - React development guide

### Production Deployment
- **[Docker Production](docker.md)** - Production Docker setup
- **[Kubernetes](kubernetes.md)** - Scale with Kubernetes
- **[Environment Configuration](environment.md)** - Production config

### Learn More
- **[User Guide](../user-guides/getting-started.md)** - Learn to use FyloCore
- **[API Documentation](../api/README.md)** - Explore the REST API
- **[Architecture](../architecture/overview.md)** - Understand the system

## Getting Help

- **GitHub Issues**: [Report problems](https://github.com/fylocore/fylocore/issues)
- **Discussions**: [Ask questions](https://github.com/fylocore/fylocore/discussions)
- **Documentation**: [Browse all docs](../README.md)

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

**🎉 Congratulations! You now have FyloCore running locally.**

Try creating your first knowledge graph and explore the collaborative features. Check out the [User Guide](../user-guides/getting-started.md) for a comprehensive tutorial.
