import React, { useState, useEffect, useRef } from 'react';
import { ScanText, ShieldAlert, TrendingUp, ShoppingBag, Bot, FileText, ArrowUpRight, Zap } from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

const featuresList = [
  {
    id: 1, icon: ScanText, title: 'Smart OCR Invoice & Auto-Reconciliation',
    category: 'Invoice Service', tag: 'OCR Engine',
    desc: 'Extract line items, GSTIN numbers, supplier names, and totals from physical or digital receipts with high precision.',
    details: 'Automates matching with bank records and schedules due payment notifications.',
  },
  {
    id: 2, icon: ShieldAlert, title: 'AI Anomaly & Fraud Detection Shield',
    category: 'Security Service', tag: 'Risk Governance',
    desc: 'Real-time rule engine & ML anomaly detection to instantly flag duplicate bills, unauthorized claims, or vendor price inflation.',
    details: 'Blocks unverified disbursements before payments are dispatched.',
  },
  {
    id: 3, icon: TrendingUp, title: 'AI Demand & Stock Forecasting',
    category: 'Stock Service', tag: 'Predictive AI',
    desc: 'Predict inventory requirements based on historical order cadence, seasonal patterns, and supplier delivery windows.',
    details: 'Automates reorder recommendations to maintain continuous stock availability.',
  },
  {
    id: 4, icon: ShoppingBag, title: 'Vendor Cost Matching & PO Automation',
    category: 'Purchase Service', tag: 'Cost Management',
    desc: 'Compare wholesale component prices across registered suppliers to ensure competitive procurement rates.',
    details: 'Dispatches automated Purchase Orders directly to approved vendors.',
  },
  {
    id: 5, icon: Bot, title: 'Gemini LLM Business Advisory',
    category: 'AI Advisory Service', tag: 'Google Gemini AI',
    desc: 'Inquire in natural language regarding cash flow trajectories, tax strategies, and capital allocation recommendations.',
    details: 'Context-aware intelligence trained on real-time enterprise ledger data.',
  },
  {
    id: 6, icon: FileText, title: 'Automated GST Compliance & Reporting',
    category: 'Compliance Service', tag: 'Multi-Channel Alert',
    desc: 'Generate GSTR-1 and GSTR-3B tax audit summaries with multi-channel WhatsApp, Email, and SMS alert dispatch.',
    details: 'Export structured audit ledgers and P&L statements to PDF or Excel formats.',
  },
];

function FeatureCard({ feat, delayClass }) {
  const [hovered, setHovered] = useState(false);
  const Icon = feat.icon;

  return (
    <div
      className={`gloss-card reveal ${delayClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 320px',
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Animated top accent line */}
      <div style={{
        height: 2,
        borderRadius: 99,
        marginBottom: 20,
        background: hovered ? '#1A1610' : 'transparent',
        transition: 'background 0.35s ease',
        width: hovered ? '100%' : '0%',
      }} />

      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          backgroundColor: hovered ? '#EDE4D5' : '#F5F0E8',
          border: `1px solid ${hovered ? 'rgba(201,185,154,0.6)' : 'rgba(201,185,154,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s ease',
        }}>
          <Icon size={22} color={hovered ? '#1A1610' : '#9C8A6E'} />
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 8,
          backgroundColor: '#F5F0E8',
          border: '1px solid rgba(201,185,154,0.3)',
          fontSize: 10, fontWeight: 700, color: '#9C8A6E',
          fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>{feat.tag}</span>
      </div>

      <h3 style={{
        color: '#1A1610', fontSize: 18, fontWeight: 700,
        marginBottom: 10, lineHeight: 1.4,
        transition: 'color 0.2s ease',
      }}>{feat.title}</h3>
      <p style={{ color: '#6E6455', fontSize: 14, lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{feat.desc}</p>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: '1px solid rgba(26,22,16,0.06)',
      }}>
        <p style={{ color: '#9C8A6E', fontSize: 12, flex: 1, marginRight: 10, lineHeight: 1.5 }}>{feat.details}</p>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          backgroundColor: hovered ? '#1A1610' : '#F5F0E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s ease', flexShrink: 0,
        }}>
          <ArrowUpRight size={16} color={hovered ? '#FFFFFF' : '#9C8A6E'} />
        </div>
      </div>
    </div>
  );
}

const delayClasses = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5'];

export default function FeaturesGrid() {
  useScrollReveal();

  return (
    <section
      id="features"
      style={{
        padding: '96px 40px',
        backgroundColor: '#FAF8F3',
      }}
    >
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="mono-badge" style={{ marginBottom: 16, display: 'inline-flex' }}>
            <Zap size={13} color="#9C8A6E" />
            MICROSERVICE FINANCIAL PLATFORM
          </div>
          <h2 style={{
            color: '#1A1610', fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 14,
          }}>
            Core Financial Management Capabilities
          </h2>
          <p style={{ color: '#6E6455', fontSize: 16, lineHeight: 1.65, maxWidth: 600, margin: '0 auto 16px' }}>
            Designed for modern enterprises to streamline ledger operations, improve cost management, and safeguard liquidity.
          </p>
          {/* animated underline */}
          <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, transparent, #C9B99A, transparent)', borderRadius: 99, margin: '0 auto' }} />
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22 }}>
          {featuresList.map((feat, i) => (
            <FeatureCard key={feat.id} feat={feat} delayClass={delayClasses[i % delayClasses.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}
