# {{PROJECT_NAME}}

{{DESCRIPTION}}

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ LTS
- Docker & Docker Compose
- PostgreSQL (optional, for local development)

### Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development servers
docker-compose up

# Or run individually:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

### Production Deployment

This project is designed to be deployed on VPS MCP PaaS platform.

```bash
# Build Docker images
docker build -t {{PROJECT_NAME}}-backend:latest ./backend
docker build -t {{PROJECT_NAME}}-frontend:latest ./frontend

# Run containers
docker run -d -p 3000:3000 {{PROJECT_NAME}}-backend:latest
docker run -d -p 80:80 {{PROJECT_NAME}}-frontend:latest
```

## 📁 Project Structure

```
.
├── backend/           # Express.js API
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── config/        # Configuration
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Express middleware
│   ├── Dockerfile
│   └── package.json
│
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── App.tsx        # Main component
│   │   └── main.tsx       # Entry point
│   ├── Dockerfile
│   ├── nginx.conf         # Nginx configuration
│   └── package.json
│
└── docker-compose.yml # Dev environment
```

## 🔧 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
```

See `backend/.env.example` for full list.

## 📡 API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api` - API routes

## 🐳 Docker

### Backend

- Multi-stage build (builder + production)
- Alpine Linux base (small image size)
- Non-root user (security)
- Health check endpoint

### Frontend

- Multi-stage build (Vite build + Nginx)
- Optimized static file serving
- Security headers configured

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Non-root Docker containers
- Environment variable validation (Zod)
- Read-only containers in production

## 📝 License

MIT
