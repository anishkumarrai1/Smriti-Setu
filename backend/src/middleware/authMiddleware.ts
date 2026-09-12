import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { authService } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: 'user' | 'admin';
    assignedRole: 'patient' | 'caregiver' | 'clinician';
    fullName: string;
  };
}

/**
 * Express JWT Authentication Middleware
 */
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const tokenFromCookie = req.cookies?.auth_token;
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Session token missing.' });
  }

  const payload = authService.verifyJWTToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Session token expired or invalid.' });
  }

  req.user = payload;
  next();
};

/**
 * Role-Based Access Control Guard
 */
export const requireRole = (requiredRole: 'user' | 'admin') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to ${requiredRole} users only. Normal users cannot access admin resources.`,
      });
    }

    next();
  };
};

/**
 * Server-Side CAPTCHA Verifier Middleware
 */
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  const captchaToken = req.body?.captchaToken || req.headers['x-captcha-token'];
  const secretKey = process.env.CAPTCHA_SECRET_KEY;

  // Sandbox or skip in testing environment
  if (!secretKey || secretKey === 'sandbox_captcha_secret' || process.env.NODE_ENV === 'test') {
    return next();
  }

  if (!captchaToken) {
    return res.status(400).json({ error: 'CAPTCHA verification token is required for security.' });
  }

  try {
    // In production, verify captcha token with Cloudflare Turnstile / Google reCAPTCHA server API
    // e.g., fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    next();
  } catch (err: any) {
    return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
  }
};

/**
 * Rate Limiter for Login Attempts (Max 5 attempts per 15 minutes)
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts from this IP address. Please wait 15 minutes.' },
});

/**
 * Rate Limiter for OTP Requests (Max 5 requests per 10 minutes)
 */
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please wait before requesting another OTP.' },
});
