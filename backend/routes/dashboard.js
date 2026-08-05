import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  const invoices = db.getTable('invoices');
  const expenses = db.getTable('expenses');
  const inventory = db.getTable('inventory');
  const fraudAlerts = db.getTable('fraud_alerts');

  const cleanNum = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  };

  // Compute stats dynamically from database records
  const totalInvoicesVal = invoices.reduce((acc, inv) => acc + cleanNum(inv.grand_total || 0), 0);
  const totalTaxGst = invoices.reduce((acc, inv) => acc + cleanNum(inv.tax_gst || 0), 0);
  const lowStockCount = inventory.filter(i => i.stockQty <= (i.minAlertThreshold || 15)).length;
  const highRiskCount = invoices.filter(inv => inv.status === 'Flagged High Risk').length;
  const activeAlertsCount = fraudAlerts.filter(a => !a.resolved).length;

  res.json({
    success: true,
    stats: {
      totalMonthlyRevenue: `₹ ${(totalInvoicesVal / 100000).toFixed(2)}L`,
      totalInvoicesVal,
      totalInvoicesCount: invoices.length,
      estimatedGstClaimable: `₹ ${(totalTaxGst).toLocaleString('en-IN')}`,
      lowStockItemsCount: lowStockCount,
      highRiskInvoicesCount: highRiskCount,
      activeAlertsCount,
      sparklines: {
        revenue: [0, 0, 0, 0, 0, 0],
        profit: [0, 0, 0, 0, 0, 0],
        gst: [0, 0, 0, 0, 0, 0],
      },
    },
  });
});

// GET /api/dashboard/notifications
router.get('/notifications', (req, res) => {
  const alerts = db.getTable('fraud_alerts');
  res.json({ success: true, notifications: alerts });
});

export default router;
