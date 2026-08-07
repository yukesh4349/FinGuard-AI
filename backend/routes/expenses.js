import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/expenses (Owner & Financier only)
router.get('/', requireRoles(['owner', 'financier']), (req, res) => {
  const expenses = db.getTable('expenses').filter(e => e.user_id === req.shopId);
  res.json({ success: true, expenses });
});

// POST /api/expenses (Owner & Financier only)
router.post('/', requireRoles(['owner', 'financier']), (req, res) => {
  const { category, amount, paidTo } = req.body;
  if (!category || !amount) {
    return res.status(400).json({ success: false, error: 'Category and Amount are required.' });
  }

  const amountStr = String(amount);
  const newExpense = {
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    user_id: req.shopId,
    category,
    amount: amountStr.startsWith('₹') ? amountStr : `₹ ${amountStr}`,
    date: new Date().toISOString().split('T')[0],
    paidTo: paidTo || 'General Service',
    status: 'Paid',
  };

  db.insert('expenses', newExpense);
  res.status(201).json({ success: true, expense: newExpense });
});

export default router;
