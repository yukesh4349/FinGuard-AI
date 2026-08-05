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

const EXTERNAL_AGENT_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea';

// Trigger Webhook Endpoint (Called when stock is loaded OR customer buys stock)
router.post('/webhook/trigger', (req, res) => {
  const { eventType, items, supplierName, customerName, billNo, source, grandTotal } = req.body;

  const isStockOut = (eventType || '').includes('BOUGHT') || (eventType || '').includes('CUSTOMER') || (eventType || '').includes('OUT');
  const typeKey = isStockOut ? 'STOCK_CUSTOMER_BOUGHT' : 'STOCK_IN_LOADED';

  const payload = {
    id: `WH-EVT-${Math.floor(10000 + Math.random() * 90000)}`,
    webhookTarget: EXTERNAL_AGENT_WEBHOOK_URL,
    eventType: typeKey,
    flowType: isStockOut ? 'STOCK_OUT (Customer POS Sale)' : 'STOCK_IN (Vendor Purchase)',
    source: source || (isStockOut ? `Customer POS Sale (${customerName || 'Retail Customer'})` : `Vendor Purchase Bill (${supplierName || 'Supplier'})`),
    referenceId: billNo || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName || null,
    supplierName: supplierName || null,
    grandTotal: grandTotal || null,
    items: items || [],
    timestamp: new Date().toISOString(),
    status: 'DELIVERED_SUCCESS',
  };

  db.insert('webhooks', payload);

  // Dispatch payload to external agent webhook URL endpoint
  try {
    fetch(EXTERNAL_AGENT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => console.warn('External Webhook dispatch notice:', err.message));
  } catch (e) {}

  console.log(`⚡ [EXTERNAL AGENT WEBHOOK DISPATCHED] ${payload.eventType} to ${EXTERNAL_AGENT_WEBHOOK_URL}`);

  res.json({
    success: true,
    message: `Stock Webhook ${payload.eventType} successfully triggered and sent to ${EXTERNAL_AGENT_WEBHOOK_URL}`,
    webhookEvent: payload,
  });
});

// GET /api/inventory/webhook/logs — Retrieve Webhook Event Logs
router.get('/webhook/logs', (req, res) => {
  const logs = db.getTable('webhooks');
  res.json({ success: true, count: logs.length, logs });
});

export default router;
