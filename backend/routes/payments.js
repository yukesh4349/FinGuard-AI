import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/payments
router.get('/', requireRoles(['owner', 'financier']), (req, res) => {
  const payments = db.getTable('payments').filter(p => p.user_id === req.shopId);
  res.json({ success: true, payments });
});

// POST /api/payments
router.post('/', requireRoles(['owner', 'financier']), (req, res) => {
  const { recipient, amount, mode } = req.body;
  if (!recipient || !amount) {
    return res.status(400).json({ success: false, error: 'Recipient and Amount are required.' });
  }

  const amountStr = String(amount);
  const newPayment = {
    id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
    user_id: req.shopId,
    recipient,
    amount: amountStr.startsWith('₹') ? amountStr : `₹ ${amountStr}`,
    date: new Date().toISOString().split('T')[0],
    mode: mode || 'UPI / Bank Transfer',
    status: 'Completed',
  };

  db.insert('payments', newPayment);
  res.status(201).json({ success: true, payment: newPayment });
});

export default router;
