import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

const samplePrompts = [
  {
    id: 1,
    label: '📈 Predict Cash Balance',
    query: 'Analyze current customer payments and upcoming shop bills for the next 30 days.',
    response: {
      status: 'Verified',
      runway: '42 Days Safe',
      projectedInflow: '₹ 2,45,000',
      projectedOutflow: '₹ 1,62,000',
      advice: 'Based on 14 pending bill schedules and store sales, your net profit projection remains positive (+₹ 83,000). We recommend paying Supplier A bills before Friday to save early payment discounts.',
    },
  },
  {
    id: 2,
    label: '🛒 Supplier Price Match',
    query: 'Compare cooking oil wholesale prices across registered suppliers.',
    response: {
      status: 'Optimization Match',
      bestVendor: 'Apex Wholesale Corp',
      savings: '14.2% Lower Price',
      advice: 'Apex Wholesale offers ₹ 390/unit versus current rate of ₹ 450/unit from your previous supplier. Buying next batch through Apex saves ₹ 4,500.',
    },
  },
  {
    id: 3,
    label: '🛡️ Fake & Duplicate Bill Check',
    query: "Run an instant security check on today's uploaded shop bills for duplicate or fake invoices.",
    response: {
      status: '1 Fake Bill Intercepted',
      flaggedInvoice: '#INV-8092 (₹ 14,200)',
      advice: 'Duplicate receipt detected: Identical submission matching bill paid 5 days ago. Transaction blocked by AI security.',
    },
  },
  {
    id: 4,
    label: '📊 GST Tax Calculation',
    query: 'Calculate estimated GST tax output and input credits for this month.',
    response: {
      status: 'Audit Ready',
      taxLiability: '₹ 48,200',
      inputTaxCredit: '₹ 32,150',
      advice: 'All 86 input tax invoices successfully verified by AI bill reader. Tax summary report ready for download.',
    },
  },
];

export default function AiDemoSimulator() {
  useScrollReveal();
  const [selectedPrompt, setSelectedPrompt] = useState(samplePrompts[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 600);
  };

  return (
    <section
      id="ai-demo"
      style={{
        padding: '96px 40px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="mono-badge" style={{ marginBottom: 14, display: 'inline-flex' }}>
            <Sparkles size={13} color="#9C8A6E" />
            24/7 AI CHAT ASSISTANT
          </div>
          <h2 style={{
            color: '#1A1610', fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 12,
          }}>
            Ask FinGuard AI Chatbot Anything
          </h2>
          <p style={{ color: '#6E6455', fontSize: 16, lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
            Click sample questions below to test how FinGuard AI analyzes your store finance in simple English.
          </p>
        </div>

        {/* Interactive layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, flexWrap: 'wrap' }}>

          {/* Left prompts list */}
          <div className="reveal reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {samplePrompts.map((prompt) => {
              const active = selectedPrompt.id === prompt.id;
              return (
                <button
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  style={{
                    padding: '16px 20px', borderRadius: 14, textAlign: 'left',
                    backgroundColor: active ? '#1A1610' : '#FAF8F3',
                    color: active ? '#FFFFFF' : '#1A1610',
                    border: `1px solid ${active ? '#1A1610' : 'rgba(201,185,154,0.4)'}`,
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 10px 24px rgba(26,22,16,0.15)' : 'none',
                  }}
                >
                  {prompt.label}
                </button>
              );
            })}
          </div>

          {/* Right simulated response card */}
          <div
            className="reveal reveal-delay-2 gloss-card"
            style={{
              padding: 32, borderRadius: 20,
              backgroundColor: '#1A1610', color: '#FFFFFF',
              border: '1px solid rgba(201,185,154,0.3)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: 340,
            }}
          >
            <div>
              {/* Question */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#A88660', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="#FFFFFF" />
                </div>
                <div style={{ fontSize: 12, color: '#C9B99A', fontFamily: 'monospace' }}>USER STORE QUERY</div>
              </div>

              <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', marginBottom: 24, fontStyle: 'italic' }}>
                "{selectedPrompt.query}"
              </p>

              {/* AI Response Output */}
              <div style={{ padding: 20, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#C9B99A', fontWeight: 800, fontFamily: 'monospace' }}>FINGUARD AI ANALYSIS</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, backgroundColor: 'rgba(74,222,128,0.2)', color: '#4ade80', fontWeight: 700 }}>
                    ✓ {selectedPrompt.response.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12, fontSize: 13 }}>
                  <div><strong>Inflow / Savings:</strong> <span style={{ color: '#4ade80' }}>{selectedPrompt.response.projectedInflow || selectedPrompt.response.savings}</span></div>
                  <div><strong>Outflow / Flagged:</strong> <span style={{ color: '#F59E0B' }}>{selectedPrompt.response.projectedOutflow || selectedPrompt.response.flaggedInvoice || selectedPrompt.response.taxLiability}</span></div>
                </div>

                <p style={{ fontSize: 13, color: '#E5DCCB', lineHeight: 1.5 }}>
                  {selectedPrompt.response.advice}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#C9B99A', marginTop: 20 }}>
              <Sparkles size={12} color="#C9B99A" /> 24/7 AI Chat Helper Active
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
