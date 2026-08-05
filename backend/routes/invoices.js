import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function normalizeInvoiceNo(no) {
  if (!no) return '';
  return String(no).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeName(str) {
  if (!str) return '';
  return String(str).toLowerCase().trim();
}

function checkDuplicateInDb(invoicesList, supplierName, invoiceNo, grandTotal) {
  const normNo = normalizeInvoiceNo(invoiceNo);
  const normSupplier = normalizeName(supplierName);
  const totalVal = parseFloat(grandTotal || 0);

  for (const inv of invoicesList) {
    const existingNormNo = normalizeInvoiceNo(inv.invoice_number);
    const existingNormSupplier = normalizeName(inv.supplier_name);
    const existingTotal = parseFloat(inv.grand_total || 0);

    // Check 1: Exact normalized invoice number match
    if (normNo && existingNormNo && normNo === existingNormNo) {
      return {
        isDuplicate: true,
        matchedInvoice: inv,
        reason: `Invoice number #${inv.invoice_number} matches a previous bill recorded from ${inv.supplier_name}.`
      };
    }

    // Check 2: Same supplier + Same Grand Total amount
    if (normSupplier && existingNormSupplier && (normSupplier.includes(existingNormSupplier) || existingNormSupplier.includes(normSupplier))) {
      if (totalVal > 0 && Math.abs(totalVal - existingTotal) < 5) {
        return {
          isDuplicate: true,
          matchedInvoice: inv,
          reason: `Duplicate bill alert: An invoice of ₹ ${existingTotal.toLocaleString('en-IN')} from ${inv.supplier_name} was already paid/uploaded previously.`
        };
      }
    }
  }

  return { isDuplicate: false };
}

// GET /api/invoices
router.get('/', (req, res) => {
  const invoices = db.getTable('invoices');
  res.json({ success: true, invoices });
});

// POST /api/invoices
router.post('/', (req, res) => {
  const { supplier_name, invoice_number, invoice_date, subtotal, tax_gst, grand_total, items } = req.body;

  if (!supplier_name || !grand_total) {
    return res.status(400).json({ success: false, error: 'Supplier Name and Total Amount are required.' });
  }

  const existingInvoices = db.getTable('invoices');
  const dupCheck = checkDuplicateInDb(existingInvoices, supplier_name, invoice_number, grand_total);

  const newInvoice = {
    id: `INV-${Date.now()}`,
    invoice_number: invoice_number || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier_name,
    invoice_date: invoice_date || new Date().toISOString().split('T')[0],
    subtotal: parseFloat(subtotal || grand_total),
    tax_gst: parseFloat(tax_gst || 0),
    grand_total: parseFloat(grand_total),
    status: dupCheck.isDuplicate ? 'Flagged High Risk' : 'Verified',
    riskScore: dupCheck.isDuplicate ? '0.95 (Duplicate Bill Flagged)' : '0.01 (Safe)',
    duplicateReason: dupCheck.isDuplicate ? dupCheck.reason : null,
    items: items || [],
    created_at: new Date().toISOString(),
  };

  db.insert('invoices', newInvoice);

  if (dupCheck.isDuplicate) {
    db.insert('fraud_alerts', {
      id: `ALT-${Date.now()}`,
      type: 'Duplicate Invoice Warning',
      message: dupCheck.reason,
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  }

  // Automatically update stock inventory if items were provided
  if (items && Array.isArray(items)) {
    const inventory = db.getTable('inventory');
    items.forEach(item => {
      const existing = inventory.find(i => i.name.toLowerCase() === (item.name || '').toLowerCase());
      if (existing) {
        existing.stockQty += parseInt(item.qty || 1);
      } else if (item.name) {
        db.insert('inventory', {
          id: `SKU-${Math.floor(100 + Math.random() * 900)}`,
          name: item.name,
          category: 'General Goods',
          stockQty: parseInt(item.qty || 1),
          minAlertThreshold: 15,
          unitPrice: item.sellingPrice || `₹ ${item.price || 100}`,
          status: 'Healthy Stock',
          supplier: supplier_name,
        });
      }
    });
  }

  res.status(201).json({
    success: true,
    isDuplicate: dupCheck.isDuplicate,
    message: dupCheck.isDuplicate
      ? `Duplicate Warning: ${dupCheck.reason}`
      : 'Bill saved successfully!',
    invoice: newInvoice
  });
});

// POST /api/invoices/upload (OCR process endpoint with robust duplicate check)
router.post('/upload', (req, res) => {
  const { supplierName, invoiceNumber, invoiceDate, subtotal, taxGst, grandTotal, items, rawText } = req.body;

  const existingInvoices = db.getTable('invoices');
  const dupCheck = checkDuplicateInDb(existingInvoices, supplierName, invoiceNumber, grandTotal);

  const newInvoice = {
    id: `ocr-${Date.now()}`,
    invoice_number: invoiceNumber || `INV-OCR-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier_name: supplierName || 'OCR Upload Vendor',
    invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
    subtotal: parseFloat(subtotal || grandTotal || 0),
    tax_gst: parseFloat(taxGst || 0),
    grand_total: parseFloat(grandTotal || 0),
    status: dupCheck.isDuplicate ? 'Flagged High Risk' : 'Verified',
    riskScore: dupCheck.isDuplicate ? '0.96 (Duplicate Bill Detected)' : '0.02 (Safe Verified)',
    duplicateReason: dupCheck.isDuplicate ? dupCheck.reason : null,
    items: items || [],
    raw_text: rawText || '',
    created_at: new Date().toISOString(),
  };

  db.insert('invoices', newInvoice);

  if (dupCheck.isDuplicate) {
    db.insert('fraud_alerts', {
      id: `ALT-${Date.now()}`,
      type: 'Duplicate Invoice Warning',
      message: dupCheck.reason,
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  }

  res.json({
    success: true,
    isDuplicate: dupCheck.isDuplicate,
    message: dupCheck.isDuplicate
      ? `Duplicate Bill Intercepted: ${dupCheck.reason}`
      : 'Bill scanned and saved!',
    invoice: newInvoice
  });
});

export default router;
