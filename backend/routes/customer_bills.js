import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/customer-bills - fetch all customer bills scoped by shop_id (requires owner or financier or cashier)
router.get('/', requireRoles(['owner', 'financier', 'cashier']), (req, res) => {
  const shopId = req.shopId;
  const bills = db.getTable('customer_bills').filter(b => b.user_id === shopId);
  res.json({ success: true, bills });
});

// POST /api/customer-bills - create a new customer bill (requires owner or cashier)
router.post('/', requireRoles(['owner', 'cashier']), (req, res) => {
  const shopId = req.shopId;
  const { bill_number, customer_name, customer_phone, subtotal, tax_gst, grand_total, profit_earned, items, status, due_date } = req.body;

  if (!customer_name || !grand_total) {
    return res.status(400).json({ success: false, error: 'Customer name and total amount are required.' });
  }

  const billNo = bill_number || `BILL-${Math.floor(100000 + Math.random() * 900000)}`;

  const newBill = {
    id: `bill-${Date.now()}`,
    user_id: shopId,
    bill_number: billNo,
    customer_name,
    customer_phone: customer_phone || 'N/A',
    subtotal: parseFloat(subtotal || grand_total),
    tax_gst: parseFloat(tax_gst || 0),
    grand_total: parseFloat(grand_total),
    profit_earned: parseFloat(profit_earned || 0),
    status: status || 'Paid',
    due_date: due_date || null,
    payment_date: status === 'Paid' ? new Date().toISOString().split('T')[0] : null,
    items: items || [],
    created_at: new Date().toISOString(),
  };

  db.insert('customer_bills', newBill);

  // If status is Paid, immediately insert transaction record!
  if (status === 'Paid') {
    db.insert('transactions', {
      id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: shopId,
      date: new Date().toISOString().split('T')[0],
      type: 'IN',
      description: `Customer POS Sale (Bill #${billNo} - ${customer_name})`,
      category: 'Sales Revenue',
      amount: `₹ ${parseFloat(grand_total).toLocaleString('en-IN')}`,
      balance: '₹ 14,80,000',
      created_at: new Date().toISOString(),
    });
  }

  res.status(201).json({ success: true, bill: newBill });
});

// PUT /api/customer-bills/:id/pay - mark a pending bill as paid
router.put('/:id/pay', requireRoles(['owner', 'cashier']), (req, res) => {
  const { id } = req.params;
  const shopId = req.shopId;

  const updated = db.update('customer_bills', b => b.id === id && b.user_id === shopId, bill => {
    bill.status = 'Paid';
    bill.payment_date = new Date().toISOString().split('T')[0];
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Pending bill not found.' });
  }

  // Insert transaction
  db.insert('transactions', {
    id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
    user_id: shopId,
    date: new Date().toISOString().split('T')[0],
    type: 'IN',
    description: `Paid Customer POS Bill #${updated.bill_number} - ${updated.customer_name}`,
    category: 'Sales Revenue',
    amount: `₹ ${parseFloat(updated.grand_total).toLocaleString('en-IN')}`,
    balance: '₹ 14,80,000',
    created_at: new Date().toISOString(),
  });

  // Audit Log
  db.insert('activity_logs', {
    id: `LOG-${Date.now()}`,
    user_id: shopId,
    action: '💳 Customer POS Bill Marked Paid',
    details: `Bill #${updated.bill_number} for '${updated.customer_name}' was marked paid - Amount: ₹ ${parseFloat(updated.grand_total).toLocaleString('en-IN')}`,
    category: 'POS Sales',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, bill: updated });
});

export default router;
