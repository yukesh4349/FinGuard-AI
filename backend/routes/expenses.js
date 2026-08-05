import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/expenses
router.get('/', (req, res) => {
  const expenses = db.getTable('expenses');
  res.json({ success: true, expenses });
});

// POST /api/expenses
router.post('/', (req, res) => {
  const { category, amount, paidTo } = req.body;
  if (!category || !amount) {
    return res.status(400).json({ success: false, error: 'Category and Amount are required.' });
  }

  const newExpense = {
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    category,
    amount: amount.toString().startsWith('₹') ? amount : `₹ ${amount}`,
    date: new Date().toISOString().split('T')[0],
    paidTo: paidTo || 'General Service',
    status: 'Paid',
  };

  db.insert('expenses', newExpense);
  res.status(201).json({ success: true, expense: newExpense });
});

export default router;
