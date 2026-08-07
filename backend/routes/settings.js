import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/settings
router.get('/', (req, res) => {
  const shopId = req.shopId;
  if (!db.data.settings) db.data.settings = {};

  // Migrate existing global settings to OWNER-METRO-8492 if settings is in old format
  if (db.data.settings && !db.data.settings['OWNER-METRO-8492'] && db.data.settings.business_profile) {
    const oldSettings = { ...db.data.settings };
    db.data.settings = {
      'OWNER-METRO-8492': oldSettings
    };
    db.save();
  }

  let settings = db.data.settings[shopId];
  if (!settings) {
    settings = {
      business_profile: {
        company_name: 'Metro Superstore Ltd',
        legal_name: 'Metro Retail & Distribution Private Limited',
        gstin: '33AABCM8291M1Z5',
        pan: 'AABCM8291M',
        business_type: 'Supermarket & FMCG Retail',
        registration_date: '2021-04-15',
      },
      shop_info: {
        store_code: 'STORE-HQ-01',
        branch_name: 'Main Flagship Store - Anna Nagar',
        address: 'Plot 42, 2nd Avenue, Anna Nagar East, Chennai, Tamil Nadu 600102',
        phone: '+91 98765 43210',
        email: 'store@metrosuperstore.in',
        currency: 'INR (₹)',
        timezone: 'Asia/Kolkata (IST)',
        operating_hours: '08:00 AM - 10:30 PM (Mon-Sun)',
      },
      security: {
        two_factor_auth: false,
        session_timeout_minutes: 60,
        enforce_strong_passwords: true,
        allow_multi_device_login: true,
        ip_whitelist_enabled: false,
      },
      app_preferences: {
        theme: 'dark',
        date_format: 'DD/MM/YYYY',
        auto_backup_enabled: true,
        invoice_prefix: 'INV-2026-',
        barcode_scanner_auto_submit: true,
      },
    };
    db.data.settings[shopId] = settings;
    db.save();
  }

  const roles = db.data.roles_permissions || [];
  res.json({ success: true, settings, roles });
});

// PUT /api/settings (Owner only)
router.put('/', requireRoles(['owner']), (req, res) => {
  const updates = req.body;
  const shopId = req.shopId;
  if (!db.data.settings) db.data.settings = {};
  if (!db.data.settings[shopId]) db.data.settings[shopId] = {};

  const settings = db.data.settings[shopId];

  if (updates.business_profile) {
    settings.business_profile = {
      ...settings.business_profile,
      ...updates.business_profile,
    };
  }

  if (updates.shop_info) {
    settings.shop_info = {
      ...settings.shop_info,
      ...updates.shop_info,
    };
  }

  if (updates.security) {
    settings.security = {
      ...settings.security,
      ...updates.security,
    };
  }

  if (updates.app_preferences) {
    settings.app_preferences = {
      ...settings.app_preferences,
      ...updates.app_preferences,
    };
  }

  db.save();

  // Audit log
  db.insert('activity_logs', {
    id: `LOG-${Date.now()}`,
    user_id: shopId,
    action: '⚙️ Settings Updated',
    details: 'Store settings and business configurations were updated by Owner.',
    category: 'Settings',
    created_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Store settings updated successfully.',
    settings: settings,
  });
});

// POST /api/settings/change-password
router.post('/change-password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const users = db.getTable('users');
  const user = users.find(u => (u.user_id === userId || u.email === userId) && u.password_hash === currentPassword);

  if (!user) {
    return res.status(401).json({ success: false, error: 'Current password does not match.' });
  }

  user.password_hash = newPassword;
  db.save();

  res.json({ success: true, message: 'Password changed successfully.' });
});

export default router;
