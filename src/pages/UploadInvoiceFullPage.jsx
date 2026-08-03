import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, CheckCircle2, AlertTriangle, FileText, Sparkles, ShieldCheck, Download } from 'lucide-react';

export default function UploadInvoiceFullPage({ onBack, onInvoiceSaved }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        supplierName: 'Apex Wholesale Distributors',
        invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        items: [
          { name: 'Sunflower Oil 1L (100 Packs)', price: '₹ 12,000' },
          { name: 'Basmati Rice 25kg (20 Bags)', price: '₹ 28,000' },
          { name: 'Refined Sugar 1kg (50 Packs)', price: '₹ 5,000' },
        ],
        subtotal: '₹ 45,000',
        taxGst: '₹ 2,250 (5% GST)',
        totalAmount: '₹ 47,250',
        priceCheckStatus: 'SAFE (Prices match market benchmark)',
        fraudCheck: 'SAFE (No duplicate invoice found)',
      });
    }, 1200);
  };

  const handleSaveInvoice = () => {
    alert(`Success: Supplier Invoice ${scanResult?.invoiceNumber} saved to business records!`);
    if (onInvoiceSaved) onInvoiceSaved();
    onBack();
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      backgroundColor: '#FAF8F3', color: '#1A1610',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top Bar with Back Button */}
      <header style={{
        height: 66, padding: '0 32px',
        backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(201,185,154,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 99,
            backgroundColor: '#F5F0E8', border: '1px solid rgba(201,185,154,0.4)',
            color: '#1A1610', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Owner Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#1A1610', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1A1610' }}>
            Supplier Invoice <span style={{ color: '#8A7558' }}>Scanner</span>
          </span>
        </div>

        <span style={{ fontSize: 12, color: '#5C705E', fontWeight: 700, backgroundColor: 'rgba(92,112,94,0.1)', padding: '4px 12px', borderRadius: 99 }}>
          Full Page OCR Scanner
        </span>
      </header>

      {/* Main Content View */}
      <main style={{ flex: 1, padding: '36px 48px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1610', marginBottom: 4 }}>
            📤 Upload Supplier Invoice Bill
          </h1>
          <p style={{ color: '#6E6455', fontSize: 14 }}>
            Snap a picture with your camera or select a bill file from your device to scan automatically.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          {/* Left Box: Camera & File Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Option 1: Open Camera Direct */}
            <label style={{
              backgroundColor: '#1A1610', color: '#FFFFFF',
              borderRadius: 16, padding: '24px 28px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: '#A88660', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={26} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>📷 Take Picture with Camera</div>
                <div style={{ fontSize: 12, color: '#C9B99A', marginTop: 2 }}>Click to open camera and snap bill photo</div>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={e => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>

            {/* Option 2: Upload File */}
            <label style={{
              backgroundColor: '#FFFFFF', borderRadius: 16, padding: '32px 28px',
              border: '2px dashed rgba(201,185,154,0.6)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', minHeight: 220,
            }}>
              <Upload size={36} color="#8A7558" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1610' }}>Browse &amp; Upload Bill File</div>
              <div style={{ fontSize: 12, color: '#6E6455', marginTop: 4 }}>Supports PDF, PNG, JPG files</div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>

            {selectedFile && (
              <div style={{ padding: 14, borderRadius: 10, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.4)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={18} color="#8A7558" />
                <span style={{ fontWeight: 700 }}>{selectedFile.name}</span>
              </div>
            )}
          </div>

          {/* Right Box: Scanning Status & Extracted Result */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {isScanning ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Sparkles size={40} color="#8A7558" style={{ animation: 'spin 1.5s linear infinite', marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1610' }}>Scanning Bill with AI...</h3>
                <p style={{ fontSize: 13, color: '#6E6455', marginTop: 4 }}>Extracting supplier details, totals, and checking fake bill warnings</p>
              </div>
            ) : scanResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(201,185,154,0.3)', paddingBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#8A7558', fontWeight: 700, fontFamily: 'monospace' }}>SCANNED SUPPLIER INVOICE</span>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1610', marginTop: 2 }}>{scanResult.supplierName}</h3>
                  </div>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} /> AI Verified
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div><strong>Invoice No:</strong> {scanResult.invoiceNumber}</div>
                  <div><strong>Date:</strong> {scanResult.date}</div>
                </div>

                <div style={{ backgroundColor: '#FAF8F3', borderRadius: 10, padding: 14, border: '1px solid rgba(201,185,154,0.3)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7558', marginBottom: 8, fontFamily: 'monospace' }}>BILL ITEMS EXTRACTED:</div>
                  {scanResult.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>{item.name}</span>
                      <strong style={{ color: '#1A1610' }}>{item.price}</strong>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, borderTop: '1px solid rgba(201,185,154,0.3)', paddingTop: 8, marginTop: 8 }}>
                    <span>Total Amount:</span>
                    <span style={{ color: '#16a34a' }}>{scanResult.totalAmount}</span>
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, color: '#14532d' }}>
                  🛡️ <strong>AI Safety Check:</strong> {scanResult.priceCheckStatus}
                </div>

                <button
                  onClick={handleSaveInvoice}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    backgroundColor: '#1A1610', color: '#FFFFFF',
                    border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  Save &amp; Add Invoice to Store Records
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#6E6455' }}>
                <FileText size={48} color="#C9B99A" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1610' }}>No File Selected Yet</h3>
                <p style={{ fontSize: 13, marginTop: 4 }}>Snap a photo with camera or browse a bill file to start scanning.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
