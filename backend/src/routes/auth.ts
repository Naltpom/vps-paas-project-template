/**
 * Authentication Routes
 * /api/auth
 */

import { Router, Request, Response } from 'express';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { generateSlug, makeSlugUnique } from '../utils/slug';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Registration failed',
        message: 'Email already registered'
      });
      return;
    }

    // Generate slug from email
    const baseSlug = generateSlug(email);

    // Get existing slugs to ensure uniqueness
    const existingSlugs = (await prisma.user.findMany({
      where: {
        slug: {
          startsWith: baseSlug
        }
      },
      select: { slug: true }
    })).map(u => u.slug);

    const slug = makeSlugUnique(baseSlug, existingSlugs);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        slug,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'USER',
        status: 'ACTIVE'
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        error: 'Account inactive',
        message: 'Your account has been deactivated'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
      return;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user'
    });
  }
});
