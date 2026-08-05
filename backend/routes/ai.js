import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// POST /api/ai/chat
router.post('/chat', (req, res) => {
  const { query, companyName } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required.' });
  }

  const invoices = db.getTable('invoices');
  const inventory = db.getTable('inventory');
  const alerts = db.getTable('fraud_alerts');

  const q = query.toLowerCase();
  let reply = `Looking at your store data for ${companyName || 'your business'}, your store sales look good with ${invoices.length} bills saved. See beyond the numbers!`;

  if (q.includes('gst') || q.includes('tax')) {
    const totalTax = invoices.reduce((sum, i) => sum + (i.tax_gst || 0), 0);
    reply = `Your estimated GST tax payable for this month is ₹${(totalTax * 1.2).toFixed(0)}. You have ₹${totalTax.toFixed(0)} in verified tax credits ready to claim!`;
  } else if (q.includes('fraud') || q.includes('fake') || q.includes('alert') || q.includes('warning') || q.includes('duplicate')) {
    const highRisk = invoices.filter(i => i.status === 'Flagged High Risk');
    if (highRisk.length > 0) {
      reply = `FinSight AI found ${highRisk.length} duplicate or risky bill(s) in your system! Latest flagged bill: ${highRisk[0].invoice_number} from "${highRisk[0].supplier_name}" totaling ₹${highRisk[0].grand_total}.`;
    } else {
      reply = `FinSight AI scanned your store bills: All recent bills look clean and verified. No duplicate alerts right now!`;
    }
  } else if (q.includes('stock') || q.includes('inventory') || q.includes('low')) {
    const lowStock = inventory.filter(i => i.stockQty <= (i.minAlertThreshold || 15));
    if (lowStock.length > 0) {
      const itemNames = lowStock.map(i => `${i.name} (${i.stockQty} left)`).join(', ');
      reply = `You have ${lowStock.length} items running low on stock in your store: ${itemNames}.`;
    } else {
      reply = `All store stock items are currently above safe minimum levels.`;
    }
  } else if (q.includes('invoice') || q.includes('bill') || q.includes('sale')) {
    const totalRev = invoices.reduce((sum, i) => sum + (i.grand_total || 0), 0);
    reply = `Your store has ${invoices.length} recorded bills totaling ₹${totalRev.toLocaleString('en-IN')}.`;
  }

  res.json({
    success: true,
    query,
    reply,
    timestamp: new Date().toISOString(),
  });
});

export default router;
