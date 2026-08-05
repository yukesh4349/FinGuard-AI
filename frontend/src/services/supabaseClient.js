import { createClient } from '@supabase/supabase-js';
import { triggerWebhookNode, triggerStockWebhookNode } from './postgresDb';

// Supabase Environment Credentials (Configured in .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseAnonKey && !supabaseAnonKey.includes('placeholder');
};

/* ─────────────────────────────────────────────────────────────
   1. USER AUTHENTICATION & REGISTRATION IN SUPABASE
   ───────────────────────────────────────────────────────────── */

/**
 * Register a new user in Supabase public.users table
 */
export async function registerUserInSupabase({ companyName, mobileNumber, email, password, role = 'owner' }) {
  const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
  const newUser = {
    user_id: userId,
    company_name: companyName,
    mobile_number: mobileNumber,
    email: email.toLowerCase().trim(),
    password_hash: password,
    role: role,
    created_at: new Date().toISOString(),
  };

  // 1. Update local cache
  try {
    const existingUsers = JSON.parse(localStorage.getItem('finsight_postgres_users') || '[]');
    existingUsers.unshift(newUser);
    localStorage.setItem('finsight_postgres_users', JSON.stringify(existingUsers));
  } catch (e) {}

  // 2. Insert into Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();

      if (error) {
        console.warn('[Supabase Signup Notice]:', error.message);
      } else {
        console.log('[Supabase Signup Success]: Registered user in Supabase public.users', data);
      }
    } catch (err) {
      console.warn('[Supabase Signup Exception]:', err.message);
    }
  }

  // Dispatch webhook notification
  triggerWebhookNode({
    event: 'user_signup',
    login_id: userId,
    main_id: userId,
    mobile_number: mobileNumber,
    name: companyName,
    email,
    company_name: companyName,
  });

  return { success: true, user: newUser, message: 'Account created successfully!' };
}

/**
 * Authenticate User in Supabase (Checks Email/Mobile AND Password match)
 */
