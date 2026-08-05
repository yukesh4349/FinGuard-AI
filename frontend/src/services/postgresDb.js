/**
 * FINSIGHT AI - Database & API Service Adapter
 * Bridges frontend services with the Express REST API Backend.
 */

import { apiGetUsers, apiLogin, apiSignup, apiGetEmployees, apiAddEmployee, apiGetDashboardStats, apiGetNotifications } from './api';
import { registerUserInSupabase, authenticateUserInSupabase } from './supabaseClient';

export const POSTGRES_CONFIG = {
  host: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PGHOST) || 'localhost',
  port: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PGPORT) || 5432,
  database: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PGDATABASE) || 'finsight_db',
  user: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PGUSER) || 'postgres',
  password: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PGPASSWORD) || 'postgres',
  ssl: false,
};

// Async helper to fetch live DB users from Express backend
export async function fetchUsersFromBackend() {
  try {
    const res = await apiGetUsers();
    if (res && res.users) {
      localStorage.setItem('finsight_postgres_users', JSON.stringify(res.users));
      return res.users;
    }
  } catch (err) {
    console.warn('[Postgres Service]: Falling back to local storage cache for users');
  }
  const cached = localStorage.getItem('finsight_postgres_users');
  return cached ? JSON.parse(cached) : [];
}

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem('finsight_postgres_users');
    if (raw) return JSON.parse(raw);
  } catch (err) {}
  return [];
}

export async function registerUserInPostgres({ companyName, mobileNumber, email, password, role = 'owner' }) {
  // Sync to Supabase
  try {
    await registerUserInSupabase({ companyName, mobileNumber, email, password, role });
  } catch (supaErr) {
    console.warn('[Supabase Registration Sync]:', supaErr);
  }

  try {
    const res = await apiSignup({ companyName, mobileNumber, email, password, role });
    if (res.success) {
      triggerWebhookNode({
        event: 'user_signup',
        login_id: res.user.user_id,
        main_id: res.user.user_id,
        mobile_number: res.user.mobile_number,
        name: companyName,
        email,
        company_name: companyName,
      });
      return { success: true, user: res.user, message: res.message };
    }
  } catch (err) {
    console.error('[Signup API Error]:', err);
  }

  // Local fallback user object
  const fallbackUser = {
    user_id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    company_name: companyName,
    mobile_number: mobileNumber,
    email: email.toLowerCase().trim(),
    password_hash: password,
    role: role,
    created_at: new Date().toISOString(),
  };

  return { success: true, user: fallbackUser, message: 'Registration successful!' };
}

export async function authenticateUserInPostgres(identifier = '', password = '', mobileNumber = '') {
  // 1. First authenticate with Supabase Client
  const supaRes = await authenticateUserInSupabase(identifier, password);
  if (supaRes.success) {
    triggerWebhookNode({
      event: 'user_login',
      login_id: supaRes.user.user_id || supaRes.user.email,
      main_id: supaRes.user.user_id || supaRes.user.email,
      mobile_number: supaRes.user.mobile_number || mobileNumber,
      name: supaRes.user.company_name,
      email: supaRes.user.email,
      company_name: supaRes.user.company_name,
    });
    return supaRes;
  }

  // 2. Try Express API auth endpoint
  try {
    const res = await apiLogin(identifier, password);
    if (res.success) {
      triggerWebhookNode({
        event: 'user_login',
        login_id: res.user.user_id,
        main_id: res.user.user_id,
        mobile_number: res.user.mobile_number || mobileNumber,
        name: res.user.company_name,
        email: res.user.email,
        company_name: res.user.company_name,
      });
      return { success: true, user: res.user, isSuperAdmin: res.user.role === 'super_admin' };
    }
  } catch (err) {
    console.error('[Auth API Error]:', err);
  }

  return supaRes;
}

export const DEFAULT_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/2c8af1a7-9f33-4249-b787-a9e239761ca1';
export const DEFAULT_STOCK_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea';

export async function triggerWebhookNode(payload) {
  try {
    const webhookUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WEBHOOK_URL) || DEFAULT_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {}
}

export async function triggerStockWebhookNode(payload) {
  try {
    const webhookUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_STOCK_WEBHOOK_URL) || DEFAULT_STOCK_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {}
}

export async function fetchEmployeesFromBackend() {
  try {
    const res = await apiGetEmployees();
    if (res && res.employees) {
      localStorage.setItem('finsight_postgres_employees', JSON.stringify(res.employees));
      return res.employees;
    }
  } catch (e) {}
  const raw = localStorage.getItem('finsight_postgres_employees');
  return raw ? JSON.parse(raw) : [];
}

export function getStoredEmployees() {
  try {
    const raw = localStorage.getItem('finsight_postgres_employees');
    if (raw) return JSON.parse(raw);
  } catch (err) {}
  return [];
}

export async function saveEmployeeToDb(emp) {
  try {
    const res = await apiAddEmployee(emp);
    if (res && res.employees) {
      localStorage.setItem('finsight_postgres_employees', JSON.stringify(res.employees));
      return res.employees;
    }
  } catch (e) {
    console.error(e);
  }
  const list = getStoredEmployees();
  list.push(emp);
  return list;
}

