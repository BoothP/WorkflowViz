import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { generateTokens, verifyRefreshToken, clearRefreshToken } from '../middleware/jwt';

// Generate JWT
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  } as jwt.SignOptions;
  return jwt.sign({ id }, secret, options);
};

interface SignupRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  email: string;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      oauthProviders: [],
    });

    if (user) {
      const userId = (user._id as unknown as string).toString();
      res.status(201).json({
        _id: userId,
        email: user.email,
        token: generateToken(userId),
      });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const userId = (user._id as unknown as string).toString();
    // Generate tokens
    const { accessToken } = generateTokens(userId, res);

    // Return success response
    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
};

export const signup = async (req: Request<{}, {}, SignupRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      oauthProviders: [],
    });

    const userId = (user._id as unknown as string).toString();
    // Generate tokens
    const { accessToken } = generateTokens(userId, res);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    // Handle other errors
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during signup',
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const userId = (user._id as unknown as string).toString();
    // Generate new tokens
    const { accessToken } = generateTokens(userId, res);

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    clearRefreshToken(res);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
    });
  }
};
