export type UserSystemRole = 'user' | 'admin';
export type UserPersonaRole = 'patient' | 'caregiver' | 'clinician';
export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  mobileNumber: string;
  mobileVerified: boolean;
  passwordHash: string;
  role: UserSystemRole;
  assignedRole: UserPersonaRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastActivityAt?: string;
  avatarUrl?: string;
  hierarchy?: {
    region: string;
    state: string;
    district: string;
    facilityId: string;
    facilityName: string;
  };
}

export interface OTPRecord {
  id: string;
  target: string; // Email or Mobile Number
  channel: 'email' | 'mobile';
  otpHash: string;
  expiresAt: number; // Unix epoch ms
  resendCooldownUntil: number; // Unix epoch ms
  attemptsCount: number;
}

export interface LoginActivityLog {
  id: string;
  userId?: string;
  identifier: string; // Email or Mobile Number
  status: 'success' | 'failed';
  authMethod: 'email_password' | 'mobile_password' | 'email_otp' | 'mobile_otp';
  failureReason?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: {
    maxLength: boolean; // Max 8 chars
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    noSpaces: boolean;
  };
}
