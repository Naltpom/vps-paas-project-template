/**
 * {{PROJECT_NAME}} - Backend API
 * {{DESCRIPTION}}
 *
 * Production-ready Express.js server with TypeScript
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { env } from './config/environment';
import { healthRouter } from './routes/health';
import { apiRouter } from './routes/api';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { errorHandler } from './middleware/error-handler';
import { logger } from './middleware/logger';

// Load environment variables
dotenv.config();

const app: Express = express();

// ============================================
// Security Middleware
// ============================================
app.use(helmet()); // Security headers
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// ============================================
// Body Parsing Middleware
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // Gzip compression

// ============================================
// Logging Middleware
// ============================================
app.use(logger);

// ============================================
// Routes
// ============================================
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api', usersRouter);
app.use('/api', apiRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: '{{PROJECT_NAME}}',
    description: '{{DESCRIPTION}}',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// ============================================
// Error Handling
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const PORT = env.PORT;
const HOST = env.HOST;

app.listen(PORT, HOST, () => {
  console.log(`✅ {{PROJECT_NAME}} Backend started`);
  console.log(`🌐 Server running on http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📡 API: http://${HOST}:${PORT}/api`);
  console.log(`🔒 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
