import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// GET /api/inventory
router.get('/', async (req, res) => {
  try {
    const inventory = await db.fetchScoped('inventory', req.shopId);
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inventory
router.post('/', requireRoles(['owner', 'store_manager']), async (req, res) => {
  try {
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
      stock_qty: qty,
      min_alert_threshold: threshold,
      unit_price: String(unitPrice || '0').startsWith('₹') ? String(unitPrice) : `₹ ${unitPrice}`,
      status: qty <= threshold ? 'Low Stock Alert' : 'Healthy Stock',
      supplier_name: supplier || 'General Supplier',
    };

    const saved = await db.insert('inventory', newItem);

    await db.insert('activity_logs', {
      id: `LOG-${Date.now()}`,
      user_id: req.shopId,
      action: '📦 Added Inventory SKU',
      details: `Added ${name} (${qty} units) to store inventory.`,
      category: 'Inventory',
    });

    res.status(201).json({ success: true, item: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/inventory/:id
router.put('/:id', requireRoles(['owner', 'store_manager']), async (req, res) => {
  try {
    const { id } = req.params;
    // Validate ownership
    const inv = await db.fetchScoped('inventory', req.shopId);
    const existing = inv.find(i => i.id === id);
    if (!existing) return res.status(404).json({ success: false, error: 'Item not found.' });

    const updates = { ...req.body };
    // Normalise incoming camelCase to snake_case for Supabase
    if (updates.stockQty !== undefined)          { updates.stock_qty = parseInt(updates.stockQty); delete updates.stockQty; }
    if (updates.minAlertThreshold !== undefined)  { updates.min_alert_threshold = parseInt(updates.minAlertThreshold); delete updates.minAlertThreshold; }
    if (updates.unitPrice !== undefined)          { updates.unit_price = updates.unitPrice; delete updates.unitPrice; }
    if (updates.supplier !== undefined)           { updates.supplier_name = updates.supplier; delete updates.supplier; }

    // Auto-compute status
    const qty = parseInt(updates.stock_qty ?? existing.stockQty ?? 0);
    const threshold = parseInt(updates.min_alert_threshold ?? existing.minAlertThreshold ?? 15);
    updates.status = qty <= threshold ? 'Low Stock Alert' : 'Healthy Stock';
    updates.updated_at = new Date().toISOString();

    const updated = await db.update('inventory', 'id', id, updates);

    await db.insert('activity_logs', {
      id: `LOG-${Date.now()}`,
      user_id: req.shopId,
      action: '✏️ Updated Inventory SKU',
      details: `Adjusted inventory details for ${existing.name} (Current Qty: ${qty}).`,
      category: 'Inventory',
    });

    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', requireRoles(['owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const inv = await db.fetchScoped('inventory', req.shopId);
    const item = inv.find(i => i.id === id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found.' });

    await db.delete('inventory', 'id', id);

    await db.insert('activity_logs', {
      id: `LOG-${Date.now()}`,
      user_id: req.shopId,
      action: '🗑️ Deleted Inventory SKU',
      details: `Removed '${item.name}' from store database.`,
      category: 'Inventory',
    });

    const inventory = await db.fetchScoped('inventory', req.shopId);
    res.json({ success: true, message: 'Item deleted.', inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Webhook endpoints ────────────────────────────────────────────────────────
const EXTERNAL_AGENT_WEBHOOK_URL = process.env.VITE_STOCK_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea';

router.post('/webhook/stock-updates', async (req, res) => {
  const { eventType, items, source, timestamp, referenceId } = req.body;
  console.log(`[WEBHOOK RECEIVED] Event: ${eventType} | Source: ${source}`);
  res.json({ success: true, message: `Stock Webhook received for event ${eventType}` });
});

router.post('/webhook/trigger', async (req, res) => {
  const { eventType, items, supplierName, customerName, billNo, source, grandTotal } = req.body;
  const isStockOut = (eventType || '').includes('BOUGHT') || (eventType || '').includes('CUSTOMER') || (eventType || '').includes('OUT');
  const typeKey = isStockOut ? 'STOCK_CUSTOMER_BOUGHT' : 'STOCK_IN_LOADED';

  const payload = {
    eventType: typeKey,
    flowType: isStockOut ? 'STOCK_OUT (Customer POS Sale)' : 'STOCK_IN (Vendor Purchase)',
    source: source || (isStockOut ? `Customer POS Sale (${customerName || 'Customer'})` : `Vendor Purchase (${supplierName || 'Supplier'})`),
    referenceId: billNo || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName || null,
    supplierName: supplierName || null,
    grandTotal: grandTotal || null,
    items: items || [],
    timestamp: new Date().toISOString(),
  };

  fetch(EXTERNAL_AGENT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(err => console.warn('[Webhook dispatch]:', err.message));

  console.log(`⚡ [WEBHOOK DISPATCHED] ${payload.eventType} → ${EXTERNAL_AGENT_WEBHOOK_URL}`);
  res.json({ success: true, message: `Stock Webhook ${payload.eventType} triggered.`, webhookEvent: payload });
});

router.get('/webhook/logs', async (req, res) => {
  res.json({ success: true, logs: [] });
});

export default router;
