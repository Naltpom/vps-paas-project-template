/**
 * API Routes
 * Add your application routes here
 */

import { Router, Request, Response } from 'express';

export const apiRouter = Router();

// Example route - replace with your own endpoints
apiRouter.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to {{PROJECT_NAME}} API',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/api/', description: 'API information' },
      { method: 'GET', path: '/api/example', description: 'Example endpoint' },
    ],
  });
});

// Example endpoint
apiRouter.get('/example', (req: Request, res: Response) => {
  res.json({
    message: 'This is an example endpoint',
    timestamp: new Date().toISOString(),
    data: {
      hello: 'world',
    },
  });
});

// TODO: Add your own routes here
// apiRouter.get('/users', getUsersHandler);
// apiRouter.post('/users', createUserHandler);
// etc.
