/**
 * User Routes
 * /api/users - User profile management
 * /api/admin/users - Admin user management
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/role';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/auth';

export const usersRouter = Router();

// ============================================
// USER ROUTES (Own Profile)
// ============================================

/**
 * GET /api/users/profile
 * Get current user's profile
 */
usersRouter.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
usersRouter.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { firstName, lastName, email } = req.body;

    // Check if new email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== req.user.userId) {
        res.status(409).json({
          error: 'Email already in use',
          message: 'This email is already registered to another account'
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName: firstName !== undefined ? firstName : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        email: email || undefined
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================
// ADMIN ROUTES (User Management)
// ============================================

/**
 * GET /api/admin/users
 * Get all users (Admin only)
 */
usersRouter.get('/admin/users', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    const where = search
      ? {
          OR: [
            { email: { contains: search as string, mode: 'insensitive' as const } },
            { firstName: { contains: search as string, mode: 'insensitive' as const } },
            { lastName: { contains: search as string, mode: 'insensitive' as const } },
            { slug: { contains: search as string, mode: 'insensitive' as const } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:slug
 * Get user by slug (Admin only)
 */
usersRouter.get('/admin/users/:slug', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const user = await prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: `No user found with slug: ${slug}`
      });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/admin/users/:slug
 * Update user (Admin only)
 */
usersRouter.put('/admin/users/:slug', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { firstName, lastName, email, role, status } = req.body;

    // Find user by slug
    const user = await prisma.user.findUnique({
      where: { slug }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: `No user found with slug: ${slug}`
      });
      return;
    }

    // Prevent admin from changing their own role
    if (req.user && user.id === req.user.userId && role && role !== user.role) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You cannot change your own role'
      });
      return;
    }

    // Check if new email is already taken
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Email already in use',
          message: 'This email is already registered to another account'
        });
        return;
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { slug },
      data: {
        firstName: firstName !== undefined ? firstName : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        email: email || undefined,
        role: role || undefined,
        status: status || undefined
      },
      select: {
        id: true,
        slug: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * POST /api/admin/users/:slug/reset-password
 * Reset user password (Admin only)
 */
usersRouter.post('/admin/users/:slug/reset-password', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({
        error: 'Validation error',
        message: 'New password is required'
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { slug }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: `No user found with slug: ${slug}`
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { slug },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * DELETE /api/admin/users/:slug
 * Delete user (Admin only)
 */
usersRouter.delete('/admin/users/:slug', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { slug }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: `No user found with slug: ${slug}`
      });
      return;
    }

    // Prevent admin from deleting themselves
    if (req.user && user.id === req.user.userId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You cannot delete your own account'
      });
      return;
    }

    // Delete user (hard delete)
    await prisma.user.delete({
      where: { slug }
    });

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
