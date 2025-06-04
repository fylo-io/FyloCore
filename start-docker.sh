#!/bin/bash

echo "🚀 Starting FyloCore with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if environment files exist
if [ ! -f "core-server/.env" ]; then
    echo "⚠️  Missing: core-server/.env"
    if [ -f "core-server/.env.example" ]; then
        echo "   Run: cp core-server/.env.example core-server/.env"
        echo "   Then edit core-server/.env with your API keys"
    else
        echo "   Please create core-server/.env with your API keys"
    fi
    echo ""
fi

if [ ! -f "core-ui/.env" ]; then
    echo "⚠️  Missing: core-ui/.env"
    if [ -f "core-ui/.env.example" ]; then
        echo "   Run: cp core-ui/.env.example core-ui/.env"
        echo "   Then edit core-ui/.env with your configuration"
    else
        echo "   Please create core-ui/.env with your frontend config"
    fi
    echo ""
fi

# If any .env files are missing, exit with instructions
if [ ! -f "core-server/.env" ] || [ ! -f "core-ui/.env" ]; then
    echo "❌ Environment files are required before starting Docker"
    echo "   See README.md for detailed setup instructions"
    echo ""
    exit 1
fi

echo ""

# Start the services
echo "📦 Building and starting services..."
echo "   • Core Server (Backend API)"
echo "   • Core UI (Frontend React App)"
echo ""

docker-compose -f deploy/docker/docker-compose.dev.yml up --build

echo ""
echo "🎉 FyloCore is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/api-docs"
echo ""
echo "Press Ctrl+C to stop the services"
