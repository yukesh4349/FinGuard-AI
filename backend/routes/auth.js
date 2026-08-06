import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/auth/users
router.get('/users', (req, res) => {
  const users = db.getTable('users');
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
    created_at: u.created_at,
  }));
  res.json({ success: true, users: sanitized });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { userId, password, role } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ success: false, error: 'User ID / Email and Password are required.' });
  }

  const users = db.getTable('users');
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
    },
  });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { companyName, companyAddress, businessType, employeeCount, mobileNumber, email, password, role } = req.body;
  if (!companyName || !mobileNumber || !password) {
    return res.status(400).json({ success: false, error: 'Company Name, Mobile Number, and Password are required.' });
  }

  const users = db.getTable('users');
  const exists = users.some(u => u.mobile_number === mobileNumber || (email && u.email === email));
  if (exists) {
    return res.status(409).json({ success: false, error: 'Account with this mobile number or email already exists.' });
  }

  const newId = `OWNER-${Math.floor(1000 + Math.random() * 9000)}`;
  const newUser = {
    id: users.length + 1,
    user_id: newId,
    company_name: companyName,
    company_address: companyAddress || '',
    business_type: businessType || 'General Store',
    employee_count: String(employeeCount || req.body.employee_count || '5'),
    mobile_number: mobileNumber,
    email: email || `${mobileNumber}@finguard.ai`,
    password_hash: password,
    role: role || 'owner',
    created_at: new Date().toISOString(),
  };

  db.insert('users', newUser);

  res.status(201).json({
    success: true,
    message: 'Account created successfully in FinGuard AI database!',
    user: {
      id: newUser.id,
      user_id: newUser.user_id,
      company_name: newUser.company_name,
      company_address: newUser.company_address,
      business_type: newUser.business_type,
      employee_count: newUser.employee_count,
      mobile_number: newUser.mobile_number,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

export default router;
