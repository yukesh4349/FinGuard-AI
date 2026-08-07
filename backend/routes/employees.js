import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/employees (Owner only)
router.get('/', requireRoles(['owner']), (req, res) => {
  const employees = db.getTable('employees').filter(e => e.user_id === req.shopId);
  res.json({ success: true, employees });
});

// POST /api/employees (Owner only)
router.post('/', requireRoles(['owner']), (req, res) => {
  const { name, role, phone, salary, salary_date } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, error: 'Full Name and Phone Number are required.' });
  }

  const salaryStr = String(salary || '30,000');
  const salaryDay = String(salary_date || '5');
  const newEmp = {
    id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    user_id: req.shopId,
    name,
    role: role || 'Store Executive',
    phone,
    salary: salaryStr.startsWith('₹') ? salaryStr : `₹ ${salaryStr}`,
    salary_date: salaryDay,
    payment_status: 'Unpaid',
    payment_history: [],
    status: 'Active',
    joined_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    created_at: new Date().toISOString(),
  };

  db.insert('employees', newEmp);
  res.status(201).json({ success: true, employee: newEmp, employees: db.getTable('employees').filter(e => e.user_id === req.shopId) });
});

// DELETE /api/employees/:id (Owner only)
router.delete('/:id', requireRoles(['owner']), (req, res) => {
  const { id } = req.params;
  const removed = db.delete('employees', emp => emp.id === id && emp.user_id === req.shopId);
  if (!removed) {
    return res.status(404).json({ success: false, error: 'Employee not found.' });
  }
  res.json({ success: true, message: 'Employee removed.', employees: db.getTable('employees').filter(e => e.user_id === req.shopId) });
});

// PUT /api/employees/:id/pay-salary (Owner only)
router.put('/:id/pay-salary', requireRoles(['owner']), (req, res) => {
  const { id } = req.params;
  const shopId = req.shopId;

  const updated = db.update('employees', emp => emp.id === id && emp.user_id === shopId, emp => {
    emp.payment_status = 'Paid';
    emp.payment_date = new Date().toISOString().split('T')[0];
    if (!emp.payment_history) emp.payment_history = [];
    emp.payment_history.push({
      date: new Date().toISOString().split('T')[0],
      amount: emp.salary,
      status: 'Paid',
    });
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Employee not found.' });
  }

  // Deduct salary from profit by inserting into expenses table!
  const salaryVal = parseFloat(String(updated.salary).replace(/[^0-9.]/g, '')) || 0;
  db.insert('expenses', {
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    user_id: shopId,
    category: 'Staff Salary',
    amount: salaryVal,
    date: new Date().toISOString().split('T')[0],
    paidTo: updated.name,
    status: 'Paid',
    created_at: new Date().toISOString(),
  });

  // Record transaction payout (OUTFLOW)
  db.insert('transactions', {
    id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
    user_id: shopId,
    date: new Date().toISOString().split('T')[0],
    type: 'OUT',
    description: `Staff Salary Payout - ${updated.name}`,
    category: 'Employee Salaries',
    amount: `-₹ ${salaryVal.toLocaleString('en-IN')}`,
    balance: '₹ 14,80,000',
    created_at: new Date().toISOString(),
  });

  // Record Audit Log
  db.insert('activity_logs', {
    id: `LOG-${Date.now()}`,
    user_id: shopId,
    action: '💵 Employee Salary Paid',
    details: `Paid salary of ₹ ${salaryVal.toLocaleString('en-IN')} to ${updated.name}`,
    category: 'Employees',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, employee: updated, employees: db.getTable('employees').filter(e => e.user_id === shopId) });
});

export default router;
