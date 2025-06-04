# FyloCore Deployment Configuration

This directory contains Docker configurations, CI/CD pipelines, and deployment scripts for the FyloCore platform.

## Structure

- `docker/` - Docker configurations for containerized deployment
- `kubernetes/` - Kubernetes manifests for orchestrated deployment
- `ci-cd/` - Continuous integration and deployment pipelines
- `scripts/` - Deployment automation scripts
- `environments/` - Environment-specific configurations

## Deployment Options

### 1. Local Development
```bash
# Quick local setup with Docker Compose
cd deploy/docker
docker-compose -f docker-compose.dev.yml up
```

### 2. Production Deployment
```bash
# Production deployment with Docker Compose
cd deploy/docker
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Kubernetes Deployment
```bash
# Deploy to Kubernetes cluster
kubectl apply -f deploy/kubernetes/
```

### 4. CI/CD Pipeline
- **GitHub Actions**: Automated testing, building, and deployment
- **Docker Registry**: Automated image building and publishing
- **Environment Promotion**: Dev → Staging → Production

## Requirements

### Minimum System Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **OS**: Linux, macOS, or Windows with Docker

### Production Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Database**: PostgreSQL 14+ (via Supabase)
- **Load Balancer**: Nginx or equivalent

## Environment Variables

Key environment variables required for deployment:

```bash
# Core Server
NODE_ENV=production
PORT=8000
ANTHROPIC_API_KEY=your_anthropic_key

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email Service
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@fylocore.org
```

## Security Considerations

- All secrets managed via environment variables
- HTTPS enforcement in production
- Database connection encryption
- API rate limiting enabled
- CORS properly configured

## Monitoring

- Health check endpoints: `/api/health`
- Prometheus metrics: `/metrics`
- Log aggregation: Structured JSON logs
- Error tracking: Integrated error reporting

For detailed deployment instructions, see the `docs/` directory.
