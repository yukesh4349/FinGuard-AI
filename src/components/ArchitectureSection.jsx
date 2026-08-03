import React from 'react';
import { Layers, Database, Shield, Zap, Server, Cpu, MessageSquare, Lock, Activity } from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

const microservices = [
  { name: 'User & Staff Service', desc: 'Easy Permissions & Staff Roles', icon: Lock },
  { name: 'Invoice & Payment Service', desc: 'Bill Reader & Due Date Tracking', icon: Server },
  { name: 'Transaction Service', desc: 'Real-Time Money Ledger', icon: Activity },
  { name: 'Inventory & Stock Service', desc: 'Stock Alerts & Low Item Warning', icon: Layers },
  { name: 'AI Forecast Service', desc: 'Smart Sales & Profit Forecasting', icon: Cpu },
  { name: 'Vendor Management Service', desc: 'Lowest Price Supplier Matcher', icon: Server },
  { name: 'Purchase Orders Service', desc: 'Easy Buying Order Manager', icon: Server },
  { name: 'Fraud Shield Service', desc: 'Fake & Duplicate Bill Blocker', icon: Shield },
  { name: 'GST Tax Service', desc: 'Simple GST Filing Reports', icon: Server },
  { name: 'AI Chatbot Helper', desc: 'Simple English Business Helper', icon: Cpu },
  { name: 'Notification Service', desc: 'WhatsApp & SMS Alerts', icon: MessageSquare },
  { name: 'Audit Log Service', desc: 'History of Store Activity', icon: Database },
];

const storageItems = [
  { icon: Database, color: '#5C705E', name: 'PostgreSQL Database', desc: 'Stores Users, Bills, & Stock safely' },
  { icon: Server, color: '#A88660', name: 'Cloud File Vault', desc: 'Stores Scanned Bills & Receipts' },
  { icon: Zap, color: '#C88D74', name: 'Fast Memory Cache', desc: 'Instant Search & High Speed' },
  { icon: Shield, color: '#38332E', name: 'Automatic Backups', desc: 'Daily Backup & Safe Security' },
];

export default function ArchitectureSection() {
  useScrollReveal();

  return (
    <section
      id="architecture"
      style={{
        padding: '80px 40px',
        backgroundColor: '#F5F0EB',
        borderTop: '1px solid rgba(30,27,24,0.08)',
        borderBottom: '1px solid rgba(30,27,24,0.08)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="mono-badge" style={{ marginBottom: 14, display: 'inline-flex' }}>
            <Server size={14} color="#A88660" />
            Simple App Structure
          </div>
          <h2 style={{
            color: '#1E1B18', fontSize: 'clamp(26px, 3.5vw, 38px)',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12,
          }}>
            How FinGuard AI Works
          </h2>
          <p style={{ color: '#6E675F', fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
            Built with instant real-time data sync, secure PostgreSQL database, and 24/7 AI chat protection.
          </p>
        </div>

        {/* Architecture box */}
        <div
          className="reveal reveal-delay-1"
          style={{
            borderRadius: 24, backgroundColor: '#FFFFFF',
            border: '1px solid rgba(30,27,24,0.08)',
            padding: 32,
            boxShadow: '0 12px 32px rgba(30,27,24,0.05)',
            display: 'flex', flexDirection: 'column', gap: 24,
          }}
        >
          {/* Gateway layer */}
          <div style={{
            padding: 20, borderRadius: 16, textAlign: 'center',
            backgroundColor: '#F2E8DC',
            border: '1px solid rgba(212,184,150,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={18} color="#A88660" />
              <span style={{ color: '#1E1B18', fontSize: 18, fontWeight: 800 }}>FinGuard AI Core Gateway</span>
            </div>
            <p style={{ color: '#4A443E', fontSize: 13, margin: 0 }}>
              Fast Routing • Password Security • Encrypted Data • Anti-Fraud Protection
            </p>
          </div>

          {/* Real-time bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: 12, borderRadius: 12,
            backgroundColor: 'rgba(92,112,94,0.12)',
            border: '1px solid rgba(92,112,94,0.3)',
          }}>
            <Activity size={16} color="#5C705E" />
            <span style={{ color: '#5C705E', fontSize: 14, fontWeight: 700 }}>
              Real-Time Instant Data Sync &amp; Automatic Alerts
            </span>
          </div>

          {/* Microservices grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {microservices.map((ms, idx) => {
              const Icon = ms.icon;
              return (
                <div
                  key={idx}
                  style={{
                    flex: '1 1 250px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 14, borderRadius: 12,
                    backgroundColor: '#FAF8F5',
                    border: '1px solid rgba(30,27,24,0.08)',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(212,184,150,0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(30,27,24,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    backgroundColor: '#F2E8DC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color="#A88660" />
                  </div>
                  <div>
                    <div style={{ color: '#1E1B18', fontSize: 13, fontWeight: 700 }}>{ms.name}</div>
                    <div style={{ color: '#6E675F', fontSize: 11, marginTop: 1 }}>{ms.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Storage layer */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 16,
            paddingTop: 16, borderTop: '1px solid rgba(30,27,24,0.08)',
          }}>
            {storageItems.map(({ icon: Icon, color, name, desc }) => (
              <div
                key={name}
                style={{
                  flex: '1 1 220px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: 16, borderRadius: 14, textAlign: 'center',
                  backgroundColor: '#FAF8F5',
                  border: '1px solid rgba(30,27,24,0.08)',
                }}
              >
                <Icon size={18} color={color} style={{ marginBottom: 6 }} />
                <div style={{ color: '#1E1B18', fontSize: 14, fontWeight: 700 }}>{name}</div>
                <div style={{ color: '#6E675F', fontSize: 11, marginTop: 3 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
