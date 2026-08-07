import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/vendors
router.get('/', requireRoles(['owner', 'store_manager']), (req, res) => {
  const vendors = db.getTable('vendors').filter(v => v.user_id === req.shopId);
  res.json({ success: true, vendors });
});

// POST /api/vendors
router.post('/', requireRoles(['owner', 'store_manager']), (req, res) => {
  const { name, contactPerson, phone, gstin } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Vendor name is required.' });
  }

  const newVendor = {
    id: `VEND-${Math.floor(10 + Math.random() * 90)}`,
    user_id: req.shopId,
    name,
    contactPerson: contactPerson || 'N/A',
    phone: phone || 'N/A',
    gstin: gstin || 'Unverified GSTIN',
    totalBilled: '₹ 0',
    trustScore: '100% (New Vendor)',
  };

  db.insert('vendors', newVendor);
  res.status(201).json({ success: true, vendor: newVendor });
});

export default router;
