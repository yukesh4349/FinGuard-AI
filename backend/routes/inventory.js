import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/inventory
router.get('/', (req, res) => {
  const inventory = db.getTable('inventory');
  res.json({ success: true, inventory });
});

// POST /api/inventory
router.post('/', (req, res) => {
  const { name, category, stockQty, minAlertThreshold, unitPrice, supplier } = req.body;
  if (!name || stockQty === undefined) {
    return res.status(400).json({ success: false, error: 'Item Name and Stock Quantity are required.' });
  }

  const qty = parseInt(stockQty);
  const threshold = parseInt(minAlertThreshold || 15);

  const newItem = {
    id: `SKU-${Math.floor(100 + Math.random() * 900)}`,
    name,
    category: category || 'General Store',
    stockQty: qty,
    minAlertThreshold: threshold,
    unitPrice: unitPrice.toString().startsWith('₹') ? unitPrice : `₹ ${unitPrice}`,
    status: qty <= threshold ? 'Low Stock Alert' : 'Healthy Stock',
    supplier: supplier || 'General Supplier',
  };

  db.insert('inventory', newItem);
  res.status(201).json({ success: true, item: newItem });
});

// PUT /api/inventory/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.update('inventory', item => item.id === id, updates);

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Item not found.' });
  }

  if (updated.stockQty <= (updated.minAlertThreshold || 15)) {
    updated.status = 'Low Stock Alert';
  } else {
    updated.status = 'Healthy Stock';
  }
  db.save();

  res.json({ success: true, item: updated });
});

export default router;
