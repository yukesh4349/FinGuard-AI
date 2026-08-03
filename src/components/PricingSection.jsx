import React from 'react';
import { Check, ArrowRight, LogIn, UserPlus, Zap, Sparkles } from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

const options = [
  {
    id: 'standard',
    name: 'FinGuard Business Account',
    sub: 'For small stores, retail shops, and growing business ledgers',
    badge: 'QUICK START',
    features: [
      'Instant OCR Invoice & Receipt Scanning',
      'AI Fraud & Duplicate Bill Screening Engine',
      'Automated GST Filing Statements (GSTR-1 & 3B)',
      'Role-Based Permissions (Owners & Accountants)',
      'Multi-Channel WhatsApp & Email Reminders',
      'Encrypted Cloud Ledger Backup',
    ],
    buttonText: 'Create FinGuard Account',
    icon: UserPlus,
    primary: false,
  },
  {
    id: 'enterprise',
    name: 'FinGuard Workspace Access',
    sub: 'For existing teams, accountants, admins, and multi-branch managers',
    badge: 'EXISTING MEMBERS',
    features: [
      'Log In to Your FinGuard Workspace',
      'Access 24/7 Gemini LLM Advisory Terminal',
      'View Real-Time Demand & Stock Forecasts',
      'Manage Low-Cost Supplier Purchase Orders',
      'Full Role-Based Access Control (RBAC)',
      'Kafka Real-Time Event Stream Log',
    ],
    buttonText: 'Log In to Workspace',
    icon: LogIn,
    primary: true,
  },
];

export default function PricingSection({ onOpenModal }) {
  useScrollReveal();

  return (
    <section
      id="pricing"
      style={{
        padding: '96px 40px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="mono-badge" style={{ marginBottom: 14, display: 'inline-flex' }}>
            <Zap size={13} color="#9C8A6E" />
            GET STARTED IN MINUTES
          </div>
          <h2 style={{
            color: '#1A1610', fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 12,
          }}>
            Set Up FinGuard for Your Business
          </h2>
          <p style={{ color: '#6E6455', fontSize: 16, lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
            Create a new account for your store or log in directly to your existing team workspace.
          </p>
        </div>

        {/* Cards row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center' }}>
          {options.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                className={`reveal gloss-card ${i === 0 ? 'reveal-delay-1' : 'reveal-delay-2'}`}
                style={{
                  flex: '1 1 320px',
                  maxWidth: 540,
                  padding: 36,
                  borderRadius: 22,
                  background: opt.primary ? '#1A1610' : '#FAF8F3',
                  border: `1px solid ${opt.primary ? '#1A1610' : 'rgba(26,22,16,0.07)'}`,
                  boxShadow: opt.primary ? '0 20px 50px rgba(26,22,16,0.20)' : '0 4px 20px rgba(26,22,16,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease',
                }}
              >
                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 12px', borderRadius: 99, alignSelf: 'flex-start',
                  marginBottom: 16,
                  backgroundColor: opt.primary ? 'rgba(255,255,255,0.12)' : '#F5F0E8',
                  border: `1px solid ${opt.primary ? 'rgba(255,255,255,0.2)' : 'rgba(201,185,154,0.4)'}`,
                }}>
                  <Sparkles size={11} color={opt.primary ? '#FFFFFF' : '#9C8A6E'} />
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em',
                    color: opt.primary ? '#FFFFFF' : '#9C8A6E',
                  }}>{opt.badge}</span>
                </div>

                {/* Accent bar */}
                <div style={{
                  height: 2, borderRadius: 99, marginBottom: 20,
                  backgroundColor: opt.primary ? 'rgba(255,255,255,0.15)' : 'rgba(201,185,154,0.4)',
                }} />

                <h3 style={{
                  fontSize: 24, fontWeight: 800, marginBottom: 6,
                  color: opt.primary ? '#FFFFFF' : '#1A1610',
                }}>{opt.name}</h3>
                <p style={{
                  fontSize: 14, lineHeight: 1.55, marginBottom: 28,
                  color: opt.primary ? 'rgba(255,255,255,0.6)' : '#6E6455',
                }}>{opt.sub}</p>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32, flex: 1 }}>
                  {opt.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                        backgroundColor: opt.primary ? 'rgba(255,255,255,0.22)' : '#C9B99A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check size={11} color="#FFFFFF" />
                      </div>
                      <span style={{
                        fontSize: 14, fontWeight: 500,
                        color: opt.primary ? 'rgba(255,255,255,0.85)' : '#1A1610',
                      }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <button
                  onClick={() => onOpenModal && onOpenModal(opt.id === 'enterprise' ? 'login' : 'setup')}
                  className={`liquid-btn ${opt.primary ? 'liquid-btn-secondary' : 'liquid-btn-primary'}`}
                  style={{
                    width: '100%', fontSize: 15, padding: '14px 20px', borderRadius: 12,
                    justifyContent: 'center',
                    ...(opt.primary
                      ? { background: '#FFFFFF', color: '#1A1610', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }
                      : {}),
                  }}
                >
                  <Icon size={15} color={opt.primary ? '#1A1610' : '#FFFFFF'} />
                  <span style={{ color: opt.primary ? '#1A1610' : '#FFFFFF', fontWeight: 700 }}>{opt.buttonText}</span>
                  <ArrowRight size={15} color={opt.primary ? '#1A1610' : '#FFFFFF'} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
