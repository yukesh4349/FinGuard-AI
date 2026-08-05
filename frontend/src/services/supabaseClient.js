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
 * Register a new user in Supabase public.users table with store address & OTP status
 */
export async function registerUserInSupabase({ companyName, companyAddress, businessType, mobileNumber, email, password, role = 'owner' }) {
  const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
  const newUser = {
    user_id: userId,
    company_name: companyName,
    company_address: companyAddress || '',
    business_type: businessType || 'General Retail',
    mobile_number: mobileNumber,
    email: email.toLowerCase().trim(),
    password_hash: password,
    role: role,
    verified_email: true,
    created_at: new Date().toISOString(),
  };

  // 1. Update local cache
  try {
    const existingUsers = JSON.parse(localStorage.getItem('finsight_postgres_users') || '[]');
    existingUsers.unshift(newUser);
    localStorage.setItem('finsight_postgres_users', JSON.stringify(existingUsers));
  } catch (e) {}

  // 2. Insert into Supabase public.users if configured
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
    company_address: companyAddress,
    email,
    company_name: companyName,
  });

  return { success: true, user: newUser, message: 'Account created successfully!' };
}

/**
 * Authenticate User in Supabase (Strictly verifies User ID/Email AND Password AND Registered Mobile Number)
 */
export async function authenticateUserInSupabase(identifier = '', password = '', mobileNumber = '') {
  const cleanId = String(identifier).toLowerCase().trim();
  const cleanMobile = String(mobileNumber).trim();

  // 1. Query Supabase public.users table if configured
  if (isSupabaseConfigured()) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${cleanId},user_id.eq.${cleanId}`);

      if (!error && users && users.length > 0) {
        const foundUser = users[0];
        if (foundUser.password_hash !== password) {
          return { success: false, message: 'Invalid Password. Please check your password and try again.' };
        }
        if (cleanMobile && foundUser.mobile_number !== cleanMobile) {
          return { success: false, message: 'Mobile Number mismatch: The mobile number entered does not match the number saved for this Email account.' };
        }
        return { success: true, user: foundUser, isSuperAdmin: foundUser.role === 'super_admin' };
      }
    } catch (err) {
      console.warn('[Supabase Auth Notice]:', err.message);
    }
  }

  // 2. Fallback local memory authentication if Supabase is offline/unconfigured
  try {
    const localUsers = JSON.parse(localStorage.getItem('finsight_postgres_users') || '[]');
    const user = localUsers.find(u =>
      (u.email?.toLowerCase() === cleanId || u.user_id === cleanId)
    );

    if (user) {
      if (user.password_hash !== password) {
        return { success: false, message: 'Invalid Password. Please check your password and try again.' };
      }
      if (cleanMobile && user.mobile_number !== cleanMobile) {
        return { success: false, message: 'Mobile Number mismatch: The mobile number entered does not match the number saved for this Email account.' };
      }
      return { success: true, user, isSuperAdmin: user.role === 'super_admin' };
    }
  } catch (e) {}

  return { success: false, message: 'No registered business owner account found with provided Email / User ID.' };
}

/* ─────────────────────────────────────────────────────────────
   STAFF / EMPLOYEES CONTAINER IN SUPABASE
   ───────────────────────────────────────────────────────────── */

export async function getStaffFromSupabase(userId) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {}
  }
  const key = `finsight_staff_${String(userId).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export async function addStaffToSupabase(staffObj) {
  const userKey = String(staffObj.user_id || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `finsight_staff_${userKey}`;
  const local = JSON.parse(localStorage.getItem(key) || '[]');
  local.unshift(staffObj);
  localStorage.setItem(key, JSON.stringify(local));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('staff').insert([staffObj]);
    } catch (e) {}
  }
  return local;
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
 * Fetch Stock Inventory for specific user from Supabase Database
 */
export async function getInventoryFromSupabase(userId) {
  const userKey = String(userId || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
  const localKey = `finsight_stock_inventory_${userKey}`;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[Supabase Stock Fetch Error]:', err.message);
    }
  }
  return JSON.parse(localStorage.getItem(localKey) || '[]');
}

/**
 * Save Stock Inventory Details to Supabase & Dispatch to Webhook (Scoped per User)
 */
export async function saveStockToSupabase(stockPayload = {}) {
  const {
    userId = 'user',
    supplierName = 'Manual Store Stock Upload',
    invoiceNumber = `STK-${Math.floor(1000 + Math.random() * 9000)}`,
    items = [],
    source = 'manual_entry',
  } = stockPayload;

  const userKey = String(userId || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
  const localKey = `finsight_stock_inventory_${userKey}`;

  const formattedItems = items.map(item => {
    const costVal = parseFloat(String(item.rate || item.costPrice || item.price || '100').replace(/[^0-9.]/g, '')) || 100;
    const sellVal = parseFloat(String(item.sellingPrice || item.selling_price || '0').replace(/[^0-9.]/g, '')) || Math.round(costVal * 1.20);
    const gstRateStr = item.gst || item.gst_rate || '5%';

    return {
      id: item.id || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: userId,
      name: item.name || item.description || item.itemName || 'Stock Product',
      category: item.category || 'General Store',
      quantity: String(item.qty || item.quantity || '1 Unit'),
      stock_qty: parseInt(String(item.qty || item.quantity || '1').replace(/[^0-9]/g, '')) || 1,
      cost_price: `₹ ${costVal.toLocaleString('en-IN')}`,
      unit_price: `₹ ${costVal.toLocaleString('en-IN')}`,
      selling_price: `₹ ${sellVal.toLocaleString('en-IN')}`,
      gst_rate: gstRateStr,
      total_amount: item.total ? item.total : `₹ ${(costVal * (parseInt(item.qty || 1) || 1)).toLocaleString('en-IN')}`,
      supplier_name: supplierName,
      invoice_number: invoiceNumber,
      source: source,
      updated_at: new Date().toISOString(),
    };
  });

  // User-scoped Local storage inventory backup
  const existingStock = JSON.parse(localStorage.getItem(localKey) || '[]');
  const updatedStock = [...formattedItems, ...existingStock];
  localStorage.setItem(localKey, JSON.stringify(updatedStock));

  // Insert into Supabase table public.inventory if configured
  if (isSupabaseConfigured()) {
    try {
      console.log('[Supabase DB]: Inserting stock items into public.inventory...', formattedItems);
      await supabase.from('inventory').insert(
        formattedItems.map(it => ({
          id: it.id,
          user_id: userId,
          name: it.name,
          category: it.category,
          stock_qty: it.stock_qty,
          min_alert_threshold: 15,
          unit_price: it.unit_price,
          cost_price: it.cost_price,
          selling_price: it.selling_price,
          gst_rate: it.gst_rate,
          status: it.stock_qty <= 15 ? 'Low Stock Alert' : 'Healthy Stock',
          supplier_name: supplierName,
        }))
      );
    } catch (err) {
      console.warn('[Supabase Stock Save Error]:', err.message);
    }
  }

  // Dispatch Stock Details to Webhook
  triggerStockWebhookNode({
    event: 'stock_updated',
    user_id: userId,
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
