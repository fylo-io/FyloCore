# Simplified Dockerfile for easier building and development
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY core-server/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY core-server/ ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
