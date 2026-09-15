import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { UserRecord, LoginActivityLog, PasswordValidationResult } from '../models/UserTypes';

const JWT_SECRET = process.env.JWT_SECRET || 'smriti_setu_secure_jwt_secret_key_2026_ner_healthcare_portal!';

class AuthService {
  private usersMap: Map<string, UserRecord> = new Map();
  private loginLogs: LoginActivityLog[] = [];
  private dataDir: string;
  private usersFilePath: string;
  private logsFilePath: string;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.usersFilePath = path.join(this.dataDir, 'users.json');
    this.logsFilePath = path.join(this.dataDir, 'login_activity.json');

    this.ensureDataDir();
    this.loadFromDisk();
    this.seedInitialAdmin();
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        console.error('[AUTH STORAGE] Could not create data directory:', err);
      }
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const data = fs.readFileSync(this.usersFilePath, 'utf-8');
        const usersArray: UserRecord[] = JSON.parse(data);
        usersArray.forEach((u) => this.usersMap.set(u.id, u));
        console.log(`[AUTH STORAGE] Loaded ${this.usersMap.size} user records from ${this.usersFilePath}`);
      }
      if (fs.existsSync(this.logsFilePath)) {
        const logsData = fs.readFileSync(this.logsFilePath, 'utf-8');
        this.loginLogs = JSON.parse(logsData);
      }
    } catch (err) {
      console.error('[AUTH STORAGE] Error reading persisted user records:', err);
    }
  }

  private saveToDisk() {
    try {
      this.ensureDataDir();
      const usersArray = Array.from(this.usersMap.values());
      fs.writeFileSync(this.usersFilePath, JSON.stringify(usersArray, null, 2), 'utf-8');
      fs.writeFileSync(this.logsFilePath, JSON.stringify(this.loginLogs.slice(0, 500), null, 2), 'utf-8');
    } catch (err) {
      console.error('[AUTH STORAGE] Error saving user records to disk:', err);
    }
  }

  /**
   * Seed the default administrator account from environment variables if not existing
   */
  private async seedInitialAdmin() {
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@smritisetu.gov.in').toLowerCase();
    const adminPass = process.env.INITIAL_ADMIN_PASSWORD || 'Admin12!';
    const adminName = process.env.INITIAL_ADMIN_NAME || 'NHA Regional Administrator';

    if (!this.findByEmail(adminEmail)) {
      const passwordHash = await bcrypt.hash(adminPass, 10);
      const adminUser: UserRecord = {
        id: 'usr-admin-001',
        fullName: adminName,
        email: adminEmail,
        emailVerified: true,
        mobileNumber: '+919999900000',
        mobileVerified: true,
        passwordHash,
        role: 'admin',
        assignedRole: 'clinician',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        hierarchy: {
          region: 'North Eastern Region',
          state: 'Assam',
          district: 'Kamrup Metropolitan',
          facilityId: 'fac-ghy-01',
          facilityName: 'Guwahati Regional Cognitive Care Center',
        },
      };

      this.usersMap.set(adminUser.id, adminUser);
      console.log(`[SEED] Initial Admin account initialized: ${adminEmail}`);
    }

    // Seed Patient 1: Ranjit Borthakur
    if (!this.findByEmail('patient@smritisetu.gov.in')) {
      const passwordHash = await bcrypt.hash('Patient12!', 10);
      const patientUser: UserRecord = {
        id: 'pat-ner-001',
        fullName: 'Ranjit Borthakur',
        email: 'patient@smritisetu.gov.in',
        emailVerified: true,
        mobileNumber: '+919864012345',
        mobileVerified: true,
        passwordHash,
        role: 'user',
        assignedRole: 'patient',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
        hierarchy: {
          region: 'North Eastern Region',
          state: 'Assam',
          district: 'Kamrup Metropolitan',
          facilityId: 'fac-ghy-01',
          facilityName: 'Guwahati Regional Cognitive Care Center',
        },
      };
      this.usersMap.set(patientUser.id, patientUser);
      console.log(`[SEED] Patient account initialized: patient@smritisetu.gov.in`);
    }

    // Seed Patient 2: Hemanta Saikia
    if (!this.findByEmail('hemanta.saikia@smritisetu.gov.in')) {
      const passwordHash = await bcrypt.hash('Patient12!', 10);
      const patientUser: UserRecord = {
        id: 'pat-ner-002',
        fullName: 'Hemanta Saikia',
        email: 'hemanta.saikia@smritisetu.gov.in',
        emailVerified: true,
        mobileNumber: '+919435056789',
        mobileVerified: true,
        passwordHash,
        role: 'user',
        assignedRole: 'patient',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        hierarchy: {
          region: 'North Eastern Region',
          state: 'Assam',
          district: 'Jorhat',
          facilityId: 'fac-ghy-01',
          facilityName: 'Guwahati Regional Cognitive Care Center',
        },
      };
      this.usersMap.set(patientUser.id, patientUser);
      console.log(`[SEED] Patient account initialized: hemanta.saikia@smritisetu.gov.in`);
    }

    // Seed Patient 3: Moarenla Jamir
    if (!this.findByEmail('moarenla.jamir@smritisetu.gov.in')) {
      const passwordHash = await bcrypt.hash('Patient12!', 10);
      const patientUser: UserRecord = {
        id: 'pat-ner-003',
        fullName: 'Moarenla Jamir',
        email: 'moarenla.jamir@smritisetu.gov.in',
        emailVerified: true,
        mobileNumber: '+919436012890',
        mobileVerified: true,
        passwordHash,
        role: 'user',
        assignedRole: 'patient',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
        hierarchy: {
          region: 'North Eastern Region',
          state: 'Nagaland',
          district: 'Kohima',
          facilityId: 'fac-ghy-01',
          facilityName: 'Guwahati Regional Cognitive Care Center',
        },
      };
      this.usersMap.set(patientUser.id, patientUser);
      console.log(`[SEED] Patient account initialized: moarenla.jamir@smritisetu.gov.in`);
    }

    // Seed Patient 4: Tenzing Norbu
    if (!this.findByEmail('tenzing.norbu@smritisetu.gov.in')) {
      const passwordHash = await bcrypt.hash('Patient12!', 10);
      const patientUser: UserRecord = {
        id: 'pat-ner-004',
        fullName: 'Tenzing Norbu',
        email: 'tenzing.norbu@smritisetu.gov.in',
        emailVerified: true,
        mobileNumber: '+919436098712',
        mobileVerified: true,
        passwordHash,
        role: 'user',
        assignedRole: 'patient',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        hierarchy: {
          region: 'North Eastern Region',
          state: 'Arunachal Pradesh',
          district: 'Tawang',
          facilityId: 'fac-ghy-01',
          facilityName: 'Guwahati Regional Cognitive Care Center',
        },
      };
      this.usersMap.set(patientUser.id, patientUser);
      console.log(`[SEED] Patient account initialized: tenzing.norbu@smritisetu.gov.in`);
    }

    // Seed Caregiver Account
    if (!this.findByEmail('caregiver@smritisetu.gov.in')) {
      const passwordHash = await bcrypt.hash('Caregiver12!', 10);
      const caregiverUser: UserRecord = {
        id: 'cg-ner-002',
        fullName: 'Ananya Borthakur',
        email: 'caregiver@smritisetu.gov.in',
        emailVerified: true,
        mobileNumber: '+919864099887',
        mobileVerified: true,
        passwordHash,
        role: 'user',
        assignedRole: 'caregiver',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.usersMap.set(caregiverUser.id, caregiverUser);
      console.log(`[SEED] Caregiver account initialized: caregiver@smritisetu.gov.in`);
    }

    // Seed Doctor Account
    if (!this.findByEmail('doctor@smritisetu.gov.in')) {
      const passwordHash = await bcrypt.hash('Doctor12!', 10);
      const doctorUser: UserRecord = {
        id: 'doc-ner-003',
        fullName: 'Dr. Bikash Barua',
        email: 'doctor@smritisetu.gov.in',
        emailVerified: true,
        mobileNumber: '+919864077665',
        mobileVerified: true,
        passwordHash,
        role: 'user',
        assignedRole: 'clinician',
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.usersMap.set(doctorUser.id, doctorUser);
      console.log(`[SEED] Doctor account initialized: doctor@smritisetu.gov.in`);
    }

    this.saveToDisk();
  }

  /**
   * Validate password against requirements:
   * - Max 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 numeric digit
   * - At least 1 special character
   * - No spaces
   */
  public validatePassword(password: string): PasswordValidationResult {
    const p = password || '';
    const errors = {
      maxLength: p.length > 0 && p.length <= 8,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p),
      noSpaces: !/\s/.test(p),
    };

    const isValid = Object.values(errors).every(Boolean);
    return { isValid, errors };
  }

  public findByEmail(email: string): UserRecord | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return Array.from(this.usersMap.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  }

  public findByMobile(mobileNumber: string): UserRecord | undefined {
    const cleanMobile = mobileNumber.trim();
    return Array.from(this.usersMap.values()).find((u) => u.mobileNumber === cleanMobile);
  }

  public findById(id: string): UserRecord | undefined {
    return this.usersMap.get(id);
  }

  /**
   * Create a new user account
   */
  public async createUser(data: {
    fullName: string;
    email: string;
    emailVerified: boolean;
    mobileNumber: string;
    mobileVerified: boolean;
    passwordPlain: string;
    assignedRole?: 'patient' | 'caregiver' | 'clinician';
  }): Promise<{ user: Omit<UserRecord, 'passwordHash'>; token: string }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanMobile = data.mobileNumber.trim();

    if (this.findByEmail(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    if (this.findByMobile(cleanMobile)) {
      throw new Error('An account with this mobile number already exists.');
    }

    const passCheck = this.validatePassword(data.passwordPlain);
    if (!passCheck.isValid) {
      throw new Error('Password does not satisfy all safety requirements (Max 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 symbol, no spaces).');
    }

    const passwordHash = await bcrypt.hash(data.passwordPlain, 10);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const newUser: UserRecord = {
      id: userId,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      emailVerified: data.emailVerified,
      mobileNumber: cleanMobile,
      mobileVerified: data.mobileVerified,
      passwordHash,
      role: 'user',
      assignedRole: data.assignedRole || 'patient',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      hierarchy: {
        region: 'North Eastern Region',
        state: 'Assam',
        district: 'Kamrup Metropolitan',
        facilityId: 'fac-ghy-01',
        facilityName: 'Guwahati Regional Cognitive Care Center',
      },
    };

    this.usersMap.set(userId, newUser);
    this.saveToDisk();

    const token = this.generateJWTToken(newUser);

    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  /**
   * Authenticate User by Email or Mobile + Password
   */
  public async loginUser(
    identifier: string,
    passwordPlain: string,
    clientInfo: { ipAddress: string; userAgent: string }
  ): Promise<{ user: Omit<UserRecord, 'passwordHash'>; token: string }> {
    const cleanId = identifier.trim().toLowerCase();
    
    // Check by email or mobile number
    let user = this.findByEmail(cleanId);
    let authMethod: LoginActivityLog['authMethod'] = 'email_password';

    if (!user) {
      user = this.findByMobile(identifier.trim());
      authMethod = 'mobile_password';
    }

    if (!user) {
      this.logActivity({
        identifier: cleanId,
        status: 'failed',
        authMethod,
        failureReason: 'Account does not exist',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });
      throw new Error('Invalid authentication credentials.');
    }

    if (user.accountStatus === 'suspended') {
      this.logActivity({
        userId: user.id,
        identifier: cleanId,
        status: 'failed',
        authMethod,
        failureReason: 'Account suspended',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });
      throw new Error('This account has been suspended. Please contact hospital administrator.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      this.logActivity({
        userId: user.id,
        identifier: cleanId,
        status: 'failed',
        authMethod,
        failureReason: 'Incorrect password',
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });
      throw new Error('Invalid authentication credentials.');
    }

    // Success! Update last login timestamp
    user.lastLoginAt = new Date().toISOString();
    user.lastActivityAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    this.usersMap.set(user.id, user);

    this.logActivity({
      userId: user.id,
      identifier: cleanId,
      status: 'success',
      authMethod,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    this.saveToDisk();

    const token = this.generateJWTToken(user);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Reset Password flow
   */
  public async resetPassword(
    identifier: string,
    newPasswordPlain: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanId = identifier.trim().toLowerCase();
    let user = this.findByEmail(cleanId) || this.findByMobile(identifier.trim());

    if (!user) {
      throw new Error('No user account found matching this identifier.');
    }

    const passCheck = this.validatePassword(newPasswordPlain);
    if (!passCheck.isValid) {
      throw new Error('New password does not satisfy all safety requirements.');
    }

    const newHash = await bcrypt.hash(newPasswordPlain, 10);
    user.passwordHash = newHash;
    user.updatedAt = new Date().toISOString();
    this.usersMap.set(user.id, user);
    this.saveToDisk();

    return { success: true, message: 'Password updated successfully. Please log in with your new password.' };
  }

  /**
   * Generate JWT Token
   */
  public generateJWTToken(user: UserRecord): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        assignedRole: user.assignedRole,
        fullName: user.fullName,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT Token
   */
  public verifyJWTToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  /**
   * Log login audit activity
   */
  public logActivity(log: Omit<LoginActivityLog, 'id' | 'timestamp'>) {
    const entry: LoginActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.loginLogs.unshift(entry);
    this.saveToDisk();
  }

  // Admin Data Getters
  public getAllUsers(): Omit<UserRecord, 'passwordHash'>[] {
    return Array.from(this.usersMap.values()).map(({ passwordHash, ...safe }) => safe);
  }

  public getAllUsersWithSecurity(): UserRecord[] {
    return Array.from(this.usersMap.values());
  }

  public getLoginActivityLogs(): LoginActivityLog[] {
    return this.loginLogs;
  }

  public async adminSetPassword(userId: string, newPasswordPlain: string): Promise<UserRecord> {
    const user = this.usersMap.get(userId);
    if (!user) {
      throw new Error('User account not found.');
    }
    const newHash = await bcrypt.hash(newPasswordPlain, 10);
    user.passwordHash = newHash;
    user.updatedAt = new Date().toISOString();
    this.usersMap.set(userId, user);
    this.saveToDisk();
    return user;
  }

  public updateUserStatus(userId: string, status: 'active' | 'suspended'): UserRecord | undefined {
    const user = this.usersMap.get(userId);
    if (!user) return undefined;
    user.accountStatus = status;
    user.updatedAt = new Date().toISOString();
    this.usersMap.set(userId, user);
    this.saveToDisk();
    return user;
  }

  public updateUserProfile(userId: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const user = this.usersMap.get(userId);
    if (!user) return undefined;
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
    if (updates.mobileNumber) user.mobileNumber = updates.mobileNumber;
    user.updatedAt = new Date().toISOString();
    this.usersMap.set(userId, user);
    this.saveToDisk();
    return user;
  }
}

export const authService = new AuthService();
