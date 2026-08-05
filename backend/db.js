import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

// Initial seed dataset for database tables
const initialDatabase = {
  users: [
    {
      id: 1,
      user_id: 'ADMIN-001',
      company_name: 'FinSight Central Administration',
      mobile_number: '9999999999',
      email: 'admin@finsight.ai',
      password_hash: 'admin123',
      role: 'super_admin',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      user_id: 'OWNER-METRO-8492',
      company_name: 'Metro Superstore Ltd',
      mobile_number: '9876543210',
      email: 'owner@metrosuperstore.com',
      password_hash: 'FS-8924-XK9',
      role: 'owner',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      user_id: 'accountant@metrosuperstore.com',
      company_name: 'Metro Superstore Ltd',
      mobile_number: '9876523451',
      email: 'accountant@metrosuperstore.com',
      password_hash: 'FS-CA-2026',
      role: 'accountant',
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      user_id: 'cashier.billing@metrosuperstore.com',
      company_name: 'Metro Superstore Ltd',
      mobile_number: '9876545673',
      email: 'cashier.billing@metrosuperstore.com',
      password_hash: 'FS-BILL-789',
      role: 'billing',
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      user_id: 'manager.stock@metrosuperstore.com',
      company_name: 'Metro Superstore Ltd',
      mobile_number: '9876534562',
      email: 'manager.stock@metrosuperstore.com',
      password_hash: 'FS-STOCK-552',
      role: 'stock_manager',
      created_at: new Date().toISOString(),
    },
  ],
  employees: [
    {
      id: 'EMP-001',
      name: 'Ramesh Kumar',
      role: 'Senior Cashier & Billing Executive',
      phone: '9876545673',
      salary: '₹ 28,000',
      status: 'Active',
      joinedDate: '15-Jan-2025',
    },
    {
      id: 'EMP-002',
      name: 'Suresh Patel',
      role: 'Store Stock & Inventory Manager',
      phone: '9876534562',
      salary: '₹ 32,000',
      status: 'Active',
      joinedDate: '01-Mar-2025',
    },
    {
      id: 'EMP-003',
      name: 'Priya Sharma',
      role: 'Store Accountant & Tax Executive',
      phone: '9876523451',
      salary: '₹ 35,000',
      status: 'Active',
      joinedDate: '10-Jun-2025',
    },
    {
      id: 'EMP-004',
      name: 'Vikram Singh',
      role: 'Logistics & Dispatch Assistant',
      phone: '9876512340',
      salary: '₹ 22,000',
      status: 'Active',
      joinedDate: '20-Nov-2025',
    },
  ],
  invoices: [
    {
      id: 'INV-2026-001',
      invoice_number: 'INV-2026-001',
      supplier_name: 'Apex Supermarket Wholesale',
      invoice_date: '2026-08-01',
      subtotal: 145000,
      tax_gst: 7250,
      grand_total: 152250,
      status: 'Verified',
      riskScore: '0.01 (Safe)',
      items: [
        { name: 'Basmati Rice 25kg', qty: 50, price: 1850, tax: 4625 },
        { name: 'Sunflower Oil 5L', qty: 40, price: 720, tax: 1440 },
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: 'INV-2026-002',
      invoice_number: 'INV-2026-002',
      supplier_name: 'Metro Dairy Distributors',
      invoice_date: '2026-08-02',
      subtotal: 48000,
      tax_gst: 2400,
      grand_total: 50400,
      status: 'Verified',
      riskScore: '0.02 (Safe)',
      items: [
        { name: 'Fresh Milk 1L Pack', qty: 200, price: 60, tax: 600 }
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: 'INV-2026-003',
      invoice_number: 'INV-2026-003',
      supplier_name: 'Unknown Traders Corp',
      invoice_date: '2026-08-03',
      subtotal: 89000,
      tax_gst: 16020,
      grand_total: 105020,
      status: 'Flagged High Risk',
      riskScore: '0.94 (Suspicious)',
      duplicateReason: 'Duplicate invoice number INV-2026-003 detected from Unknown Traders Corp.',
      items: [
        { name: 'Bulk Sugar 50kg', qty: 40, price: 2000, tax: 16000 }
      ],
      created_at: new Date().toISOString(),
    }
  ],
  payments: [
    {
      id: 'PAY-901',
      recipient: 'Apex Supermarket Wholesale',
      amount: '₹ 1,47,500',
      date: '2026-08-02',
      mode: 'NEFT / Bank Transfer',
      status: 'Completed',
    },
    {
      id: 'PAY-902',
      recipient: 'Metro Dairy Distributors',
      amount: '₹ 50,400',
      date: '2026-08-03',
      mode: 'UPI AutoPay',
      status: 'Completed',
    },
  ],
  expenses: [
    {
      id: 'EXP-101',
      category: 'Electricity Bill',
      amount: '₹ 18,450',
      date: '2026-08-01',
      paidTo: 'State Electricity Board',
      status: 'Paid',
    },
    {
      id: 'EXP-102',
      category: 'Store Logistics & Freight',
      amount: '₹ 6,200',
      date: '2026-08-02',
      paidTo: 'Express Cargo Logistics',
      status: 'Paid',
    },
    {
      id: 'EXP-103',
      category: 'Shop Maintenance',
      amount: '₹ 3,500',
      date: '2026-08-03',
      paidTo: 'Local Repair Services',
      status: 'Paid',
    },
  ],
  transactions: [
    { id: 'TRX-9011', date: '03 Aug 2026, 09:30 AM', type: 'IN', description: 'Daily Store Retail Customer Sales', category: 'Sales Revenue', amount: '+₹ 1,45,000', balance: '₹ 14,80,000' },
    { id: 'TRX-9010', date: '02 Aug 2026, 04:15 PM', type: 'OUT', description: 'Vendor Payment - Apex Wholesale', category: 'Supplier Bills', amount: '-₹ 45,000', balance: '₹ 13,35,000' },
    { id: 'TRX-9009', date: '01 Aug 2026, 06:00 PM', type: 'OUT', description: 'Store Electricity Bill Payment', category: 'Shop Utilities', amount: '-₹ 18,400', balance: '₹ 13,80,000' },
    { id: 'TRX-9008', date: '31 Jul 2026, 02:30 PM', type: 'IN', description: 'Wholesale Bulk Order Payment', category: 'Bulk Sales', amount: '+₹ 3,20,000', balance: '₹ 13,98,400' },
    { id: 'TRX-9007', date: '30 Jul 2026, 11:00 AM', type: 'OUT', description: 'Monthly Staff Salary Payout', category: 'Employee Salaries', amount: '-₹ 1,65,000', balance: '₹ 10,78,400' },
  ],
  inventory: [
    {
      id: 'SKU-101',
      name: 'Cooking Oil (5L Pack)',
      category: 'Grocery & FMCG',
      stockQty: 12,
      minAlertThreshold: 20,
      unitPrice: '₹ 720',
      status: 'Low Stock Alert',
      supplier: 'Apex Supermarket Wholesale',
    },
    {
      id: 'SKU-102',
      name: 'Basmati Rice Bags (25kg)',
      category: 'Grains & Pulses',
      stockQty: 8,
      minAlertThreshold: 15,
      unitPrice: '₹ 1,850',
      status: 'Low Stock Alert',
      supplier: 'Apex Supermarket Wholesale',
    },
    {
      id: 'SKU-103',
      name: 'Refined Sugar (1kg)',
      category: 'Grocery & FMCG',
      stockQty: 15,
      minAlertThreshold: 25,
      unitPrice: '₹ 46',
      status: 'Low Stock Alert',
      supplier: 'Metro Dairy Distributors',
    },
    {
      id: 'SKU-104',
      name: 'Fresh Whole Milk (1L)',
      category: 'Dairy Products',
      stockQty: 85,
      minAlertThreshold: 30,
      unitPrice: '₹ 60',
      status: 'Healthy Stock',
      supplier: 'Metro Dairy Distributors',
    },
    {
      id: 'SKU-105',
      name: 'Detergent Powder (1kg)',
      category: 'Cleaning Supplies',
      stockQty: 42,
      minAlertThreshold: 15,
      unitPrice: '₹ 110',
      status: 'Healthy Stock',
      supplier: 'Unknown Traders',
    },
  ],
  vendors: [
    {
      id: 'VEND-01',
      name: 'Apex Supermarket Wholesale',
      contactPerson: 'Rajesh Mehta',
      phone: '9820011223',
      gstin: '27AAAAA0000A1Z5',
      totalBilled: '₹ 14,85,000',
      trustScore: '98% (Verified)',
    },
    {
      id: 'VEND-02',
      name: 'Metro Dairy Distributors',
      contactPerson: 'Anil Verma',
      phone: '9820033445',
      gstin: '27BBBBB1111B1Z6',
      totalBilled: '₹ 6,40,000',
      trustScore: '99% (Verified)',
    },
    {
      id: 'VEND-03',
      name: 'Unknown Traders Corp',
      contactPerson: 'Vijay Gupta',
      phone: '9820099887',
      gstin: '27INVALID0000Z1',
      totalBilled: '₹ 1,05,020',
      trustScore: '12% (High Fraud Risk)',
    },
  ],
  gst_rates: [
    { hsn_code: '1512', category: 'Edible Oils', gst_rate: 5, status: 'Active' },
    { hsn_code: '1006', category: 'Basmati Rice', gst_rate: 5, status: 'Active' },
    { hsn_code: '0405', category: 'Butter & Dairy Fats', gst_rate: 12, status: 'Active' },
    { hsn_code: '1701', category: 'Refined Cane Sugar', gst_rate: 5, status: 'Active' },
    { hsn_code: '8471', category: 'POS Computers & Hardware', gst_rate: 18, status: 'Active' },
  ],
  fraud_alerts: [
    {
      id: 'ALT-101',
      type: 'Duplicate Bill Detected',
      message: 'Duplicate bill INV-2026-003 detected from Unknown Traders Corp.',
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
  ],
};

class Database {
  constructor() {
    this.data = initialDatabase;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[DB Load Error]:', err.message);
      this.data = initialDatabase;
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB Save Error]:', err.message);
    }
  }

  getTable(tableName) {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    return this.data[tableName];
  }

  insert(tableName, item) {
    const table = this.getTable(tableName);
    table.unshift(item);
    this.save();
    return item;
  }

  update(tableName, predicate, updateFn) {
    const table = this.getTable(tableName);
    let updatedCount = 0;
    table.forEach(item => {
      if (predicate(item)) {
        updateFn(item);
        updatedCount++;
      }
    });
    if (updatedCount > 0) this.save();
    return updatedCount;
  }

  delete(tableName, predicate) {
    if (!this.data[tableName]) return 0;
    const initialLen = this.data[tableName].length;
    this.data[tableName] = this.data[tableName].filter(item => !predicate(item));
    const deletedCount = initialLen - this.data[tableName].length;
    if (deletedCount > 0) this.save();
    return deletedCount;
  }
}

export const db = new Database();
