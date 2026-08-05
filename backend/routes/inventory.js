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

// ══════════════════════════════════════════════════════════════════════════
// STOCK WEBHOOK EVENT ENGINE (TRIGGERS FOR STOCK LOADED & CUSTOMER BOUGHT)
// ══════════════════════════════════════════════════════════════════════════

// Secondary Webhook Listener Endpoint for Stock Updates
router.post('/webhook/stock-updates', (req, res) => {
  const { eventType, items, source, timestamp, referenceId } = req.body;

  console.log(`[SECONDARY WEBHOOK RECEIVED] Event: ${eventType} | Source: ${source} | Ref: ${referenceId}`);

  const webhookLog = {
    id: `WH-${Math.floor(1000 + Math.random() * 9000)}`,
    eventType,
    source: source || 'System Engine',
    referenceId: referenceId || 'REF-000',
    itemCount: Array.isArray(items) ? items.length : 1,
    timestamp: timestamp || new Date().toISOString(),
    status: 'DELIVERED_SUCCESS',
  };

  db.insert('webhooks', webhookLog);

  res.json({
    success: true,
    message: `Secondary Stock Webhook triggered and logged for event ${eventType}`,
    log: webhookLog,
  });
});

// Trigger Webhook Endpoint (Called when stock is loaded OR customer buys stock)
router.post('/webhook/trigger', (req, res) => {
  const { eventType, items, supplierName, customerName, billNo, source } = req.body;

  if (!eventType) {
    return res.status(400).json({ success: false, error: 'eventType (e.g. STOCK_IN_LOADED or STOCK_CUSTOMER_BOUGHT) is required.' });
  }

  const payload = {
    id: `WH-EVT-${Math.floor(10000 + Math.random() * 90000)}`,
    eventType: eventType === 'STOCK_IN_LOADED' ? 'STOCK_IN_LOADED (Vendor Purchase Loaded)' : 'STOCK_CUSTOMER_BOUGHT (Customer POS Billed)',
    source: source || (eventType === 'STOCK_IN_LOADED' ? `Vendor Bill Upload (${supplierName || 'Supplier'})` : `Customer POS Sale (${customerName || 'Retail Customer'})`),
    referenceId: billNo || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    items: items || [],
    timestamp: new Date().toISOString(),
    status: 'TRIGGERED_PROCESSED',
  };

  db.insert('webhooks', payload);

  console.log(`⚡ [WEBHOOK TRIGGERED] ${payload.eventType} for ${payload.referenceId}`);

  res.json({
    success: true,
    message: `Stock Webhook ${payload.eventType} successfully triggered and delivered.`,
    webhookEvent: payload,
  });
});

// GET /api/inventory/webhook/logs — Retrieve Webhook Event Logs
router.get('/webhook/logs', (req, res) => {
  const logs = db.getTable('webhooks');
  res.json({ success: true, count: logs.length, logs });
});

export default router;
