import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const users = await db.fetchTable('users');
    const sanitized = users.map(u => ({
      id: u.id,
      user_id: u.user_id,
      company_name: u.company_name,
      company_address: u.company_address || '',
      business_type: u.business_type || '',
      employee_count: u.employee_count || '5',
      mobile_number: u.mobile_number,
      email: u.email,
      role: u.role,
      owner_id: u.owner_id || u.user_id,
      created_at: u.created_at,
    }));
    res.json({ success: true, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ success: false, error: 'User ID / Email and Password are required.' });
    }

    const users = await db.fetchTable('users');
    const user = users.find(u =>
      (u.user_id === userId || u.email === userId || u.mobile_number === userId) &&
      u.password_hash === password
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. User ID, Mobile number or Password is incorrect.' });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        user_id: user.user_id,
        company_name: user.company_name,
        company_address: user.company_address || '',
        business_type: user.business_type || '',
        employee_count: user.employee_count || '5',
        mobile_number: user.mobile_number,
        email: user.email,
        role: user.role,
        owner_id: user.owner_id || user.user_id,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { companyName, companyAddress, businessType, employeeCount, mobileNumber, email, password, role, ownerId } = req.body;
    if (!companyName || !mobileNumber || !password) {
      return res.status(400).json({ success: false, error: 'Company Name, Mobile Number, and Password are required.' });
    }

    const users = await db.fetchTable('users');
    const exists = users.some(u => u.mobile_number === mobileNumber || (email && u.email === email));
    if (exists) {
      return res.status(409).json({ success: false, error: 'Account with this mobile number or email already exists.' });
    }

    const isOwner = role === 'owner' || !role;
    const newId = isOwner ? `OWNER-${Math.floor(1000 + Math.random() * 9000)}` : `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      user_id: newId,
      company_name: companyName,
      company_address: companyAddress || '',
      business_type: businessType || 'General Store',
      employee_count: String(employeeCount || '5'),
      mobile_number: mobileNumber,
      email: email || `${mobileNumber}@finguard.ai`,
      password_hash: password,
      role: role || 'owner',
      owner_id: ownerId || (isOwner ? newId : null),
    };

    const saved = await db.insert('users', newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully in FinGuard AI database!',
      user: {
        id: saved.id,
        user_id: saved.user_id,
        company_name: saved.company_name,
        company_address: saved.company_address,
        business_type: saved.business_type,
        employee_count: saved.employee_count,
        mobile_number: saved.mobile_number,
        email: saved.email,
        role: saved.role,
        owner_id: saved.owner_id || saved.user_id,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
