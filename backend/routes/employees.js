import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/employees
router.get('/', (req, res) => {
  const employees = db.getTable('employees');
  res.json({ success: true, employees });
});

// POST /api/employees
router.post('/', (req, res) => {
  const { name, role, phone, salary } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, error: 'Full Name and Phone Number are required.' });
  }

  const newEmp = {
    id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name,
    role: role || 'Store Executive',
    phone,
    salary: salary.toString().startsWith('₹') ? salary : `₹ ${salary || '30,000'}`,
    status: 'Active',
    created_at: new Date().toISOString(),
  };

  db.insert('employees', newEmp);
  res.status(201).json({ success: true, employee: newEmp, employees: db.getTable('employees') });
});

// DELETE /api/employees/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const removed = db.delete('employees', emp => emp.id === id);
  if (!removed) {
    return res.status(404).json({ success: false, error: 'Employee not found.' });
  }
  res.json({ success: true, message: 'Employee removed.', employees: db.getTable('employees') });
});

export default router;
