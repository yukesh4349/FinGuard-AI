import { Router } from 'express';
import { db } from '../db.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

const WEBHOOK_URL = process.env.WEBHOOK_URL_1;

const GROQ_KEYS = {
  finance: process.env.GROQ_API_KEY_FINANCE,
  fraud_growth: process.env.GROQ_API_KEY_FRAUD_GROWTH,
};

const cleanNum = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
};

// Helper: get comprehensive store data scoped to shopId asynchronously from Supabase
async function getFullStoreContext(shopId) {
  const [invoices, inventory, expenses, transactions, customerBills, employees, vendors] = await Promise.all([
    db.fetchScoped('invoices', shopId),
    db.fetchScoped('inventory', shopId),
    db.fetchScoped('expenses', shopId),
    db.fetchScoped('transactions', shopId),
    db.fetchScoped('customer_bills', shopId),
    db.fetchScoped('employees', shopId),
    db.fetchScoped('vendors', shopId),
  ]);

  const totalSales = customerBills.filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + cleanNum(b.grand_total), 0);

  const vendorReturnCredits = transactions
    .filter(t => t.category === 'vendor_return' || t.transaction_type === 'vendor_return')
    .reduce((sum, t) => sum + cleanNum(t.amount), 0);

  const grossExpenses = expenses.reduce((sum, e) => sum + cleanNum(e.amount), 0)
    + invoices.reduce((sum, i) => sum + cleanNum(i.grand_total), 0);

  const totalExpenses = Math.max(0, grossExpenses - vendorReturnCredits);

  const pendingBills = customerBills.filter(b =>
    b.status === 'Pending' || b.status === 'Pending Payment (Credit)'
  );
  const pendingBillsTotal = pendingBills.reduce((sum, b) => sum + cleanNum(b.grand_total), 0);

  const lowStockItems = inventory.filter(i => {
    const qty = parseInt(String(i.stockQty !== undefined ? i.stockQty : i.stock_qty || 0).replace(/[^0-9]/g, '')) || 0;
    const thresh = parseInt(String(i.minAlertThreshold || i.min_alert_threshold || 15)) || 15;
    return qty <= thresh;
  });

  const today = new Date();
  const getDaysUntilSalary = (salaryDay) => {
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    let targetDate = new Date(currentYear, currentMonth, salaryDay);
    if (targetDate < today && targetDate.toDateString() !== today.toDateString()) {
      targetDate = new Date(currentYear, currentMonth + 1, salaryDay);
    }
    return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  };

  const salariesDueSoon = employees.filter(emp => {
    const days = getDaysUntilSalary(parseInt(emp.salary_date || emp.salaryDate || '5'));
    return days >= 0 && days <= 5;
  }).map(emp => ({
    name: emp.name,
    salary: emp.salary,
    daysUntilDue: getDaysUntilSalary(parseInt(emp.salary_date || emp.salaryDate || '5')),
    salaryDate: emp.salary_date || emp.salaryDate || '5',
  }));

  return {
    totalSales, totalExpenses,
    netProfit: totalSales - totalExpenses,
    netMargin: totalSales > 0 ? ((Math.max(0, totalSales - totalExpenses) / totalSales) * 100).toFixed(1) : '0',
    pendingBills: pendingBills.map(b => ({ customer: b.customer_name, amount: b.grand_total, due: b.due_date })),
    pendingBillsTotal,
    pendingBillsCount: pendingBills.length,
    lowStockItems: lowStockItems.map(i => ({ name: i.name, qty: i.stockQty || i.stock_qty, threshold: i.minAlertThreshold || i.min_alert_threshold || 15 })),
    lowStockCount: lowStockItems.length,
    recentTransactions: transactions.slice(-10),
    employees: employees.map(e => ({ name: e.name, salary: e.salary, salaryDate: e.salary_date || e.salaryDate })),
    salariesDueSoon,
    vendorCount: vendors.length,
    inventoryCount: inventory.length,
  };
}

function filterByDays(items, daysBack, dateField = 'created_at') {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  return items.filter(item => {
    const d = new Date(item[dateField] || item.date || '');
    return !isNaN(d) && d >= cutoff;
  });
}

