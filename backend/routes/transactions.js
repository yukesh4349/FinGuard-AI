import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/transactions
router.get('/', requireRoles(['owner', 'financier']), (req, res) => {
  const transactions = db.getTable('transactions').filter(t => t.user_id === req.shopId);
  res.json({ success: true, transactions });
});

// POST /api/transactions
router.post('/', requireRoles(['owner', 'financier', 'cashier']), (req, res) => {
  const { description, type, amount, category } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ success: false, error: 'Description and Amount are required.' });
  }

  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

  const amountStr = String(amount);
  const newTxn = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    user_id: req.shopId,
    description,
    type: type || 'IN',
    category: category || 'General Store',
    amount: amountStr.startsWith('₹') || amountStr.startsWith('-₹') || amountStr.startsWith('+₹') ? amountStr : `₹ ${amountStr}`,
    timestamp,
    status: 'Cleared',
  };

  db.insert('transactions', newTxn);
  res.status(201).json({ success: true, transaction: newTxn });
});

export default router;
