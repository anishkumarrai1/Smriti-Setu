import { Router } from 'express';
import {
  sendEmailOtp,
  verifyEmailOtp,
  sendMobileOtp,
  verifyMobileOtp,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/realAuthController';
import { getProfile } from '../controllers/authController';
import { authenticateJWT, verifyCaptcha, loginRateLimiter, otpRateLimiter } from '../middleware/authMiddleware';

const router = Router();

// OTP Endpoints
router.post('/send-email-otp', otpRateLimiter, verifyCaptcha, sendEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/send-mobile-otp', otpRateLimiter, verifyCaptcha, sendMobileOtp);
router.post('/verify-mobile-otp', verifyMobileOtp);

// Registration & Authentication
router.post('/register', verifyCaptcha, register);
router.post('/login', loginRateLimiter, verifyCaptcha, login);
router.post('/logout', logout);

// Password Recovery
router.post('/forgot-password', otpRateLimiter, verifyCaptcha, forgotPassword);
router.post('/reset-password', verifyCaptcha, resetPassword);

// Session Profile
router.get('/me', authenticateJWT, getMe);
router.get('/profile', getProfile);

export default router;
