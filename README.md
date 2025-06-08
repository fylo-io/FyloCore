# FyloCore

Advanced knowledge graph platform for collaborative research and AI-powered content analysis.

## 🚀 Quick Start for Developers

### 1. Clone the Repository
```bash
git clone https://github.com/fylo-io/FyloCore.git
cd FyloCore
```

### 2. Set Up Environment Variables

**Copy environment templates**
```bash
# Copy environment templates
cp core-server/.env.example core-server/.env
cp core-ui/.env.example core-ui/.env
```

**Edit `core-server/.env`** with your configuration:
```env
# Required: Database connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=fylocore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password

# Required: Anthropic API key for AI functionality  
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: JWT secret for authentication (auto-generated if not provided)
JWT_SECRET=your_jwt_secret

# Optional: Email service
RESEND_API_KEY=your_resend_api_key_for_emails

# Optional: OpenAI API (if using OpenAI features)
OPENAI_API_KEY=your_openai_api_key

# Application URLs
APP_URL=http://localhost:3000
```

**Edit `core-ui/.env`** with your configuration:
```env
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

> **Note**: You need a valid Anthropic API key and PostgreSQL database for the application to work properly.

### Getting API Keys

1. **Anthropic**: Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. **PostgreSQL**: Use the provided Docker setup or your own PostgreSQL instance

### 3. Run with Docker

**Quick Start (Recommended)**
```bash
cd deploy
./start-docker.sh
```

**Manual Docker Compose**
```bash
cd deploy
docker-compose up --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api-docs
- **PostgreSQL**: localhost:5433 (external port)

### 5. Stop the Application
```bash
cd deploy
./stop-docker.sh
# OR
docker-compose down
```

## 🛠️ What Gets Built

- **PostgreSQL Database**: Persistent data storage on port 5433
- **Core Server** (Backend): Node.js/TypeScript API on port 8000
- **Core UI** (Frontend): Next.js application on port 3000

## 📋 Prerequisites

- Docker and Docker Compose installed
- API key for Anthropic Claude
- PostgreSQL database (included in Docker setup)
- Internet connection for downloading dependencies

## 🔧 Development Notes

- Environment variables are loaded from `core-server/.env` and `core-ui/.env`
- Logs are saved to `core-server/logs/`
- Database data is persisted in Docker volumes
- The PostgreSQL database is automatically initialized with required extensions

## 📖 Documentation

- [Detailed Docker Guide](deploy/DOCKER.md)
- [API Documentation](docs/api/README.md)
- [Project Documentation](docs/README.md)

## 🛠️ Troubleshooting

**Common Issues:**
- **Port conflicts**: Ensure ports 3000, 8000, and 5433 are available
- **Docker not running**: Start Docker Desktop or Docker daemon
- **Build failures**: Try `docker system prune` to clean up Docker cache
- **API connection errors**: Verify your `.env` files have correct API keys

**Need Help?**
- Check the [Detailed Docker Guide](deploy/DOCKER.md) for more setup options
- Look at example environment variables in `.env.example` files