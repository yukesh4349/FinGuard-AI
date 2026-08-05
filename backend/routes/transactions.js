import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/transactions
router.get('/', (req, res) => {
  const transactions = db.getTable('transactions');
  res.json({ success: true, transactions });
});

// POST /api/transactions
router.post('/', (req, res) => {
  const { description, type, amount } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ success: false, error: 'Description and Amount are required.' });
  }

  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

  const newTxn = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    description,
    type: type || 'INCOME',
    amount: amount.toString().startsWith('₹') ? amount : `₹ ${amount}`,
    timestamp,
    status: 'Cleared',
  };

  db.insert('transactions', newTxn);
  res.status(201).json({ success: true, transaction: newTxn });
});

export default router;
