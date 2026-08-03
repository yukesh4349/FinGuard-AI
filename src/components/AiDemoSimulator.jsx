import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

const samplePrompts = [
  {
    id: 1,
    label: '📈 Predict Cash Runway',
    query: 'Analyze current accounts receivable and pending vendor obligations to project 30-day liquidity.',
    response: {
      status: 'Verified',
      runway: '42 Days',
      projectedInflow: '$24,850',
      projectedOutflow: '$16,200',
      advice: 'Based on 14 pending invoice schedules and historic settlement velocity, net cash projection remains positive (+$8,650). Recommend scheduling Supplier A disbursement for Aug 18th to preserve operating liquidity.',
    },
  },
  {
    id: 2,
    label: '🛒 Vendor Price Match',
    query: 'Evaluate component price benchmarks across registered suppliers for Item #402.',
    response: {
      status: 'Optimization Match',
      bestVendor: 'Apex Industrial Corp',
      savings: '14.2% Rate Differential',
      advice: 'Apex Industrial offers $42/unit versus current rate of $49/unit from incumbent supplier. Executing next batch purchase order through Apex yields a $1,400 cost reduction.',
    },
  },
  {
    id: 3,
    label: '🛡️ Audit Trail Governance',
    query: "Run an automated audit on today's uploaded expense ledgers for anomalies or duplicate bills.",
    response: {
      status: '1 Anomaly Flagged',
      flaggedInvoice: '#INV-8092 ($480.00)',
      advice: 'Duplicate receipt detected: Identical submission matching prior upload from July 28th. Transaction status set to Pending Review.',
    },
  },
  {
    id: 4,
    label: '📊 GST Compliance Audit',
    query: 'Generate GSTR-3B monthly tax ledger reconciliation summary.',
    response: {
      status: 'Audit Ready',
      taxLiability: '$3,420.00',
      inputTaxCredit: '$1,850.00',
      advice: 'All 86 input tax invoices successfully verified through OCR microservice engine. Tax audit statement prepared for automated export.',
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
      id="ai-advisor"
      style={{
        padding: '80px 40px',
        backgroundColor: '#F5F0EB',
        borderTop: '1px solid rgba(30,27,24,0.08)',
        borderBottom: '1px solid rgba(30,27,24,0.08)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="mono-badge" style={{ marginBottom: 14, display: 'inline-flex' }}>
            <Sparkles size={14} color="#A88660" />
            Gemini LLM Business Advisory
          </div>
          <h2 style={{
            color: '#1E1B18', fontSize: 'clamp(26px, 3.5vw, 36px)',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12,
          }}>
            Conversational Financial Intelligence
          </h2>
          <p style={{ color: '#6E675F', fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
            Query real-time enterprise ledgers using natural language for immediate strategic recommendations.
          </p>
        </div>

        {/* Terminal */}
        <div
          className="reveal reveal-delay-1"
          style={{
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(212,184,150,0.6)',
            boxShadow: '0 12px 40px rgba(30,27,24,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Terminal top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#F5F0EB',
            borderBottom: '1px solid rgba(30,27,24,0.08)',
          }}>
            {/* Window dots */}
            <div style={{ display: 'flex', gap: 8 }}>
              {['#D4B896', '#C88D74', '#5C705E'].map((c) => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: c }} />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} color="#A88660" />
              <span style={{ color: '#1E1B18', fontSize: 13, fontWeight: 700 }}>
                FinGuard Advisory Terminal v2.4
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#5C705E' }} />
              <span style={{ color: '#5C705E', fontSize: 12, fontWeight: 700 }}>Gemini LLM Active</span>
            </div>
          </div>

          {/* Terminal body */}
          <div style={{ padding: 24 }}>
            {/* Prompt chips */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
              marginBottom: 20, paddingBottom: 16,
              borderBottom: '1px solid rgba(30,27,24,0.06)',
            }}>
              <span style={{ color: '#6E675F', fontSize: 13, fontWeight: 600, marginRight: 4 }}>
                Sample Scenarios:
              </span>
              {samplePrompts.map((p) => {
                const isActive = selectedPrompt.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPrompt(p)}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      backgroundColor: isActive ? '#F2E8DC' : '#FAF8F5',
                      border: `1px solid ${isActive ? '#A88660' : 'rgba(30,27,24,0.1)'}`,
                      cursor: 'pointer', fontFamily: 'inherit',
                      color: isActive ? '#1E1B18' : '#4A443E',
                      fontSize: 13, fontWeight: isActive ? 700 : 600,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(212,184,150,0.6)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(30,27,24,0.1)'; }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Chat area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* User bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '75%', padding: 14, borderRadius: 14,
                  backgroundColor: '#1E1B18',
                }}>
                  <p style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 1.5, fontWeight: 600, margin: 0 }}>
                    {selectedPrompt.query}
                  </p>
                </div>
              </div>

              {/* AI bubble */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  backgroundColor: '#A88660',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={18} color="#FFFFFF" />
                </div>
                <div style={{
                  flex: 1, padding: 18, borderRadius: 14,
                  backgroundColor: '#FAF8F5',
                  border: '1px solid rgba(30,27,24,0.08)',
                  transition: 'opacity 0.3s ease',
                  opacity: isSimulating ? 0.5 : 1,
                }}>
                  {isSimulating ? (
                    <p style={{ color: '#6E675F', fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                      Analyzing microservice ledgers...
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          color: '#5C705E', backgroundColor: 'rgba(92,112,94,0.12)',
                        }}>
                          <CheckCircle2 size={13} color="#5C705E" />
                          {selectedPrompt.response.status}
                        </span>
                        {selectedPrompt.response.runway && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#4A443E' }}>
                            Runway: {selectedPrompt.response.runway}
                          </span>
                        )}
                        {selectedPrompt.response.savings && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#A88660' }}>
                            {selectedPrompt.response.savings}
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#1E1B18', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                        {selectedPrompt.response.advice}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
