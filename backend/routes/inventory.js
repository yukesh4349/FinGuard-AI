import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/inventory (All roles can read)
router.get('/', (req, res) => {
  const inventory = db.getTable('inventory').filter(i => i.user_id === req.shopId);
  res.json({ success: true, inventory });
});

// POST /api/inventory (Owner and Store Manager only)
router.post('/', requireRoles(['owner', 'store_manager']), (req, res) => {
  const { name, category, stockQty, minAlertThreshold, unitPrice, supplier } = req.body;
  if (!name || stockQty === undefined) {
    return res.status(400).json({ success: false, error: 'Item Name and Stock Quantity are required.' });
  }

  const qty = parseInt(stockQty);
  const threshold = parseInt(minAlertThreshold || 15);

  const newItem = {
    id: `SKU-${Math.floor(100 + Math.random() * 900)}`,
    user_id: req.shopId,
    name,
    category: category || 'General Store',
    stockQty: qty,
    minAlertThreshold: threshold,
    unitPrice: unitPrice.toString().startsWith('₹') ? unitPrice : `₹ ${unitPrice}`,
    status: qty <= threshold ? 'Low Stock Alert' : 'Healthy Stock',
    supplier: supplier || 'General Supplier',
  };

  db.insert('inventory', newItem);

  // Audit log
  db.insert('activity_logs', {
    id: `LOG-${Date.now()}`,
    user_id: req.shopId,
    action: '📦 Added Inventory SKU',
    details: `Added ${newItem.name} (${qty} units) to store inventory.`,
    category: 'Inventory',
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ success: true, item: newItem });
});

// PUT /api/inventory/:id (Owner and Store Manager only)
router.put('/:id', requireRoles(['owner', 'store_manager']), (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.update('inventory', item => item.id === id && item.user_id === req.shopId, updates);

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Item not found.' });
  }

  // Recalculate status based on current stock levels
  const qty = parseInt(updated.stockQty) || 0;
  const threshold = parseInt(updated.minAlertThreshold) || 15;
  updated.status = qty <= threshold ? 'Low Stock Alert' : 'Healthy Stock';
  db.save();

  // Audit log
  db.insert('activity_logs', {
    id: `LOG-${Date.now()}`,
    user_id: req.shopId,
    action: '✏️ Updated Inventory SKU',
    details: `Adjusted inventory details for ${updated.name} (Current Qty: ${qty}).`,
    category: 'Inventory',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, item: updated });
});

// DELETE /api/inventory/:id (Owner only)
router.delete('/:id', requireRoles(['owner']), (req, res) => {
  const { id } = req.params;
  const item = db.getTable('inventory').find(i => i.id === id && i.user_id === req.shopId);
  const itemName = item ? item.name : id;
  const removed = db.delete('inventory', i => i.id === id && i.user_id === req.shopId);
  if (!removed) {
    return res.status(404).json({ success: false, error: 'Item not found.' });
  }

  // Audit log
  db.insert('activity_logs', {
    id: `LOG-${Date.now()}`,
    user_id: req.shopId,
    action: '🗑️ Deleted Inventory SKU',
    details: `Removed '${itemName}' from store database.`,
    category: 'Inventory',
    created_at: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Item deleted.', inventory: db.getTable('inventory').filter(i => i.user_id === req.shopId) });
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
