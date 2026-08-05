import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/payments
router.get('/', (req, res) => {
  const payments = db.getTable('payments');
  res.json({ success: true, payments });
});

// POST /api/payments
router.post('/', (req, res) => {
  const { recipient, amount, mode } = req.body;
  if (!recipient || !amount) {
    return res.status(400).json({ success: false, error: 'Recipient and Amount are required.' });
  }

  const newPayment = {
    id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
    recipient,
    amount: amount.toString().startsWith('₹') ? amount : `₹ ${amount}`,
    date: new Date().toISOString().split('T')[0],
    mode: mode || 'UPI / Bank Transfer',
    status: 'Completed',
  };

  db.insert('payments', newPayment);
  res.status(201).json({ success: true, payment: newPayment });
});

export default router;
