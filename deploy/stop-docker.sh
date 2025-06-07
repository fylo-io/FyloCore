#!/bin/bash

# FyloCore Docker Stop Script
# Run this from the deploy/ directory

echo "🛑 Stopping FyloCore Docker containers..."

docker-compose down

echo "✅ FyloCore containers stopped successfully!"
echo ""
echo "💡 To remove volumes (database data): docker-compose down -v"
echo "💡 To restart: ./start-docker.sh"
