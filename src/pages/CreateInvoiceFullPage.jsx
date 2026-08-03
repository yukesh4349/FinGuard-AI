import React, { useState } from 'react';
import { ArrowLeft, FileText, Plus, Trash2, CheckCircle2, Printer, Download } from 'lucide-react';

export default function CreateInvoiceFullPage({ onBack, onInvoiceCreated }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([
    { description: 'Rice Bag 25kg', qty: 2, price: 1400 },
    { description: 'Cooking Oil 1L Pack', qty: 5, price: 130 },
  ]);

  const handleAddItem = () => {
    setItems(prev => [...prev, { description: '', qty: 1, price: 0 }]);
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

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (Number(item.qty || 0) * Number(item.price || 0)), 0);
  };

  const handleSaveBill = (e) => {
    e.preventDefault();
    if (!customerName) return;
    alert(`Success: Customer Bill created for ${customerName} (Total: ₹ ${calculateSubtotal()})`);
    if (onInvoiceCreated) onInvoiceCreated();
    onBack();
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      backgroundColor: '#F8FAFC', color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <header style={{
        height: 66, padding: '0 32px',
        backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(13,148,136,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 99,
            backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)',
            color: '#0D9488', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Owner Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
            Customer <span style={{ color: '#0D9488' }}>Billing &amp; Invoice</span>
          </span>
        </div>

        <span style={{ fontSize: 12, color: '#0D9488', fontWeight: 700, backgroundColor: '#F0FDFA', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(13,148,136,0.3)' }}>
          New Customer Invoice
        </span>
      </header>

      {/* Main Billing View */}
      <main style={{ flex: 1, padding: '36px 48px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            🧾 Create Customer Invoice
          </h1>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Fill customer details and item list below to print or download bill receipt.
          </p>
        </div>

        <form onSubmit={handleSaveBill} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Customer Details Box */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, border: '1px solid rgba(13,148,136,0.2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Customer / Store Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar / City Grocers"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Mobile Number (Digits Only)</label>
              <input
                type="tel"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontSize: 14 }}
              />
            </div>
          </div>

          {/* Items Table Box */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, border: '1px solid rgba(13,148,136,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Items List</h3>
              <button
                type="button"
                onClick={handleAddItem}
                style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', color: '#0D9488', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> Add Item Row
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F0FDFA', borderBottom: '1px solid rgba(13,148,136,0.2)', color: '#0D9488', fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  <th style={{ padding: 12 }}>Description</th>
                  <th style={{ padding: 12, width: 100 }}>Qty</th>
                  <th style={{ padding: 12, width: 140 }}>Price (₹)</th>
                  <th style={{ padding: 12, width: 140 }}>Total (₹)</th>
                  <th style={{ padding: 12, width: 50 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(13,148,136,0.1)' }}>
                    <td style={{ padding: 8 }}>
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={e => handleItemChange(idx, 'price', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: 12, fontWeight: 700 }}>
                      ₹ {(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString()}
                    </td>
                    <td style={{ padding: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(13,148,136,0.2)', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              Subtotal Amount: <span style={{ color: '#16a34a', marginLeft: 12 }}>₹ {calculateSubtotal().toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <button
              type="button"
              onClick={onBack}
              style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#F8FAFC', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', backgroundColor: '#0D9488', color: '#FFF', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
            >
              🧾 Save &amp; Print Customer Bill
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
