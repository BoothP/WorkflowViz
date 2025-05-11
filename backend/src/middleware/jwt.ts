import jwt from 'jsonwebtoken';
import { Response, Request, NextFunction } from 'express';

interface TokenPayload {
  id: string;
}

export const generateTokens = (userId: string, res: Response): { accessToken: string } => {
  // Generate access token
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1h',
  });

  // Generate refresh token and set as HttpOnly cookie
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' }
  );

  // Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { accessToken };
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
    ) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const clearRefreshToken = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

// New AuthenticatedRequest interface and authenticateJWT middleware
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload; // TokenPayload already defines { id: string }
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      res.status(401).json({ message: 'Access token is missing or malformed' });
      return;
    }
    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Attach user { id: string } to request
      next();
    } catch (error) {
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  } else {
    res.status(401).json({ message: 'Authorization header missing' });
  }
};
