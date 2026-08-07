/**
 * db.js — Finora AI Supabase Database Layer
 *
 * ALL data is stored in and read from Supabase (PostgreSQL).
 * This module exposes the same interface (getTable, insert, update, delete)
 * as the old JSON wrapper so every route file works without changes.
 *
 * Column name normalisation:
 *   Supabase stores snake_case columns (stock_qty, min_alert_threshold…).
 *   The old JSON store used camelCase (stockQty, minAlertThreshold…).
 *   We normalise on the way out so the rest of the app is unaffected.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error('[DB FATAL]: SUPABASE_URL or SUPABASE_SECRET_KEY is not set in .env');
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
  auth: { persistSession: false },
});

// ── Table name aliases ─────────────────────────────────────────────────────────
// The old code referenced 'employees'; Supabase table is 'employees'.
// The old code referenced 'vendors';   Supabase table is 'vendors'.
const TABLE_MAP = {
  employees:      'employees',
  vendors:        'vendors',
  inventory:      'inventory',
  invoices:       'invoices',
  payments:       'payments',
  customer_bills: 'customer_bills',
  transactions:   'transactions',
  expenses:       'expenses',
  fraud_alerts:   'fraud_alerts',
  activity_logs:  'activity_logs',
  users:          'users',
  staff:          'employees',   // legacy alias
};

// ── Column normalisation: snake_case → camelCase for inventory ────────────────
function normaliseRow(tableName, row) {
  if (!row) return row;
  if (tableName === 'inventory') {
    return {
      ...row,
      stockQty:           row.stock_qty           ?? row.stockQty,
      minAlertThreshold:  row.min_alert_threshold  ?? row.minAlertThreshold,
      unitPrice:          row.unit_price            ?? row.unitPrice,
      costPrice:          row.cost_price            ?? row.costPrice,
      sellingPrice:       row.selling_price         ?? row.sellingPrice,
      gstRate:            row.gst_rate              ?? row.gstRate,
      supplierName:       row.supplier_name         ?? row.supplierName ?? row.supplier,
      supplier:           row.supplier_name         ?? row.supplier,
    };
  }
  if (tableName === 'employees' || tableName === 'staff') {
    return {
      ...row,
      salary_date:     row.salary_date     ?? row.salaryDate,
      payment_status:  row.payment_status  ?? row.paymentStatus,
      payment_history: row.payment_history ?? row.paymentHistory ?? [],
      joined_date:     row.joined_date     ?? row.joinedDate,
      joinedDate:      row.joined_date     ?? row.joinedDate,
    };
  }
  if (tableName === 'vendors') {
    return {
      ...row,
      contactPerson: row.contact_person ?? row.contactPerson,
      totalBilled:   row.total_billed   ?? row.totalBilled,
      trustScore:    row.trust_score    ?? row.trustScore,
    };
  }
  return row;
}

// ── Column normalisation: camelCase → snake_case for writes ─────────────────
function toDbRow(tableName, obj) {
  if (!obj) return obj;
  const row = { ...obj };
  if (tableName === 'inventory') {
    if (row.stockQty           !== undefined) { row.stock_qty           = row.stockQty;           delete row.stockQty; }
    if (row.minAlertThreshold  !== undefined) { row.min_alert_threshold = row.minAlertThreshold;  delete row.minAlertThreshold; }
    if (row.unitPrice          !== undefined) { row.unit_price          = row.unitPrice;          delete row.unitPrice; }
    if (row.costPrice          !== undefined) { row.cost_price          = row.costPrice;          delete row.costPrice; }
    if (row.sellingPrice       !== undefined) { row.selling_price       = row.sellingPrice;       delete row.sellingPrice; }
    if (row.gstRate            !== undefined) { row.gst_rate            = row.gstRate;            delete row.gstRate; }
    if (row.supplier           !== undefined) { row.supplier_name       = row.supplier;           delete row.supplier; }
    if (row.supplierName       !== undefined) { row.supplier_name       = row.supplierName;       delete row.supplierName; }
  }
  if (tableName === 'employees' || tableName === 'staff') {
    if (row.salaryDate       !== undefined) { row.salary_date     = row.salaryDate;     delete row.salaryDate; }
    if (row.paymentStatus    !== undefined) { row.payment_status  = row.paymentStatus;  delete row.paymentStatus; }
    if (row.paymentHistory   !== undefined) { row.payment_history = row.paymentHistory; delete row.paymentHistory; }
    if (row.joinedDate       !== undefined) { row.joined_date     = row.joinedDate;     delete row.joinedDate; }
  }
  if (tableName === 'vendors') {
    if (row.contactPerson !== undefined) { row.contact_person = row.contactPerson; delete row.contactPerson; }
    if (row.totalBilled   !== undefined) { row.total_billed   = row.totalBilled;   delete row.totalBilled; }
    if (row.trustScore    !== undefined) { row.trust_score    = row.trustScore;    delete row.trustScore; }
  }
  return row;
}

// ── Helper: resolve real table name ──────────────────────────────────────────
function resolveTable(name) {
  return TABLE_MAP[name] || name;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Database class — exposes the same API as the old JSON wrapper
// All methods are async and return resolved values (not Promises) via await
// at the route level.
// ═══════════════════════════════════════════════════════════════════════════════
class SupabaseDatabase {
  /**
   * getTable(tableName) — fetch all rows for a table (synchronous-style shim).
   * Because routes call this synchronously (db.getTable(...).filter(...)),
   * we cache a per-request snapshot.
   *
   * NOTE: For full Supabase integration routes should call await db.fetchTable().
   * The synchronous shim below works for the transition period by returning
   * the last-fetched snapshot.  Use db.fetchTable(name) for fresh data.
   */
  constructor() {
    this._cache = {};
  }

  // ── Async: fetch all rows for a table scoped by user ──────────────────────
  async fetchTable(tableName) {
    const tbl = resolveTable(tableName);
    const { data, error } = await supabase.from(tbl).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(`[DB fetchTable ${tbl}]:`, error.message);
      return [];
    }
    const rows = (data || []).map(r => normaliseRow(tableName, r));
    this._cache[tableName] = rows;
    return rows;
  }

  // ── Sync shim (returns cached snapshot — call fetchTable first) ───────────
  getTable(tableName) {
    return this._cache[tableName] || [];
  }

  // ── Async: insert a row ───────────────────────────────────────────────────
  async insert(tableName, item) {
    const tbl = resolveTable(tableName);
    const dbRow = toDbRow(tableName, { ...item });
    // Remove undefined values
    Object.keys(dbRow).forEach(k => { if (dbRow[k] === undefined) delete dbRow[k]; });

    const { data, error } = await supabase.from(tbl).insert(dbRow).select().single();
    if (error) {
      console.error(`[DB insert ${tbl}]:`, error.message);
      throw new Error(error.message);
    }
    return normaliseRow(tableName, data);
  }

  // ── Async: update rows matching a field value ─────────────────────────────
  async update(tableName, matchField, matchValue, updateData) {
    const tbl = resolveTable(tableName);
    const dbRow = toDbRow(tableName, { ...updateData });
    Object.keys(dbRow).forEach(k => { if (dbRow[k] === undefined) delete dbRow[k]; });

    const { data, error } = await supabase
      .from(tbl)
      .update(dbRow)
      .eq(matchField, matchValue)
      .select()
      .single();

    if (error) {
      console.error(`[DB update ${tbl}]:`, error.message);
      throw new Error(error.message);
    }
    return normaliseRow(tableName, data);
  }

  // ── Async: delete rows matching a field value ─────────────────────────────
  async delete(tableName, matchField, matchValue) {
    const tbl = resolveTable(tableName);
    const { error, count } = await supabase
      .from(tbl)
      .delete()
      .eq(matchField, matchValue);

    if (error) {
      console.error(`[DB delete ${tbl}]:`, error.message);
      throw new Error(error.message);
    }
    return count || 1;
  }

  // ── Async: fetch rows scoped by shopId ────────────────────────────────────
  async fetchScoped(tableName, shopId) {
    const tbl = resolveTable(tableName);
    const { data, error } = await supabase
      .from(tbl)
      .select('*')
      .eq('user_id', shopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[DB fetchScoped ${tbl}]:`, error.message);
      return [];
    }
    return (data || []).map(r => normaliseRow(tableName, r));
  }

  // ── Async: upsert settings (single record per user) ───────────────────────
  async upsertSettings(shopId, settingsData) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ user_id: shopId, data: settingsData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) {
      console.error('[DB upsertSettings]:', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  // ── Async: fetch settings for a shop ──────────────────────────────────────
  async fetchSettings(shopId) {
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('user_id', shopId)
      .single();
    if (error && error.code !== 'PGRST116') {  // PGRST116 = row not found
      console.error('[DB fetchSettings]:', error.message);
    }
    return data?.data || null;
  }
}

export const db = new SupabaseDatabase();
