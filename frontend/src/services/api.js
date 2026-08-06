/**
 * FINSIGHT AI - Centralized REST API Service Client
 * Communicates with the Express Backend Server running on http://localhost:5000/api
 */

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Request failed`);
    }
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// Authentication API
export const apiLogin = (userId, password, role) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId, password, role }),
  });

export const apiSignup = (userData) =>
  request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const apiGetUsers = () => request('/auth/users');

// Dashboard & Analytics API
export const apiGetDashboardStats = () => request('/dashboard/stats');
export const apiGetNotifications = () => request('/dashboard/notifications');

// Invoices API
export const apiGetInvoices = () => request('/invoices');
export const apiCreateInvoice = (invoiceData) =>
  request('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
export const apiUploadOcrInvoice = (ocrData) =>
  request('/invoices/upload', {
    method: 'POST',
    body: JSON.stringify(ocrData),
  });

export const apiScanOcrFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/invoices/scan-file`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (err) {
    console.warn('[API Scan File Warning]:', err.message);
    return { success: false, error: err.message };
  }
};

// Payments API
export const apiGetPayments = () => request('/payments');
export const apiCreatePayment = (paymentData) =>
  request('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });

// Expenses API
export const apiGetExpenses = () => request('/expenses');
export const apiCreateExpense = (expenseData) =>
  request('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });

// Transactions API
export const apiGetTransactions = () => request('/transactions');
export const apiCreateTransaction = (txnData) =>
  request('/transactions', {
    method: 'POST',
    body: JSON.stringify(txnData),
  });

// Inventory & Stock Webhook API
export const apiGetInventory = () => request('/inventory');
export const apiCreateInventoryItem = (itemData) =>
  request('/inventory', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
export const apiUpdateInventoryItem = (id, itemData) =>
  request(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });

export const EXTERNAL_AGENT_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea';

export const apiTriggerStockWebhook = (eventType, payload) => {
  const bodyData = {
    eventType,
    webhookTarget: EXTERNAL_AGENT_WEBHOOK_URL,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  // 1. Send HTTP POST directly to External Agent Webhook URL
  try {
    fetch(EXTERNAL_AGENT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    }).catch(err => console.log('External Agent Webhook notice:', err));
  } catch (e) {}

  // 2. Send to Backend Express API endpoint
  return request('/inventory/webhook/trigger', {
    method: 'POST',
    body: JSON.stringify(bodyData),
  });
};

export const apiGetWebhookLogs = () => request('/inventory/webhook/logs');

// Vendors API
export const apiGetVendors = () => request('/vendors');
export const apiCreateVendor = (vendorData) =>
  request('/vendors', {
    method: 'POST',
    body: JSON.stringify(vendorData),
  });

// Employees API
export const apiGetEmployees = () => request('/employees');
export const apiAddEmployee = (empData) =>
  request('/employees', {
    method: 'POST',
    body: JSON.stringify(empData),
  });

// AI Chat Assistant API
export const apiAiChat = (query, companyName) =>
  request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query, companyName }),
  });

export const apiQueryAiChat = apiAiChat;