async function sendToWebhook(payload) {
  if (!WEBHOOK_URL) {
    console.warn('[Reports] WEBHOOK_URL_1 not configured in .env');
    return { ok: false, reason: 'Webhook URL not configured' };
  }
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error('[Reports] Webhook send failed:', err.message);
    return { ok: false, reason: err.message };
  }
}

async function callGroqAI(apiKey, systemPrompt, userPrompt, maxTokens = 600) {
  if (!apiKey) throw new Error('Groq API key not configured');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });
  const data = await response.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  throw new Error(data.error?.message || 'Empty response from Groq');
}

// POST /api/reports/send-daily
router.post('/send-daily', requireRoles(['owner']), async (req, res) => {
  try {
    const shopId = req.shopId;
    const ctx = await getFullStoreContext(shopId);
    const [allTx, allBills] = await Promise.all([
      db.fetchScoped('transactions', shopId),
      db.fetchScoped('customer_bills', shopId),
    ]);

    const recentTx = filterByDays(allTx, 2);
    const recentSales = filterByDays(allBills.filter(b => b.status === 'Paid'), 2);
    const recentSalesTotal = recentSales.reduce((sum, b) => sum + cleanNum(b.grand_total), 0);

    const payload = {
      type: 'DAILY_REPORT',
      title: '📊 Finora — 2-Day Business Activity Report',
      generatedAt: new Date().toISOString(),
      shopId,
      summary: {
        period: 'Last 2 Days',
        totalSalesInPeriod: recentSalesTotal,
        totalBillsRaised: recentSales.length,
        pendingBillsCount: ctx.pendingBillsCount,
        pendingBillsAmount: ctx.pendingBillsTotal,
        lowStockAlerts: ctx.lowStockCount,
        recentTransactions: recentTx.slice(0, 10),
        recentSales: recentSales.map(b => ({
          billNo: b.bill_number,
          customer: b.customer_name,
          amount: b.grand_total,
          date: b.created_at,
        })),
      },
      lowStockItems: ctx.lowStockItems,
      pendingBills: ctx.pendingBills,
      overallFinancials: {
        totalSales: ctx.totalSales,
        totalExpenses: ctx.totalExpenses,
        netProfit: ctx.netProfit,
        netMargin: ctx.netMargin,
      },
    };

    const webhookResult = await sendToWebhook(payload);
    res.json({
      success: true,
      message: webhookResult.ok
        ? '2-day report successfully sent to your workflow!'
        : `Report compiled, but webhook delivery failed: ${webhookResult.reason || 'Unknown error'}`,
      report: payload,
      webhookStatus: webhookResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reports/send-weekly
router.post('/send-weekly', requireRoles(['owner']), async (req, res) => {
  try {
    const shopId = req.shopId;
    const ctx = await getFullStoreContext(shopId);
    const [allBills, allTx, allExpenses] = await Promise.all([
      db.fetchScoped('customer_bills', shopId),
      db.fetchScoped('transactions', shopId),
      db.fetchScoped('expenses', shopId),
    ]);

    const weekSales = filterByDays(allBills.filter(b => b.status === 'Paid'), 7);
    const weekTx = filterByDays(allTx, 7);
    const weekExpenses = filterByDays(allExpenses, 7);

    const weekSalesTotal = weekSales.reduce((sum, b) => sum + cleanNum(b.grand_total), 0);
    const weekExpTotal = weekExpenses.reduce((sum, e) => sum + cleanNum(e.amount), 0);
    const weekProfit = weekSalesTotal - weekExpTotal;

    let aiSummary = null;
    try {
      aiSummary = await callGroqAI(
        GROQ_KEYS.finance,
        `You are the Finora AI Finance Analyst. Analyze the weekly business performance and provide a concise 3-bullet executive summary with key insights and one actionable recommendation.`,
        `Weekly Performance Data:
- Total Sales (7 days): Rs.${weekSalesTotal.toLocaleString('en-IN')} from ${weekSales.length} bills
- Total Expenses (7 days): Rs.${weekExpTotal.toLocaleString('en-IN')}
- Estimated Weekly Profit: Rs.${weekProfit.toLocaleString('en-IN')}
- Pending Credit Bills: ${ctx.pendingBillsCount} worth Rs.${ctx.pendingBillsTotal.toLocaleString('en-IN')}
- Low Stock Items: ${ctx.lowStockCount}
- Overall Net Margin: ${ctx.netMargin}%
Provide a brief, actionable weekly summary in 3-4 bullet points.`,
        400
      );
    } catch (err) {
      console.error('[Weekly Report] AI summary failed:', err.message);
      aiSummary = `- Sales this week: Rs.${weekSalesTotal.toLocaleString('en-IN')} from ${weekSales.length} transactions\n- Expenses recorded: Rs.${weekExpTotal.toLocaleString('en-IN')}\n- Estimated profit: Rs.${weekProfit.toLocaleString('en-IN')}`;
    }

    const payload = {
      type: 'WEEKLY_REPORT',
      title: 'Finora — Weekly Business Performance Report',
      generatedAt: new Date().toISOString(),
      shopId,
      period: 'Last 7 Days',
      weeklyMetrics: {
        totalSales: weekSalesTotal,
        totalBillsRaised: weekSales.length,
        totalExpenses: weekExpTotal,
        netProfit: weekProfit,
        netMargin: weekSalesTotal > 0 ? `${((weekProfit / weekSalesTotal) * 100).toFixed(1)}%` : '0%',
      },
      aiExecutiveSummary: aiSummary,
      pendingBillsSummary: {
        count: ctx.pendingBillsCount,
        totalAmount: ctx.pendingBillsTotal,
        bills: ctx.pendingBills,
      },
      inventoryAlerts: ctx.lowStockItems,
      topTransactions: weekTx.slice(0, 15),
      overallFinancials: {
        allTimeSales: ctx.totalSales,
        allTimeExpenses: ctx.totalExpenses,
        allTimeProfit: ctx.netProfit,
      },
    };

    const webhookResult = await sendToWebhook(payload);
    res.json({
      success: true,
      message: webhookResult.ok
        ? 'Weekly report with AI summary sent to your workflow!'
        : `Report compiled, but webhook delivery failed: ${webhookResult.reason || 'Unknown error'}`,
      report: payload,
      webhookStatus: webhookResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reports/send-reminders
router.post('/send-reminders', requireRoles(['owner']), async (req, res) => {
  try {
    const shopId = req.shopId;
    const ctx = await getFullStoreContext(shopId);
    const reminders = [];

    ctx.salariesDueSoon.forEach(emp => {
      reminders.push({
        type: 'Salary Due',
        priority: emp.daysUntilDue <= 1 ? 'URGENT' : 'HIGH',
        message: `${emp.name}'s salary of Rs.${cleanNum(emp.salary).toLocaleString('en-IN')} is due in ${emp.daysUntilDue} day(s) (on the ${emp.salaryDate}th).`,
        actionRequired: 'Ensure sufficient cash balance to process payment.',
      });
    });

    ctx.pendingBills.forEach(bill => {
      reminders.push({
        type: 'Pending Customer Bill',
        priority: bill.due && new Date(bill.due) < new Date() ? 'OVERDUE' : 'MEDIUM',
        message: `Bill for ${bill.customer} worth Rs.${cleanNum(bill.amount).toLocaleString('en-IN')} is pending${bill.due ? ` (due: ${bill.due})` : ''}.`,
        actionRequired: 'Follow up with customer for payment settlement.',
      });
    });

    ctx.lowStockItems.forEach(item => {
      reminders.push({
        type: 'Low Stock Alert',
        priority: item.qty <= 5 ? 'CRITICAL' : 'HIGH',
        message: `${item.name} has only ${item.qty} units left (threshold: ${item.threshold}).`,
        actionRequired: 'Place reorder with supplier immediately.',
      });
    });

    if (reminders.length === 0) {
      reminders.push({
        type: 'All Clear',
        priority: 'INFO',
        message: 'No urgent reminders at this time. Salaries are not due, no pending bills, and stock levels are healthy.',
        actionRequired: 'None',
      });
    }

    const payload = {
      type: 'BUSINESS_REMINDERS',
      title: 'Finora — Business Action Reminders',
      generatedAt: new Date().toISOString(),
      shopId,
      totalReminders: reminders.length,
      urgentCount: reminders.filter(r => ['URGENT', 'CRITICAL', 'OVERDUE'].includes(r.priority)).length,
      reminders,
      quickStats: {
        salariesDueSoon: ctx.salariesDueSoon.length,
        pendingBills: ctx.pendingBillsCount,
        lowStockItems: ctx.lowStockCount,
      },
    };

    const webhookResult = await sendToWebhook(payload);
    res.json({
      success: true,
      message: webhookResult.ok
        ? `${reminders.length} reminder(s) sent to your workflow!`
        : `Reminders compiled, but webhook delivery failed: ${webhookResult.reason || 'Unknown error'}`,
      reminders,
      webhookStatus: webhookResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reports/growth-advice
router.post('/growth-advice', requireRoles(['owner']), async (req, res) => {
  try {
    const shopId = req.shopId;
    const ctx = await getFullStoreContext(shopId);

    let advice = '';
    try {
      advice = await callGroqAI(
        GROQ_KEYS.fraud_growth,
        `You are the Finora AI Business Growth Advisor for Indian retail/supermarket businesses. Analyze the store's data and give 5 specific, actionable, high-impact growth strategies. Format as numbered list. Be direct, practical, and tailored to the actual data provided.`,
        `Store Performance Overview:
- Total All-Time Sales: Rs.${ctx.totalSales.toLocaleString('en-IN')}
- Total All-Time Expenses: Rs.${ctx.totalExpenses.toLocaleString('en-IN')}
- Net Profit: Rs.${ctx.netProfit.toLocaleString('en-IN')} (${ctx.netMargin}% margin)
- Active Inventory SKUs: ${ctx.inventoryCount}
- Low Stock Items: ${ctx.lowStockCount}
- Pending Credit Bills: ${ctx.pendingBillsCount} (Rs.${ctx.pendingBillsTotal.toLocaleString('en-IN')} outstanding)
- Total Employees: ${ctx.employees.length}
- Active Vendors/Suppliers: ${ctx.vendorCount}
- Salaries Due Soon: ${ctx.salariesDueSoon.length} employees
Generate 5 specific actionable growth strategies for this store. Keep it concise and practical.`,
        700
      );
    } catch (err) {
      console.error('[Growth Advice] Groq AI failed:', err.message);
      advice = `1. Optimize Low Stock Management: ${ctx.lowStockCount} items are near reorder threshold. Automate reorder alerts to avoid stock-out and lost sales.
2. Recover Pending Receivables: ${ctx.pendingBillsCount} credit bills worth Rs.${ctx.pendingBillsTotal.toLocaleString('en-IN')} are outstanding. Set a 7-day payment reminder cycle to improve cash flow.
3. Bundle Promotions: Identify your top 5 fast-moving items and create combo bundle offers to increase average order value by 15-20%.
4. Vendor Consolidation: Consolidate orders with your top suppliers for better bulk pricing and terms.
5. Staff Performance Tracking: Add monthly sales-per-employee KPIs to incentivize performance and identify top contributors.`;
    }

    const payload = {
      type: 'GROWTH_ADVICE',
      title: 'Finora — AI Business Growth Advisory',
      generatedAt: new Date().toISOString(),
      shopId,
      storeSnapshot: {
        totalSales: ctx.totalSales,
        netProfit: ctx.netProfit,
        netMargin: `${ctx.netMargin}%`,
        pendingBillsCount: ctx.pendingBillsCount,
        lowStockCount: ctx.lowStockCount,
      },
      aiGrowthAdvice: advice,
      generatedBy: 'Finora AI Growth Model (Groq llama-3.1-8b-instant)',
    };

    const webhookResult = await sendToWebhook(payload);
    res.json({
      success: true,
      message: webhookResult.ok
        ? 'Growth advice generated and sent to your workflow!'
        : 'Growth advice generated. Webhook delivery failed — check your webhook URL.',
      advice,
      report: payload,
      webhookStatus: webhookResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await db.fetchScoped('activity_logs', req.shopId);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
