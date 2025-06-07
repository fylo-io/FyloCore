#!/bin/bash

# FyloCore Docker Startup Script
# Run this from the deploy/ directory

echo "🚀 Starting FyloCore with Docker..."

# Check if required .env files exist
if [ ! -f "../core-server/.env" ]; then
    echo "❌ Missing core-server/.env file. Copy from .env.example and configure."
    exit 1
fi

if [ ! -f "../core-ui/.env" ]; then
    echo "❌ Missing core-ui/.env file. Copy from .env.example and configure."
    exit 1
fi

# Start the services
echo "📦 Building and starting Docker containers..."
docker-compose up -d --build

# Wait a moment for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Show status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "🌐 Application Access:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Health:   http://localhost:8000/api/health"
echo "  Database: localhost:5433 (user: fylocore, db: fylocore)"
echo ""
echo "📝 Useful Commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Or run:        ./stop-docker.sh"
echo ""
echo "✅ FyloCore is running!"
