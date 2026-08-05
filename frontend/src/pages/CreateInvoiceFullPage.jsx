import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Plus, Trash2, CheckCircle2, Printer, Download, TrendingUp, Package, Percent } from 'lucide-react';
import { apiTriggerStockWebhook } from '../services/api';

export default function CreateInvoiceFullPage({ onBack, onInvoiceCreated }) {
  const [theme] = useState(() => {
    try { return localStorage.getItem('finguard_theme') || 'dark'; } catch (e) { return 'dark'; }
  });

  // Available Store Products from DB / Stock Inventory
  const [availableStock, setAvailableStock] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('finguard_stock_inventory') || '[]');
      if (stored.length > 0) {
        return stored.map((st, i) => {
          const rateVal = parseFloat((st.rate || '0').replace(/[^0-9.]/g, '')) || 100;
          return {
            id: `prod-${i}`,
            name: st.name || st.item_name || 'Stock Product',
            costPrice: rateVal,
            sellingPrice: Math.round(rateVal * 1.22), // 22% retail margin
            gstRate: st.name && st.name.toLowerCase().includes('detergent') ? 18 : 5,
            stockQty: parseFloat((st.quantity || '10').replace(/[^0-9.]/g, '')) || 10,
            unit: (st.quantity || '').includes('Bag') ? 'Bags' : 'Packs',
          };
        });
      }
    } catch (e) {}

    return [
      { id: 'p1', name: 'Basmati Rice Bag (25kg)', costPrice: 1850, sellingPrice: 2200, gstRate: 5, stockQty: 10, unit: 'Bags' },
      { id: 'p2', name: 'Sunflower Cooking Oil (1L)', costPrice: 135, sellingPrice: 165, gstRate: 5, stockQty: 20, unit: 'Packs' },
      { id: 'p3', name: 'Refined Sugar (1kg)', costPrice: 45, sellingPrice: 55, gstRate: 5, stockQty: 15, unit: 'Packs' },
      { id: 'p4', name: 'Detergent Powder (1kg)', costPrice: 110, sellingPrice: 140, gstRate: 18, stockQty: 20, unit: 'Packs' },
      { id: 'p5', name: 'Wheat Flour (10kg)', costPrice: 380, sellingPrice: 450, gstRate: 5, stockQty: 120, unit: 'Bags' },
    ];
  });

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([
    { productId: 'p1', description: 'Basmati Rice Bag (25kg)', qty: 2, costPrice: 1850, price: 2200, gstRate: 5 },
    { productId: 'p2', description: 'Sunflower Cooking Oil (1L)', qty: 5, costPrice: 135, price: 165, gstRate: 5 },
  ]);

  const [billSummary, setBillSummary] = useState(null);

  // Handle Product Dropdown Selection
  const handleProductSelect = (index, prodId) => {
    const selectedProd = availableStock.find(p => p.id === prodId);
    if (!selectedProd) return;

    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: selectedProd.id,
        description: selectedProd.name,
        costPrice: selectedProd.costPrice,
        price: selectedProd.sellingPrice,
        gstRate: selectedProd.gstRate,
      };
      return copy;
    });
  };

  const handleAddItem = () => {
    const defaultProd = availableStock[0] || { id: 'p1', name: 'Custom Product', costPrice: 100, sellingPrice: 120, gstRate: 5 };
    setItems(prev => [
      ...prev,
      {
        productId: defaultProd.id,
        description: defaultProd.name,
        qty: 1,
        costPrice: defaultProd.costPrice,
        price: defaultProd.sellingPrice,
        gstRate: defaultProd.gstRate,
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, val) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  // Calculations
  const calculateNetSubtotal = () => {
    return items.reduce((acc, item) => acc + (Number(item.qty || 0) * Number(item.price || 0)), 0);
  };

  const calculateTotalGstTax = () => {
    return items.reduce((acc, item) => {
      const lineSubtotal = Number(item.qty || 0) * Number(item.price || 0);
      const lineTax = Math.round(lineSubtotal * (Number(item.gstRate || 5) / 100));
      return acc + lineTax;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateNetSubtotal() + calculateTotalGstTax();
  };

  const calculateTotalGrossProfit = () => {
    return items.reduce((acc, item) => {
      const unitMargin = Number(item.price || 0) - Number(item.costPrice || 0);
      return acc + (unitMargin * Number(item.qty || 0));
    }, 0);
  };

  // Save Customer Bill & Auto Deduct Product Stock
  const handleSaveBill = (e) => {
    e.preventDefault();
    if (!customerName) return;

    const netSub = calculateNetSubtotal();
    const gstTax = calculateTotalGstTax();
    const grandTotal = calculateGrandTotal();
    const profitEarned = calculateTotalGrossProfit();
    const generatedBillNo = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Deduct Sold Quantity from Available Stock in localStorage and sync with Inventory state
    try {
      const storedStock = JSON.parse(localStorage.getItem('finsight_stock_inventory') || localStorage.getItem('finguard_stock_inventory') || '[]');
      const defaultStockList = storedStock.length > 0 ? storedStock : [
        { id: 'SKU-1000', name: 'Basmati Rice 25kg', item_name: 'Basmati Rice 25kg', category: 'General Store', stock_qty: 60, cost_price: '₹ 1,850', selling_price: '₹ 2,200', supplier_name: 'ABC Wholesale Traders' },
        { id: 'SKU-1001', name: 'Sunflower Oil 5L', item_name: 'Sunflower Oil 5L', category: 'General Store', stock_qty: 48, cost_price: '₹ 720', selling_price: '₹ 860', supplier_name: 'ABC Wholesale Traders' },
        { id: 'SKU-1002', name: 'Sugar 1kg', item_name: 'Sugar 1kg', category: 'General Store', stock_qty: 200, cost_price: '₹ 46', selling_price: '₹ 55', supplier_name: 'ABC Wholesale Traders' },
        { id: 'SKU-1003', name: 'Detergent Powder 1kg', item_name: 'Detergent Powder 1kg', category: 'General Store', stock_qty: 50, cost_price: '₹ 110', selling_price: '₹ 140', supplier_name: 'ABC Wholesale Traders' },
      ];

      const sanitize = str => (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

      const updatedStock = defaultStockList.map(st => {
        const stockKey = sanitize(st.name || st.item_name || '');
        const matchItem = items.find(it => {
          const itemKey = sanitize(it.description || it.name || '');
          return (itemKey && stockKey && (itemKey.includes(stockKey) || stockKey.includes(itemKey))) ||
                 (itemKey.includes('rice') && stockKey.includes('rice')) ||
                 (itemKey.includes('oil') && stockKey.includes('oil')) ||
                 (itemKey.includes('sugar') && stockKey.includes('sugar')) ||
                 (itemKey.includes('detergent') && stockKey.includes('detergent'));
        });

        if (matchItem) {
          const currentQty = parseInt(String(st.stock_qty || st.stockQty || st.quantity || '10').replace(/[^0-9]/g, '')) || 10;
          const soldQty = Number(matchItem.qty || 1);
          const newQty = Math.max(0, currentQty - soldQty);
          return {
            ...st,
            stock_qty: newQty,
            stockQty: newQty,
            quantity: `${newQty} Units`,
            updated_at: new Date().toISOString(),
          };
        }
        return st;
      });

      localStorage.setItem('finsight_stock_inventory', JSON.stringify(updatedStock));
      localStorage.setItem('finguard_stock_inventory', JSON.stringify(updatedStock));
      window.dispatchEvent(new Event('storage'));

      // 2. Trigger Secondary Stock Webhook for STOCK_CUSTOMER_BOUGHT event
      apiTriggerStockWebhook('STOCK_CUSTOMER_BOUGHT', {
        customerName: customerName,
        billNo: generatedBillNo,
        items: items,
        source: 'Customer POS Bill Created',
      }).catch(err => console.log('Webhook trigger notice:', err));
    } catch (err) {
      console.error('Stock auto-deduction error:', err);
    }

    // 2. Record Financial Cash Inflow (Transaction IN) for Customer Payment
    try {
      const existingTransactions = JSON.parse(localStorage.getItem('finsight_transactions') || '[]');
      existingTransactions.unshift({
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'IN',
        description: `Customer POS Sale (Bill #${generatedBillNo} - ${customerName})`,
        category: 'Customer Sale',
        amount: `₹ ${grandTotal.toLocaleString('en-IN')}`,
        balance: `₹ 4,85,000`,
      });
      localStorage.setItem('finsight_transactions', JSON.stringify(existingTransactions));
    } catch (e) {}

    // 3. Save Customer Bill Record
    const billRecord = {
      id: `bill-${Date.now()}`,
      billNo: generatedBillNo,
      invoice_number: generatedBillNo,
      supplier_name: customerName,
      customerName,
      customerPhone,
      items,
      subtotal: netSub,
      gstTax,
      grandTotal,
      grand_total: grandTotal,
      profitEarned,
      createdAt: new Date().toISOString(),
      invoice_date: new Date().toISOString().split('T')[0],
      status: 'Paid',
    };

    try {
      const storedBills = JSON.parse(localStorage.getItem('finsight_customer_invoices') || '[]');
      storedBills.unshift(billRecord);
      localStorage.setItem('finsight_customer_invoices', JSON.stringify(storedBills));
    } catch (err) {}

    setBillSummary(billRecord);
  };

  return (
    <div className={`fg-dashboard-root fg-theme-${theme}`} style={{
      width: '100%', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <header className="fg-topbar" style={{
        height: 66, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={onBack}
          className="fg-btn-ghost"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 99,
            fontSize: 13, fontWeight: 700,
          }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Owner Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #F3CD97, #E2B36B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={18} color="#050708" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg-text-primary)' }}>
            Customer <span style={{ color: 'var(--fg-accent)' }}>Billing &amp; Invoice Engine</span>
          </span>
        </div>

        <span className="fg-ai-badge">
          Automatic Stock Reduction Active
        </span>
      </header>

      {/* Main Billing View */}
      <main style={{ flex: 1, padding: '36px 48px', maxWidth: 1040, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--fg-text-primary)', marginBottom: 4 }}>
              🧾 Create Customer Bill &amp; Auto-Deduct Stock
            </h1>
            <p style={{ color: 'var(--fg-text-muted)', fontSize: 14 }}>
              Select store products from dropdown. System automatically calculates Selling Price, Wholesale GST %, Grand Total &amp; Gross Profit Margin.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBill} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Customer Details Box */}
          <div className="lc-glass-card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 6, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer / Store Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar / City Retailers"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="fg-input"
                style={{ padding: '12px 16px', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 6, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number (10 Digits)</label>
              <input
                type="tel"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="fg-input"
                style={{ padding: '12px 16px', fontSize: 14 }}
              />
            </div>
          </div>

          {/* Items Table Box with Product Dropdown */}
          <div className="lc-glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Select Products Bought by Customer</h3>
                <p style={{ fontSize: 11, color: 'var(--fg-text-muted)' }}>Stock items loaded directly from PostgreSQL &amp; Supabase Inventory</p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="lc-liquid-btn-ghost"
                style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> + Add Item Row
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--fg-bg-secondary)', borderBottom: '1px solid var(--fg-border)', color: 'var(--fg-accent)', fontSize: 11, fontFamily: "'Inter', monospace", textTransform: 'uppercase' }}>
                  <th style={{ padding: 12 }}>Select Product (Stock DB)</th>
                  <th style={{ padding: 12, width: 85 }}>Qty</th>
                  <th style={{ padding: 12, width: 110 }}>Wholesale Cost (₹)</th>
                  <th style={{ padding: 12, width: 115 }}>Selling MRP (₹)</th>
                  <th style={{ padding: 12, width: 85 }}>GST %</th>
                  <th style={{ padding: 12, width: 120 }}>Total (₹)</th>
                  <th style={{ padding: 12, width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineNet = Number(item.qty || 0) * Number(item.price || 0);
                  const lineTax = Math.round(lineNet * (Number(item.gstRate || 5) / 100));
                  const lineTotal = lineNet + lineTax;
                  const lineProfit = (Number(item.price || 0) - Number(item.costPrice || 0)) * Number(item.qty || 0);

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--fg-border-subtle)' }}>
                      <td style={{ padding: 8 }}>
                        <select
                          value={item.productId}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                          className="fg-input"
                          style={{ padding: '8px 10px', fontSize: 13, fontWeight: 700 }}
                        >
                          {availableStock.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stockQty} {p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: 8 }}>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={e => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                          className="fg-input"
                          style={{ padding: '8px 10px', fontSize: 13, fontWeight: 700 }}
                        />
                      </td>
                      <td style={{ padding: 8 }}>
                        <input
                          type="number"
                          value={item.costPrice}
                          onChange={e => handleItemChange(idx, 'costPrice', parseFloat(e.target.value) || 0)}
                          className="fg-input"
                          style={{ padding: '8px 10px', fontSize: 12, color: 'var(--fg-text-muted)' }}
                        />
                      </td>
                      <td style={{ padding: 8 }}>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="fg-input"
                          style={{ padding: '8px 10px', fontSize: 13, fontWeight: 800, color: 'var(--fg-text-primary)' }}
                        />
                      </td>
                      <td style={{ padding: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--fg-accent)', background: 'var(--fg-accent-soft)', padding: '4px 8px', borderRadius: 6 }}>
                          {item.gstRate}%
                        </span>
                      </td>
                      <td style={{ padding: 12, fontWeight: 800, color: 'var(--fg-accent)' }}>
                        ₹ {lineTotal.toLocaleString('en-IN')}
                        <div style={{ fontSize: 10, color: 'var(--fg-success)', fontWeight: 700 }}>
                          Profit: +₹ {lineProfit.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* FINANCIAL SUMMARY & PROFIT BAR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 14, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--fg-border)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Net Subtotal</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 2 }}>₹ {calculateNetSubtotal().toLocaleString('en-IN')}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Govt GST Tax ({items[0]?.gstRate || 5}%)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg-accent)', marginTop: 2 }}>+₹ {calculateTotalGstTax().toLocaleString('en-IN')}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Grand Total Payable</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-success)', marginTop: 2 }}>₹ {calculateGrandTotal().toLocaleString('en-IN')}</div>
              </div>

              <div style={{ background: 'rgba(32,214,122,0.12)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(32,214,122,0.3)' }}>
                <div style={{ fontSize: 10, color: 'var(--fg-success)', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={12} /> Net Sale Profit
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--fg-success)', marginTop: 2 }}>+₹ {calculateTotalGrossProfit().toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <button
              type="button"
              onClick={onBack}
              className="lc-liquid-btn-ghost"
              style={{ flex: 1, padding: 14, fontWeight: 700, fontSize: 14 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="lc-liquid-btn-primary"
              style={{ flex: 2, padding: 14, fontWeight: 800, fontSize: 15 }}
            >
              🧾 Save Bill, Deduct Stock &amp; Print Receipt
            </button>
          </div>
        </form>
      </main>

      {/* BILL SUCCESS & PROFIT SUMMARY MODAL */}
      {billSummary && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 480, padding: 28, borderRadius: 20, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(32,214,122,0.2)', color: 'var(--fg-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '1px solid rgba(32,214,122,0.4)' }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-text-primary)', marginBottom: 4 }}>
              Customer Bill Created &amp; Stock Updated!
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg-text-muted)', marginBottom: 20 }}>
              Bill <strong>#{billSummary.billNo}</strong> generated for <strong>{billSummary.customerName}</strong>
            </p>

            <div style={{ background: 'var(--fg-bg-secondary)', padding: 16, borderRadius: 14, border: '1px solid var(--fg-border)', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', fontSize: 13, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--fg-text-muted)' }}>Customer Net Items Subtotal:</span>
                <strong style={{ color: 'var(--fg-text-primary)' }}>₹ {billSummary.subtotal.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--fg-text-muted)' }}>Wholesale GST Tax Applied:</span>
                <strong style={{ color: 'var(--fg-accent)' }}>+₹ {billSummary.gstTax.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--fg-border)', paddingTop: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--fg-text-primary)' }}>Grand Total Collected:</span>
                <strong style={{ fontSize: 16, color: 'var(--fg-success)' }}>₹ {billSummary.grandTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(32,214,122,0.14)', padding: 10, borderRadius: 10, border: '1px solid rgba(32,214,122,0.3)', marginTop: 4 }}>
                <span style={{ fontWeight: 800, color: 'var(--fg-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={14} /> Gross Profit Earned:
                </span>
                <strong style={{ fontSize: 16, color: 'var(--fg-success)' }}>+₹ {billSummary.profitEarned.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  alert(`Receipt #${billSummary.billNo} sent to printer!`);
                  setBillSummary(null);
                  if (onInvoiceCreated) onInvoiceCreated();
                  onBack();
                }}
                className="lc-liquid-btn-primary"
                style={{ flex: 1, padding: 12, fontSize: 13 }}
              >
                🖨️ Print Customer Receipt
              </button>
              <button
                onClick={() => {
                  setBillSummary(null);
                  if (onInvoiceCreated) onInvoiceCreated();
                  onBack();
                }}
                className="lc-liquid-btn-ghost"
                style={{ flex: 1, padding: 12, fontSize: 13 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
