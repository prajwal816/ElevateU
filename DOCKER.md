# Docker Setup for LMS Project

This document provides instructions for running the Learning Management System using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+

## Project Structure

```
lms/
├── backend/           # Node.js/Express API
├── frontend/          # React/Vite frontend
├── ml-service/        # Python/FastAPI ML service
├── mongo-init/        # MongoDB initialization scripts
├── docker-compose.yml # Production setup
├── docker-compose.dev.yml # Development setup
└── .env              # Environment variables
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/lms?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Production Setup

### Build and Run All Services

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000
- **MongoDB**: localhost:27017

### Stop Services

```bash
docker-compose down
```

### Clean Up

```bash
# Remove containers and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Development Setup

### Run Development Environment

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Run in background
docker-compose -f docker-compose.dev.yml up -d --build
```

### Development Features

- **Hot Reload**: Code changes automatically restart services
- **Volume Mounting**: Source code is mounted for live updates
- **Debug Ports**: All services expose debug ports

### Access Development Services

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:5000 (with nodemon)
- **ML Service**: http://localhost:8000 (with auto-reload)
- **MongoDB**: localhost:27017

## Individual Service Commands

### Backend Only

```bash
# Production
docker-compose up backend

# Development
docker-compose -f docker-compose.dev.yml up backend
```

### Frontend Only

```bash
# Production
docker-compose up frontend

# Development
docker-compose -f docker-compose.dev.yml up frontend
```

### ML Service Only

```bash
# Production
docker-compose up ml-service

# Development
docker-compose -f docker-compose.dev.yml up ml-service
```

## Database Management

### MongoDB Access

```bash
# Connect to MongoDB container
docker exec -it lms-mongodb mongosh

# Or with authentication
docker exec -it lms-mongodb mongosh -u admin -p password
```

### Database Backup

```bash
# Create backup
docker exec lms-mongodb mongodump --out /backup --username admin --password password --authenticationDatabase admin

# Copy backup to host
docker cp lms-mongodb:/backup ./mongodb-backup
```

### Database Restore

```bash
# Copy backup to container
docker cp ./mongodb-backup lms-mongodb:/restore

# Restore database
docker exec lms-mongodb mongorestore /restore --username admin --password password --authenticationDatabase admin
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 5000, 8000, and 27017 are not in use
2. **Permission Issues**: On Linux/Mac, you may need to run with `sudo`
3. **Memory Issues**: Ensure Docker has enough memory allocated (4GB+ recommended)

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ml-service
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f backend
```

### Container Status

```bash
# Check running containers
docker-compose ps

# Check container health
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### Rebuild Services

```bash
# Rebuild specific service
docker-compose build backend

# Rebuild all services
docker-compose build

# Force rebuild (no cache)
docker-compose build --no-cache
```

## Production Deployment

### Environment Setup

1. Set up proper environment variables in production
2. Configure reverse proxy (nginx) for production
3. Set up SSL certificates
4. Configure database backups
5. Set up monitoring and logging

### Security Considerations

- Use strong passwords for database
- Set up proper firewall rules
- Use HTTPS in production
- Regular security updates
- Monitor container logs

## Performance Optimization

### Resource Limits

Add resource limits to docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Database Optimization

- Configure MongoDB with proper indexes
- Set up connection pooling
- Monitor query performance

## Monitoring

### Health Checks

Add health checks to services:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Logging

Configure centralized logging with ELK stack or similar for production environments.
