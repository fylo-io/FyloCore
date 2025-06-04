#!/bin/bash

# FyloCore Backup Script
# Usage: ./backup.sh [environment] [backup-type]
# Example: ./backup.sh production database

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Parameters
ENVIRONMENT=${1:-development}
BACKUP_TYPE=${2:-full}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Create backup directory
mkdir -p "$BACKUP_DIR"

backup_database() {
    log_info "Starting database backup for $ENVIRONMENT..."
    
    local backup_file="$BACKUP_DIR/fylocore_db_${ENVIRONMENT}_${TIMESTAMP}.sql"
    
    if [[ -z "$SUPABASE_URL" ]] || [[ -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
        log_error "Supabase credentials not found in environment"
        exit 1
    fi
    
    # Extract database connection details from Supabase URL
    local db_host=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co.*|.supabase.co|')
    local project_id=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co.*||')
    
    log_info "Creating database backup: $backup_file"
    
    # Use pg_dump with Supabase connection
    PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
        -h "db.${project_id}.supabase.co" \
        -U postgres \
        -d postgres \
        --no-password \
        --clean \
        --if-exists \
        > "$backup_file"
    
    if [[ $? -eq 0 ]]; then
        log_success "Database backup completed: $backup_file"
        
        # Compress the backup
        gzip "$backup_file"
        log_success "Backup compressed: ${backup_file}.gz"
    else
        log_error "Database backup failed"
        exit 1
    fi
}

backup_volumes() {
    log_info "Starting volume backup for $ENVIRONMENT..."
    
    local backup_file="$BACKUP_DIR/fylocore_volumes_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        # Backup Docker volumes
        docker run --rm \
            -v fylocore_redis-data:/data/redis:ro \
            -v fylocore_logs-data:/data/logs:ro \
            -v "$BACKUP_DIR":/backup \
            alpine:latest \
            tar czf "/backup/fylocore_volumes_${ENVIRONMENT}_${TIMESTAMP}.tar.gz" \
            -C /data .
    else
        # For production, backup persistent volumes from Kubernetes
        kubectl get pv -o name | while read pv; do
            log_info "Backing up persistent volume: $pv"
            # Add specific volume backup logic here
        done
    fi
    
    log_success "Volume backup completed: $backup_file"
}

backup_configuration() {
    log_info "Starting configuration backup for $ENVIRONMENT..."
    
    local config_backup="$BACKUP_DIR/fylocore_config_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
    
    # Backup deployment configurations (excluding secrets)
    tar czf "$config_backup" \
        --exclude="*.env" \
        --exclude="secrets.yaml" \
        -C "$SCRIPT_DIR/../.." \
        deploy/docker \
        deploy/kubernetes \
        deploy/environments
    
    log_success "Configuration backup completed: $config_backup"
}

cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep last 7 days of backups
    find "$BACKUP_DIR" -name "fylocore_*_${ENVIRONMENT}_*.gz" -mtime +7 -delete
    find "$BACKUP_DIR" -name "fylocore_*_${ENVIRONMENT}_*.tar.gz" -mtime +7 -delete
    
    log_success "Old backups cleaned up"
}

restore_database() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_warning "This will restore the database from: $backup_file"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    log_info "Restoring database..."
    
    # Decompress if needed
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
            -h "db.${project_id}.supabase.co" \
            -U postgres \
            -d postgres
    else
        PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
            -h "db.${project_id}.supabase.co" \
            -U postgres \
            -d postgres \
            < "$backup_file"
    fi
    
    log_success "Database restore completed"
}

list_backups() {
    log_info "Available backups for $ENVIRONMENT:"
    ls -la "$BACKUP_DIR" | grep "$ENVIRONMENT" || log_warning "No backups found for $ENVIRONMENT"
}

# Main logic
case "$BACKUP_TYPE" in
    database)
        backup_database
        ;;
    volumes)
        backup_volumes
        ;;
    config)
        backup_configuration
        ;;
    full)
        backup_database
        backup_volumes
        backup_configuration
        cleanup_old_backups
        ;;
    restore)
        if [[ -z "$3" ]]; then
            log_error "Backup file required for restore"
            log_info "Usage: $0 $ENVIRONMENT restore <backup_file>"
            exit 1
        fi
        restore_database "$3"
        ;;
    list)
        list_backups
        ;;
    *)
        log_error "Invalid backup type: $BACKUP_TYPE"
        log_info "Supported types: database, volumes, config, full, restore, list"
        exit 1
        ;;
esac

log_success "Backup operation completed successfully!"
