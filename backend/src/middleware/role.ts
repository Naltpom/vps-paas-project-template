/**
 * Role-based Access Control Middleware
 * Checks if authenticated user has required role
 */

import { Request, Response, NextFunction } from 'express';

type UserRole = 'USER' | 'ADMIN';

/**
 * Middleware factory to require specific roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // User must be authenticated first (attach by authenticate middleware)
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: 'Access denied',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

/**
 * Shorthand middleware to require ADMIN role
 */
export const requireAdmin = requireRole(['ADMIN']);
