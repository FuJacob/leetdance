# 🐳 Docker Setup Guide for LeetDance

This guide covers running LeetDance using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Your environment variables ready (Auth0, MongoDB, Gemini API)

## 🚀 Quick Start

### 1. Setup Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
- MongoDB connection string
- Auth0 credentials
- Gemini API key

### 2. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🛠️ Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs (like tail -f)
docker-compose logs -f
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build frontend
docker-compose build backend

# Force rebuild without cache
docker-compose build --no-cache
```

### Development Commands

```bash
# Execute command in running container
docker-compose exec frontend sh
docker-compose exec backend bash

# Run Prisma migrations
docker-compose exec frontend npx prisma migrate dev

# Generate Prisma Client
docker-compose exec frontend npx prisma generate

# View running containers
docker-compose ps

# Restart specific service
docker-compose restart frontend
docker-compose restart backend
```

## 📁 Project Structure

```
HTN25/
├── docker-compose.yml       # Docker Compose configuration
├── .env                      # Environment variables (create from .env.example)
├── .env.example             # Example environment variables
├── backend/
│   ├── Dockerfile           # Backend Docker image
│   ├── .dockerignore        # Files to exclude from Docker
│   └── ...
└── main/
    ├── Dockerfile           # Frontend Docker image
    ├── .dockerignore        # Files to exclude from Docker
    └── ...
```

## 🔧 Configuration

### Backend Service
- **Port**: 8000
- **Auto-reload**: Enabled in development
- **Volume**: Source code is mounted for hot-reload

### Frontend Service
- **Port**: 3000
- **Production build**: Optimized for production
- **Depends on**: Backend service

### Network
- Both services run on a shared Docker network
- Services can communicate using service names (e.g., `http://backend:8000`)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Stop all containers
docker-compose down

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use different host port
```

### Database Connection Issues

Make sure your `DATABASE_URL` in `.env` includes:
- Correct username and password
- Database name at the end: `/leetdance`
- Example: `mongodb+srv://user:pass@cluster.mongodb.net/leetdance`

### Auth0 Callback URL

Update your Auth0 dashboard with:
- Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
- Allowed Logout URLs: `http://localhost:3000`

### Container Logs

```bash
# Check logs for errors
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Clean Restart

```bash
# Stop everything and remove volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up
```

## 🚢 Production Deployment

### Build Production Images

```bash
# Build optimized production images
docker-compose -f docker-compose.prod.yml build

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

Update `.env` for production:
- Use production MongoDB cluster
- Update `AUTH0_BASE_URL` to your domain
- Update `APP_BASE_URL` to your domain
- Use production Auth0 application

## 💡 Tips

1. **Development**: Use `docker-compose up` to see logs in real-time
2. **Background**: Use `docker-compose up -d` to run in background
3. **Hot Reload**: Backend auto-reloads on code changes (volume mounted)
4. **Logs**: Use `docker-compose logs -f` to follow logs
5. **Shell Access**: Use `docker-compose exec <service> sh` to access container

## 🔐 Security Notes

- Never commit `.env` file
- Use `.env.example` as template
- Rotate secrets regularly
- Use Docker secrets for production

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