export async function authenticateUserInSupabase(identifier = '', password = '') {
  const cleanId = String(identifier).toLowerCase().trim();

  // 1. Try querying Supabase public.users first if configured
  if (isSupabaseConfigured()) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${cleanId},mobile_number.eq.${cleanId},user_id.eq.${cleanId}`);

      if (!error && users && users.length > 0) {
        const matched = users.find(u => u.password_hash === password);
        if (matched) {
          return { success: true, user: matched, isSuperAdmin: matched.role === 'super_admin' };
        } else {
          return { success: false, message: 'Incorrect password. Please verify your password and try again.' };
        }
      }
    } catch (err) {
      console.warn('[Supabase Auth Fallback]:', err.message);
    }
  }

  // 2. Fallback local memory authentication if Supabase is offline/unconfigured
  try {
    const localUsers = JSON.parse(localStorage.getItem('finsight_postgres_users') || '[]');
    const user = localUsers.find(u =>
      (u.email?.toLowerCase() === cleanId || u.mobile_number === cleanId || u.user_id === cleanId)
    );

    if (user) {
      if (user.password_hash === password) {
        return { success: true, user, isSuperAdmin: user.role === 'super_admin' };
      } else {
        return { success: false, message: 'Incorrect password. Please verify your password and try again.' };
      }
    }
  } catch (e) {}

  return { success: false, message: 'User not found with provided Email or Mobile number.' };
}

/* ─────────────────────────────────────────────────────────────
   2. INVOICE PERSISTENCE IN SUPABASE
   ───────────────────────────────────────────────────────────── */

/**
 * Save OCR Extracted & Manual Invoice Data to Supabase Database
 */
export async function saveOcrDataToSupabase(ocrData) {
  const {
    supplierName,
    invoiceNumber,
    invoiceDate,
    subtotal,
    taxGst,
    grandTotal,
    items,
    rawText,
  } = ocrData;

  const newInvoiceRecord = {
    id: `inv-${Date.now()}`,
    supplier_name: supplierName || 'Store Vendor',
    invoice_number: invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
    subtotal: String(subtotal || grandTotal || '0'),
    tax_gst: String(taxGst || '0'),
    grand_total: String(grandTotal || '0'),
    items: items || [],
    raw_text: rawText || '',
    created_at: new Date().toISOString(),
  };

  // Local storage cache backup
  const storedLocalInvoices = JSON.parse(localStorage.getItem('finsight_ocr_invoices') || '[]');
  storedLocalInvoices.unshift(newInvoiceRecord);
  localStorage.setItem('finsight_ocr_invoices', JSON.stringify(storedLocalInvoices));

  // Sync stock items to Supabase Inventory & Webhook
  if (items && items.length > 0) {
    saveStockToSupabase({
      supplierName: supplierName || 'Store Vendor',
      invoiceNumber: invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      items,
      source: 'ocr_vendor_bill',
    });
  }

  // Insert into Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      console.log('[Supabase DB]: Inserting Invoice to public.invoices & public.ocr_invoices...', newInvoiceRecord);

      await supabase.from('invoices').insert([newInvoiceRecord]);
      await supabase.from('ocr_invoices').insert([newInvoiceRecord]);

      return { success: true, data: [newInvoiceRecord], savedLocally: false };
    } catch (err) {
      console.warn('[Supabase Invoice Insert Error]:', err.message);
    }
  }

  return { success: true, data: [newInvoiceRecord], savedLocally: true };
}

/* ─────────────────────────────────────────────────────────────
   3. STOCK & INVENTORY PERSISTENCE IN SUPABASE
   ───────────────────────────────────────────────────────────── */

/**
 * Save Stock Inventory Details to Supabase & Dispatch to Webhook
 */
export async function saveStockToSupabase(stockPayload = {}) {
  const {
    supplierName = 'Manual Store Stock Upload',
    invoiceNumber = `STK-${Math.floor(1000 + Math.random() * 9000)}`,
    items = [],
    source = 'manual_entry',
  } = stockPayload;

  const formattedItems = items.map(item => {
    const costVal = parseFloat(String(item.rate || item.costPrice || item.price || '100').replace(/[^0-9.]/g, '')) || 100;
    const sellVal = parseFloat(String(item.sellingPrice || item.selling_price || '0').replace(/[^0-9.]/g, '')) || Math.round(costVal * 1.20);
    const gstRateStr = item.gst || item.gst_rate || '5%';

    return {
      name: item.name || item.description || item.itemName || 'Stock Product',
      quantity: String(item.qty || item.quantity || '1 Unit'),
      stock_qty: parseInt(String(item.qty || item.quantity || '1').replace(/[^0-9]/g, '')) || 1,
      cost_price: `₹ ${costVal.toLocaleString('en-IN')}`,
      selling_price: `₹ ${sellVal.toLocaleString('en-IN')}`,
      gst_rate: gstRateStr,
      total_amount: item.total ? item.total : `₹ ${(costVal * (parseInt(item.qty || 1) || 1)).toLocaleString('en-IN')}`,
      supplier_name: supplierName,
      invoice_number: invoiceNumber,
      source: source,
      updated_at: new Date().toISOString(),
    };
  });

  // Local storage inventory backup
  const existingStock = JSON.parse(localStorage.getItem('finsight_stock_inventory') || '[]');
  const updatedStock = [...formattedItems, ...existingStock];
  localStorage.setItem('finsight_stock_inventory', JSON.stringify(updatedStock));

  // Insert into Supabase table public.inventory if configured
  if (isSupabaseConfigured()) {
    try {
      console.log('[Supabase DB]: Inserting stock items into public.inventory...', formattedItems);
      await supabase.from('inventory').insert(
        formattedItems.map(it => ({
          name: it.name,
          category: 'Store Stock',
          stock_qty: it.stock_qty,
          min_alert_threshold: 15,
          unit_price: it.cost_price,
          cost_price: it.cost_price,
          selling_price: it.selling_price,
          gst_rate: it.gst_rate,
          status: it.stock_qty <= 15 ? 'Low Stock Alert' : 'Healthy Stock',
          supplier: supplierName,
        }))
      );
    } catch (err) {
      console.warn('[Supabase Stock Save Error]:', err.message);
    }
  }

  // Dispatch Stock Details to Webhook
  triggerStockWebhookNode({
    event: 'stock_updated',
    source: source,
    supplier_name: supplierName,
    invoice_number: invoiceNumber,
    stock_items: formattedItems,
    timestamp: new Date().toISOString(),
  });

  return { success: true, count: formattedItems.length, items: formattedItems };
}

/**
 * Fetch All Saved OCR Invoices from Supabase Database
 */
export async function getStoredOcrInvoicesFromSupabase() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('ocr_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    } catch (err) {}
  }
  return JSON.parse(localStorage.getItem('finsight_ocr_invoices') || '[]');
}
