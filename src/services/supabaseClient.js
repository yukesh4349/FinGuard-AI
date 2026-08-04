import { createClient } from '@supabase/supabase-js';

// Supabase Environment Credentials (Configured in .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save OCR Extracted Invoice Data & Raw Text to Supabase Database
 * @param {Object} ocrData - Object containing supplier, inv no, date, subtotal, tax, total, items array, and raw text
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

  // Local fallback storage array in localStorage as fallback backup
  const storedLocalInvoices = JSON.parse(localStorage.getItem('finguard_ocr_invoices') || '[]');
  const newInvoiceRecord = {
    id: `ocr-${Date.now()}`,
    supplier_name: supplierName,
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    subtotal,
    tax_gst: taxGst,
    grand_total: grandTotal,
    items,
    raw_text: rawText,
    created_at: new Date().toISOString(),
  };
  storedLocalInvoices.unshift(newInvoiceRecord);
  localStorage.setItem('finguard_ocr_invoices', JSON.stringify(storedLocalInvoices));

  // Check if Supabase URL and Anon Key are configured
  if (supabaseUrl.includes('placeholder')) {
    console.warn('[Supabase Notice]: Supabase URL or Anon Key not configured in .env file. Invoice saved to local fallback DB.');
    return {
      success: true,
      data: [newInvoiceRecord],
      savedLocally: true,
      message: 'Saved to Local Store DB. Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to sync to Supabase Cloud.',
    };
  }

  try {
    console.log('[Supabase DB]: Inserting OCR Extracted Record to public.ocr_invoices...', ocrData);

    const { data, error } = await supabase
      .from('ocr_invoices')
      .insert([
        {
          supplier_name: supplierName,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          subtotal: subtotal,
          tax_gst: taxGst,
          grand_total: grandTotal,
          items: items,
          raw_text: rawText,
        },
      ])
      .select();

    if (error) {
      console.error('[Supabase DB Error]:', error);
      return {
        success: false,
        error: error.message,
        savedLocally: true,
        data: [newInvoiceRecord],
      };
    }

    console.log('[Supabase DB Success]: Invoice & Raw Text Saved!', data);
    return {
      success: true,
      data,
      savedLocally: false,
    };
  } catch (err) {
    console.error('[Supabase Connection Error]:', err);
    return {
      success: false,
      error: err.message,
      savedLocally: true,
      data: [newInvoiceRecord],
    };
  }
}

/**
 * Fetch All Saved OCR Invoices from Supabase Database
 */
export async function getStoredOcrInvoicesFromSupabase() {
  if (supabaseUrl.includes('placeholder')) {
    return JSON.parse(localStorage.getItem('finguard_ocr_invoices') || '[]');
  }

  try {
    const { data, error } = await supabase
      .from('ocr_invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Fetch Error]:', error);
      return JSON.parse(localStorage.getItem('finguard_ocr_invoices') || '[]');
    }

    return data || [];
  } catch (err) {
    return JSON.parse(localStorage.getItem('finguard_ocr_invoices') || '[]');
  }
}
