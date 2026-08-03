import React, { useState } from 'react';
import {
  Briefcase, Calculator, Users, Store, ShieldCheck,
  Check, ArrowRight, Lock, KeyRound
} from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

const rolesData = [
  {
    id: 'owner', title: 'Business Owner', icon: Briefcase, color: '#0D9488',
    badge: 'Executive Governance',
    description: 'Real-time 360° financial visibility, predictive inventory warnings, high-level cash runway forecasts, and strategic purchase approvals.',
    features: [
      'Real-Time Profitability & Cash Flow Overview',
      'Inventory Alerting & Reorder Intelligence',
      'Streamlined Multi-Level Expense Approvals',
      'FinGuard AI Strategic Business Advisor',
    ],
  },
  {
    id: 'accountant', title: 'Accountant / CA', icon: Calculator, color: '#0284C7',
    badge: 'Financial & Ledger Role',
    description: 'Instant OCR receipt extraction, duplicate invoice prevention, automated GST compliance filings, and audit-ready P&L reports.',
    features: [
      'High-Speed OCR Invoice & Receipt Parsing',
      'Automated GST & Tax Audit Schedules',
      'Automated Bank & Transaction Reconciliation',
      'Multi-Channel Payment & Due Date Reminders',
    ],
  },
  {
    id: 'employee', title: 'Operations & Staff', icon: Users, color: '#0D9488',
    badge: 'Scoped Staff Role',
    description: 'Simple mobile receipt capture, departmental expense categorization, and requisition tracking with strict RBAC boundary controls.',
    features: [
      'Mobile Instant Receipt Snap & Upload',
      'Department-Specific Expense Categorization',
      'Requisition & Purchase Order Tracking',
      'Restricted Access to Sensitive Balances',
    ],
  },
  {
    id: 'store_manager', title: 'Store Manager', icon: Store, color: '#0F172A',
    badge: 'Store Operations Role',
    description: 'Real-time inventory level tracking, low-stock reorder triggers, best-price vendor matching, and daily sales register reconciliation.',
    features: [
      'Real-Time Stock Level & Low-Stock Alerts',
      'Supplier Price Comparison & Auto-Reordering',
      'Daily Counter Cash & Register Settlement',
      'Store Staff Attendance & Shift Scheduling',
    ],
  },
];

export default function RoleShowcase({ onOpenModal }) {
  const [activeTab, setActiveTab] = useState('owner');
  useScrollReveal();
  const activeRole = rolesData.find((r) => r.id === activeTab);

  return (
    <section
      id="roles"
      style={{
        padding: '80px 40px',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid rgba(13,148,136,0.12)',
        borderBottom: '1px solid rgba(13,148,136,0.12)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="mono-badge" style={{ marginBottom: 14, display: 'inline-flex' }}>
            <KeyRound size={14} color="#0D9488" />
            ROLE ACCESS GOVERNANCE
          </div>
          <h2 style={{
            color: '#0F172A', fontSize: 'clamp(26px, 3.5vw, 36px)',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12,
          }}>
            Tailored Interfaces for Every Store Role
          </h2>
          <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.55, maxWidth: 680, margin: '0 auto' }}>
            FinGuard AI enforces strict security boundaries while empowering Business Owners, Accountants, Staff, and Store Managers.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          {rolesData.map((role) => {
            const Icon = role.icon;
            const isSelected = activeTab === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 18px', borderRadius: 14,
                  backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                  border: `1px solid ${isSelected ? role.color : 'rgba(13,148,136,0.2)'}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: isSelected ? `0 4px 16px rgba(13,148,136,0.15)` : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)'; e.currentTarget.style.backgroundColor = '#F0FDFA'; } }}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.2)'; e.currentTarget.style.backgroundColor = '#FFFFFF'; } }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  backgroundColor: isSelected ? role.color : '#F0FDFA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.22s ease',
                }}>
                  <Icon size={16} color={isSelected ? '#FFFFFF' : '#0D9488'} />
                </div>
                <span style={{
                  fontSize: 14, fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? '#0F172A' : '#475569',
                  transition: 'all 0.2s ease',
                }}>{role.title}</span>
              </button>
            );
          })}
        </div>

        {/* Showcase card */}
        {activeRole && (
          <div
            className="gloss-card"
            key={activeRole.id}
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 36,
              padding: 36, borderRadius: 24,
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(13,148,136,0.2)',
              boxShadow: '0 12px 40px rgba(13,148,136,0.08)',
            }}
          >
            {/* Left */}
            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                  color: activeRole.color,
                  border: `1px solid ${activeRole.color}`,
                  backgroundColor: '#F0FDFA',
                }}>{activeRole.badge}</span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                  color: '#0D9488',
                  backgroundColor: '#F0FDFA',
                  border: '1px solid rgba(13,148,136,0.3)',
                }}>
                  <Lock size={11} color="#0D9488" /> Secured Access
                </span>
              </div>

              <h3 style={{ color: '#0F172A', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
                {activeRole.title} Workspace
              </h3>
              <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                {activeRole.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {activeRole.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 10,
                      backgroundColor: activeRole.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Check size={12} color="#FFFFFF" />
                    </div>
                    <span style={{ color: '#0F172A', fontSize: 14, fontWeight: 600 }}>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onOpenModal && onOpenModal('login')}
                className="liquid-btn liquid-btn-secondary"
                style={{ alignSelf: 'flex-start', fontSize: 14, padding: '10px 18px', borderRadius: 10 }}
              >
                <span>Explore {activeRole.title} Workflow</span>
                <ArrowRight size={14} color="#0F172A" />
              </button>
            </div>

            {/* Right — visual placeholder */}
            <div style={{ flex: '1 1 320px', minHeight: 320 }}>
              <div style={{
                width: '100%', height: '100%', minHeight: 320,
                borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(13,148,136,0.3)',
                boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
                background: `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', padding: 28,
              }}>
                {/* Fake UI representation */}
                <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: activeRole.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {React.createElement(activeRole.icon, { size: 28, color: '#FFFFFF' })}
                </div>
                <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>{activeRole.title} Interface</div>
                <div style={{ color: '#CCFBF1', fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 20 }}>FinGuard Engine</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {activeRole.features.slice(0, 3).map((f, i) => (
                    <span key={i} style={{ background: 'rgba(13,148,136,0.2)', color: '#CCFBF1', fontSize: 9, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid rgba(13,148,136,0.3)', textAlign: 'center' }}>
                      {f.split(' ').slice(0, 3).join(' ')}
                    </span>
                  ))}
                </div>

                {/* Bottom badge */}
                <div style={{
                  position: 'absolute', bottom: 16, left: 16,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  padding: '8px 14px', borderRadius: 10,
                  border: '1px solid rgba(13,148,136,0.2)',
                }}>
                  <div style={{ color: '#0F172A', fontSize: 12, fontWeight: 700 }}>{activeRole.title} Interface</div>
                  <div style={{ color: '#475569', fontSize: 10 }}>FinGuard Governance Engine</div>
                </div>

                {/* Gloss overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
