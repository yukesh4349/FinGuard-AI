import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function getDaysUntilSalary(salaryDay) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Salary date in current month
  let targetDate = new Date(currentYear, currentMonth, salaryDay);
  
  // If target date is in the past (e.g., today is Aug 15, salaryDay was Aug 10), look at next month
  if (targetDate < today && targetDate.toDateString() !== today.toDateString()) {
    targetDate = new Date(currentYear, currentMonth + 1, salaryDay);
  }
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  const shopId = req.shopId;
  const invoices = db.getTable('invoices').filter(i => i.user_id === shopId);
  const expenses = db.getTable('expenses').filter(e => e.user_id === shopId);
  const inventory = db.getTable('inventory').filter(i => i.user_id === shopId);
  const fraudAlerts = db.getTable('fraud_alerts').filter(a => a.user_id === shopId);
  const customerBills = db.getTable('customer_bills').filter(b => b.user_id === shopId);

  const cleanNum = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  };

  // Compute stats dynamically from database records
  const totalInvoicesVal = invoices.reduce((acc, inv) => acc + cleanNum(inv.grand_total || 0), 0);
  const totalTaxGst = invoices.reduce((acc, inv) => acc + cleanNum(inv.tax_gst || 0), 0);
  const lowStockCount = inventory.filter(i => {
    const qty = parseInt(String(i.stockQty !== undefined ? i.stockQty : i.stock_qty || 0).replace(/[^0-9]/g, '')) || 0;
    const thresh = parseInt(String(i.minAlertThreshold || 15)) || 15;
    return qty <= thresh;
  }).length;
  const highRiskCount = invoices.filter(inv => inv.status === 'Flagged High Risk').length;
  const activeAlertsCount = fraudAlerts.filter(a => !a.resolved).length;

  // Pending customer credit bills (from POS)
  const pendingCustomerBills = customerBills.filter(b => b.status === 'Pending' || b.status === 'Pending Payment (Credit)');
  const pendingBillsCount = pendingCustomerBills.length;
  const pendingBillsAmount = pendingCustomerBills.reduce((acc, b) => acc + (parseFloat(b.grand_total) || 0), 0);

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
      pendingBillsCount,
      pendingBillsAmount,
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
  const shopId = req.shopId;
  const alerts = db.getTable('fraud_alerts').filter(a => a.user_id === shopId);
  const employees = db.getTable('employees').filter(e => e.user_id === shopId);
  
  const notifications = [...alerts];

  employees.forEach(emp => {
    const salaryDay = parseInt(emp.salary_date || '5');
    const daysUntil = getDaysUntilSalary(salaryDay);
    if (daysUntil === 3) {
      notifications.unshift({
        id: `sal-rem-${emp.id}`,
        user_id: shopId,
        type: 'Salary Reminder',
        message: `The salary payment for ${emp.name} is due in 3 days. Please ensure sufficient funds are available to process the payment.`,
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }
  });

  res.json({ success: true, notifications });
});

export default router;
