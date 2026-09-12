import { Request, Response } from 'express';
import { otpService } from '../services/otpService';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Send OTP to Email Address
 */
export const sendEmailOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const result = await otpService.requestOTP(email, 'email');
    if (!result.success) {
      return res.status(429).json({ error: result.message, cooldownSeconds: result.cooldownSeconds });
    }

    res.json({ message: result.message, cooldownSeconds: result.cooldownSeconds });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send email OTP', details: error.message });
  }
};

/**
 * Verify Email OTP
 */
export const verifyEmailOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email address and OTP code are required.' });
    }

    const result = await otpService.verifyOTP(email, otp);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify email OTP', details: error.message });
  }
};

/**
 * Send OTP to Mobile Number
 */
export const sendMobileOtp = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber || mobileNumber.length < 8) {
      return res.status(400).json({ error: 'Valid mobile number with country code is required.' });
    }

    const result = await otpService.requestOTP(mobileNumber, 'mobile');
    if (!result.success) {
      return res.status(429).json({ error: result.message, cooldownSeconds: result.cooldownSeconds });
    }

    res.json({ message: result.message, cooldownSeconds: result.cooldownSeconds });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send mobile SMS OTP', details: error.message });
  }
};

/**
 * Verify Mobile OTP
 */
export const verifyMobileOtp = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP code are required.' });
    }

    const result = await otpService.verifyOTP(mobileNumber, otp);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify mobile OTP', details: error.message });
  }
};

/**
 * Register Account
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, emailVerified, mobileNumber, mobileVerified, password, assignedRole } = req.body;

    if (!fullName || !email || !mobileNumber || !password) {
      return res.status(400).json({ error: 'Full name, email, mobile number, and password are required.' });
    }

    if (!emailVerified || !mobileVerified) {
      return res.status(400).json({ error: 'Both email and mobile number must be OTP verified before account creation.' });
    }

    const { user, token } = await authService.createUser({
      fullName,
      email,
      emailVerified: true,
      mobileNumber,
      mobileVerified: true,
      passwordPlain: password,
      assignedRole,
    });

    // Set secure HTTP-only session cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).json({
      message: 'Account created successfully.',
      user,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed.' });
  }
};

/**
 * Login User (Email + Password OR Mobile + Password)
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier (Email or Mobile) and password are required.' });
    }

    const clientInfo = {
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown Browser',
    };

    const { user, token } = await authService.loginUser(identifier, password, clientInfo);

    // Set secure HTTP-only session cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      message: 'Login successful.',
      user,
      token,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid credentials.' });
  }
};

/**
 * Logout User
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully.' });
};

/**
 * Forgot Password Flow
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Email address or mobile number is required.' });
    }

    const isEmail = identifier.includes('@');
    const channel = isEmail ? 'email' : 'mobile';

    // Request OTP for the target
    const result = await otpService.requestOTP(identifier, channel);
    
    // Generic response to prevent user enumeration
    res.json({
      message: `If an account exists for ${identifier}, an OTP code has been sent. Please check your ${channel}.`,
      cooldownSeconds: result.cooldownSeconds,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to process forgot password request', details: error.message });
  }
};

/**
 * Reset Password Flow
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: 'Identifier, OTP code, and new password are required.' });
    }

    // Verify OTP first
    const otpCheck = await otpService.verifyOTP(identifier, otp);
    if (!otpCheck.success) {
      return res.status(400).json({ error: otpCheck.message });
    }

    // Reset password
    const result = await authService.resetPassword(identifier, newPassword);

    // Invalidate session cookie to force fresh login with new password
    res.clearCookie('auth_token');

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Password reset failed.' });
  }
};

/**
 * Get Current User Profile (/api/auth/me)
 */
export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  const user = authService.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
};
