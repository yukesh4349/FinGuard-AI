import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/employees (Owner only)
router.get('/', requireRoles(['owner']), async (req, res) => {
  try {
    const employees = await db.fetchScoped('employees', req.shopId);
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/employees (Owner only)
router.post('/', requireRoles(['owner']), async (req, res) => {
  try {
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
    };

    const saved = await db.insert('employees', newEmp);
    const employees = await db.fetchScoped('employees', req.shopId);
    res.status(201).json({ success: true, employee: saved, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/employees/:id (Owner only)
router.delete('/:id', requireRoles(['owner']), async (req, res) => {
  try {
    const { id } = req.params;
    // Verify the employee belongs to this shop before deleting
    const empList = await db.fetchScoped('employees', req.shopId);
    const emp = empList.find(e => e.id === id);
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }
    await db.delete('employees', 'id', id);
    const employees = await db.fetchScoped('employees', req.shopId);
    res.json({ success: true, message: 'Employee removed.', employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/employees/:id/pay-salary (Owner only)
router.put('/:id/pay-salary', requireRoles(['owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.shopId;

    // Fetch current employee record
    const empList = await db.fetchScoped('employees', shopId);
    const emp = empList.find(e => e.id === id);
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    // Build updated payment history
    const history = Array.isArray(emp.payment_history) ? emp.payment_history : [];
    history.push({
      date: new Date().toISOString().split('T')[0],
      amount: emp.salary,
      status: 'Paid',
    });

    // Update employee in Supabase
    const updated = await db.update('employees', 'id', id, {
      payment_status: 'Paid',
      payment_history: history,
    });

    const salaryVal = parseFloat(String(emp.salary).replace(/[^0-9.]/g, '')) || 0;

    // Deduct salary from profit via expense entry
    await db.insert('expenses', {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      user_id: shopId,
      category: 'Staff Salary',
      amount: salaryVal,
      date: new Date().toISOString().split('T')[0],
      paid_to: emp.name,
      status: 'Paid',
    });

    // Record cash-book transaction (OUTFLOW)
    await db.insert('transactions', {
      id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: shopId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: 'OUT',
      description: `Staff Salary Payout - ${emp.name}`,
      category: 'Employee Salaries',
      amount: `-₹ ${salaryVal.toLocaleString('en-IN')}`,
      balance: '—',
    });

    // Audit log
    await db.insert('activity_logs', {
      id: `LOG-${Date.now()}`,
      user_id: shopId,
      action: '💵 Employee Salary Paid',
      details: `Paid salary of ₹ ${salaryVal.toLocaleString('en-IN')} to ${emp.name}`,
      category: 'Employees',
    });

    const employees = await db.fetchScoped('employees', shopId);
    res.json({ success: true, employee: updated, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
