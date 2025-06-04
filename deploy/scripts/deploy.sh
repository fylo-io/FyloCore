#!/bin/bash

# FyloCore Deployment Script
# Usage: ./deploy.sh [environment] [version]
# Example: ./deploy.sh production v1.2.3

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default values
ENVIRONMENT=${1:-development}
VERSION=${2:-latest}
REGISTRY="ghcr.io/fylocore"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation functions
validate_environment() {
    case "$ENVIRONMENT" in
        development|staging|production)
            log_info "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_error "Supported environments: development, staging, production"
            exit 1
            ;;
    esac
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check kubectl for non-development environments
    if [[ "$ENVIRONMENT" != "development" ]] && ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed (required for $ENVIRONMENT)"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

load_environment_config() {
    local env_file="$DEPLOY_DIR/environments/$ENVIRONMENT.env"
    
    if [[ -f "$env_file" ]]; then
        log_info "Loading environment configuration: $env_file"
        source "$env_file"
    else
        log_warning "Environment file not found: $env_file"
        log_warning "Using default configuration"
    fi
    
    # Load project .env if it exists
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        log_info "Loading project environment variables"
        source "$PROJECT_ROOT/.env"
    fi
}

build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build core-server image
    log_info "Building core-server image..."
    docker build -t "$REGISTRY/core-server:$VERSION" -f deploy/docker/Dockerfile .
    
    # Build core-ui image
    log_info "Building core-ui image..."
    docker build -t "$REGISTRY/core-ui:$VERSION" -f deploy/docker/Dockerfile.ui ./core-ui
    
    log_success "Images built successfully"
}

deploy_development() {
    log_info "Deploying to development environment..."
    
    cd "$DEPLOY_DIR/docker"
    
    # Stop existing containers
    docker-compose -f docker-compose.dev.yml down
    
    # Start services
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:8000/api/health &> /dev/null; then
        log_success "Development deployment successful!"
        log_info "Frontend: http://localhost:3000"
        log_info "Backend: http://localhost:8000"
        log_info "API Docs: http://localhost:8000/api-docs"
    else
        log_error "Health check failed"
        docker-compose -f docker-compose.dev.yml logs core-server
        exit 1
    fi
}

deploy_production() {
    log_info "Deploying to production environment..."
    
    # Push images to registry
    log_info "Pushing images to registry..."
    docker push "$REGISTRY/core-server:$VERSION"
    docker push "$REGISTRY/core-ui:$VERSION"
    
    # Apply Kubernetes manifests
    log_info "Applying Kubernetes manifests..."
    cd "$DEPLOY_DIR/kubernetes"
    
    # Update image tags
    sed -i "s|fylocore/core-server:latest|$REGISTRY/core-server:$VERSION|g" *.yaml
    sed -i "s|fylocore/core-ui:latest|$REGISTRY/core-ui:$VERSION|g" *.yaml
    
    # Apply manifests
    kubectl apply -f namespace.yaml
    kubectl apply -f secrets.yaml
    kubectl apply -f .
    
    # Wait for rollout
    kubectl rollout status deployment/core-server -n fylocore --timeout=300s
    
    log_success "Production deployment successful!"
}

deploy_staging() {
    log_info "Deploying to staging environment..."
    
    # Similar to production but with staging configurations
    deploy_production
}

cleanup() {
    log_info "Cleaning up temporary files..."
    # Add any cleanup logic here
}

# Main deployment logic
main() {
    log_info "Starting FyloCore deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    validate_environment
    check_dependencies
    load_environment_config
    
    case "$ENVIRONMENT" in
        development)
            build_images
            deploy_development
            ;;
        staging)
            build_images
            deploy_staging
            ;;
        production)
            build_images
            deploy_production
            ;;
    esac
    
    cleanup
    log_success "Deployment completed successfully!"
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
