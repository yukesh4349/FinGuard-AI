import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  const invoices = db.getTable('invoices');
  const expenses = db.getTable('expenses');
  const inventory = db.getTable('inventory');
  const fraudAlerts = db.getTable('fraud_alerts');

  // Compute stats dynamically from database records
  const totalInvoicesVal = invoices.reduce((acc, inv) => acc + (inv.grand_total || 0), 0);
  const totalTaxGst = invoices.reduce((acc, inv) => acc + (inv.tax_gst || 0), 0);
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
        revenue: [40, 55, 70, 60, 85, 95],
        profit: [20, 25, 38, 42, 50, 64],
        gst: [12, 18, 22, 28, 32, 48],
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
