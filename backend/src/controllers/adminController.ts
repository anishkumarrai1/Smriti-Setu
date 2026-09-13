import { Request, Response } from 'express';
import { authService } from '../services/authService';

/**
 * Mask sensitive parts of mobile numbers for privacy in admin lists
 * e.g. "+91 98640 12345" -> "+91 98*** **345"
 */
const maskMobile = (mobile: string): string => {
  if (!mobile || mobile.length < 8) return '***';
  const prefix = mobile.slice(0, 5);
  const suffix = mobile.slice(-3);
  return `${prefix}*** **${suffix}`;
};

/**
 * Get all registered users (Search, filter, paginate)
 */
export const getAdminUsers = (req: Request, res: Response) => {
  try {
    const search = ((req.query.search as string) || '').toLowerCase();
    const roleFilter = (req.query.role as string) || 'all';
    const statusFilter = (req.query.status as string) || 'all';

    let users = authService.getAllUsers();

    if (search) {
      users = users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.mobileNumber.includes(search) ||
          u.id.toLowerCase().includes(search)
      );
    }

    if (roleFilter !== 'all') {
      users = users.filter((u) => u.role === roleFilter || u.assignedRole === roleFilter);
    }

    if (statusFilter !== 'all') {
      users = users.filter((u) => u.accountStatus === statusFilter);
    }

    // Mask mobile numbers unless explicit unmask is requested by authorized admin
    const maskedUsers = users.map((u) => ({
      ...u,
      mobileNumberMasked: maskMobile(u.mobileNumber),
    }));

    res.json({
      totalCount: maskedUsers.length,
      users: maskedUsers,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve admin users', details: error.message });
  }
};

/**
 * Get single user by ID
 */
export const getAdminUserById = (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = authService.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      ...safeUser,
      mobileNumberMasked: maskMobile(safeUser.mobileNumber),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve user details', details: error.message });
  }
};

/**
 * Update user account status (active | suspended)
 */
export const updateUserStatus = (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (status !== 'active' && status !== 'suspended') {
      return res.status(400).json({ error: 'Status must be active or suspended.' });
    }

    const updated = authService.updateUserStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: `User account status updated to ${status}.`, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user status', details: error.message });
  }
};

/**
 * Get Login Activity Audit Logs
 */
export const getAdminLoginActivity = (req: Request, res: Response) => {
  try {
    const statusFilter = (req.query.status as string) || 'all';
    const search = ((req.query.search as string) || '').toLowerCase();

    let logs = authService.getLoginActivityLogs();

    if (statusFilter !== 'all') {
      logs = logs.filter((l) => l.status === statusFilter);
    }

    if (search) {
      logs = logs.filter(
        (l) =>
          l.identifier.toLowerCase().includes(search) ||
          l.ipAddress.includes(search) ||
          l.authMethod.toLowerCase().includes(search) ||
          (l.userId && l.userId.toLowerCase().includes(search))
      );
    }

    res.json({
      totalLogs: logs.length,
      logs,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve login activity logs', details: error.message });
  }
};

/**
 * Get Security & Auth Telemetry Stats
 */
export const getAdminStats = (req: Request, res: Response) => {
  try {
    const users = authService.getAllUsers();
    const logs = authService.getLoginActivityLogs();

    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const activeUsers = users.filter((u) => u.accountStatus === 'active').length;
    const suspendedUsers = users.filter((u) => u.accountStatus === 'suspended').length;
    const emailVerifiedCount = users.filter((u) => u.emailVerified).length;
    const mobileVerifiedCount = users.filter((u) => u.mobileVerified).length;

    const totalLogins = logs.length;
    const successfulLogins = logs.filter((l) => l.status === 'success').length;
    const failedLogins = logs.filter((l) => l.status === 'failed').length;

    res.json({
      totalUsers,
      adminCount,
      activeUsers,
      suspendedUsers,
      emailVerifiedCount,
      mobileVerifiedCount,
      totalLogins,
      successfulLogins,
      failedLogins,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve admin stats', details: error.message });
  }
};

/**
 * Export all users as CSV / Excel format
 */
export const exportUsersCSV = (req: Request, res: Response) => {
  try {
    const users = authService.getAllUsers();
    
    // CSV Header
    const headers = [
      'User ID',
      'Full Name',
      'Email',
      'Email Verified',
      'Mobile Number',
      'Mobile Verified',
      'Role',
      'Assigned Role',
      'Account Status',
      'Registered At',
      'Last Login At',
      'Region',
      'State',
      'District',
      'Facility Name'
    ];

    const rows = users.map((u) => [
      `"${u.id || ''}"`,
      `"${(u.fullName || '').replace(/"/g, '""')}"`,
      `"${u.email || ''}"`,
      u.emailVerified ? 'YES' : 'NO',
      `"${u.mobileNumber || ''}"`,
      u.mobileVerified ? 'YES' : 'NO',
      `"${u.role || ''}"`,
      `"${u.assignedRole || ''}"`,
      `"${u.accountStatus || ''}"`,
      `"${u.createdAt || ''}"`,
      `"${u.lastLoginAt || ''}"`,
      `"${u.hierarchy?.region || ''}"`,
      `"${u.hierarchy?.state || ''}"`,
      `"${u.hierarchy?.district || ''}"`,
      `"${(u.hierarchy?.facilityName || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="smriti_setu_users_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export CSV', details: error.message });
  }
};

/**
 * Export all users & login history as JSON for MongoDB / Database import
 */
export const exportUsersJSON = (req: Request, res: Response) => {
  try {
    const users = authService.getAllUsers();
    const loginLogs = authService.getLoginActivityLogs();

    const exportPayload = {
      platform: 'Smriti-Setu Cognitive Care Platform',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      collection: 'users',
      totalRecords: users.length,
      schema: {
        id: 'String (Primary Key)',
        fullName: 'String',
        email: 'String (Unique)',
        emailVerified: 'Boolean',
        mobileNumber: 'String',
        mobileVerified: 'Boolean',
        role: 'String (admin | user)',
        assignedRole: 'String (patient | caregiver | clinician)',
        accountStatus: 'String (active | suspended)',
        createdAt: 'ISO8601 Date',
        updatedAt: 'ISO8601 Date',
        lastLoginAt: 'ISO8601 Date',
        hierarchy: 'Object { region, state, district, facilityId, facilityName }'
      },
      mongoImportGuide: 'To import into MongoDB: mongoimport --db smriti_setu --collection users --file users.json --jsonArray',
      users,
      loginHistory: loginLogs
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="smriti_setu_mongodb_export_${Date.now()}.json"`);
    res.status(200).send(JSON.stringify(exportPayload, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export JSON', details: error.message });
  }
};