export const DEFAULT_OFFICIAL_GST_RATES = [
  { id: 1, category: 'Essential food', example: 'Fresh fruits & vegetables', rate: 0, display: '0%' },
  { id: 2, category: 'Milk', example: 'Fresh milk', rate: 0, display: '0%' },
  { id: 3, category: 'Rice/Wheat', example: 'Unbranded grains', rate: 0, display: '0%' },
  { id: 4, category: 'Packaged food', example: 'Packaged cereals & pulses', rate: 5, display: '5%' },
  { id: 5, category: 'Edible oil', example: 'Cooking oil', rate: 5, display: '5%' },
  { id: 6, category: 'Tea', example: 'Tea leaves / dust', rate: 5, display: '5%' },
  { id: 7, category: 'Sugar', example: 'Refined sugar', rate: 5, display: '5%' },
  { id: 8, category: 'Restaurant', example: 'Non-luxury restaurants', rate: 5, display: '5%' },
  { id: 9, category: 'Footwear', example: 'Many footwear items', rate: 12, display: '12%' },
  { id: 10, category: 'Mobile phones', example: 'Smartphones & accessories', rate: 18, display: '18%' },
  { id: 11, category: 'Laptops', example: 'Computers & hardware', rate: 18, display: '18%' },
];

export function getOfficialGstRatesFromPostgres() {
  return DEFAULT_OFFICIAL_GST_RATES;
}

export function addOfficialGstRateToPostgres(newCategory) {
  const current = getOfficialGstRatesFromPostgres();
  const rateObj = {
    id: current.length + 1,
    category: newCategory.category,
    example: newCategory.example || newCategory.category,
    rate: parseFloat(newCategory.rate) || 18,
    display: `${newCategory.rate}%`,
  };
  return [rateObj, ...current];
}

export function verifyVendorBillGstWithPostgres(items = []) {
  const officialRates = getOfficialGstRatesFromPostgres();
  const alerts = [];
  items.forEach(item => {
    const name = (item.name || item.description || '').toLowerCase();
    const chargedGstNum = parseFloat((item.gst || '5%').replace(/[^0-9.]/g, '')) || 0;
    const match = officialRates.find(r => name.includes(r.category.toLowerCase()));
    if (match && chargedGstNum > match.rate) {
      alerts.push({
        itemName: item.name || item.description,
        chargedGst: `${chargedGstNum}%`,
        officialGst: match.display,
        matchedCategory: match.category,
        message: `GST Warning: Vendor charged ${chargedGstNum}%, expected rate is ${match.display}.`,
      });
    }
  });
  return { isCompliant: alerts.length === 0, alerts, totalAlerts: alerts.length };
}

export function getStoredFraudAlerts() {
  const raw = localStorage.getItem('finsight_fraud_alerts');
  return raw ? JSON.parse(raw) : [];
}

export function getStoredInvoices() {
  try {
    const raw = localStorage.getItem('finsight_invoices') || localStorage.getItem('finguard_invoices');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveInvoiceToStore(inv) {
  const current = getStoredInvoices();
  current.unshift(inv);
  localStorage.setItem('finsight_invoices', JSON.stringify(current));
  return current;
}

export function checkDuplicateInvoiceAndFraud(newInvoice = {}) {
  const storedInvoices = getStoredInvoices();
  const normNo = (newInvoice.invoiceNumber || newInvoice.invoice_number || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normSupplier = (newInvoice.supplierName || newInvoice.supplier_name || '').toLowerCase().trim();
  const totalVal = parseFloat(String(newInvoice.grandTotal || newInvoice.grand_total || '0').replace(/[^0-9.]/g, '')) || 0;

  for (const inv of storedInvoices) {
    const existingNormNo = (inv.invoice_number || inv.invoiceNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingNormSupplier = (inv.supplier_name || inv.supplierName || '').toLowerCase().trim();
    const existingTotal = parseFloat(String(inv.grand_total || inv.grandTotal || '0').replace(/[^0-9.]/g, '')) || 0;

    // Check 1: Invoice Number Match
    if (normNo && existingNormNo && normNo === existingNormNo) {
      return {
        isDuplicate: true,
        alert: {
          title: '⚠️ DUPLICATE INVOICE DETECTED',
          message: `Invoice #${inv.invoice_number || inv.invoiceNumber} from ${inv.supplier_name || inv.supplierName} was already uploaded and recorded previously!`,
          matchedInvoice: inv,
        }
      };
    }

    // Check 2: Same Supplier + Same Total Amount Match
    if (normSupplier && existingNormSupplier && (normSupplier.includes(existingNormSupplier) || existingNormSupplier.includes(normSupplier))) {
      if (totalVal > 0 && Math.abs(totalVal - existingTotal) < 5) {
        return {
          isDuplicate: true,
          alert: {
            title: '⚠️ DUPLICATE BILL WARNING',
            message: `A bill of ₹ ${totalVal.toLocaleString('en-IN')} from ${inv.supplier_name || inv.supplierName} was already recorded previously.`,
            matchedInvoice: inv,
          }
        };
      }
    }
  }

  return { isDuplicate: false };
}
