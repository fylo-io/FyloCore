#!/bin/bash

echo "🛑 Stopping FyloCore Docker services..."
echo ""

# Stop the services
docker-compose -f deploy/docker/docker-compose.dev.yml down

echo ""
echo "✅ FyloCore services stopped successfully!"
echo ""
echo "To start again, run: ./start-docker.sh"
