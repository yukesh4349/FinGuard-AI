import React, { useState } from 'react';
import {
  X, Briefcase, Calculator, Users, Store, ShieldCheck,
  Lock, ArrowRight, ArrowLeft, CheckCircle2, KeyRound, Sparkles, LogIn
} from 'lucide-react';

const rolesList = [
  {
    id: 'owner',
    title: 'Business Owner',
    subtitle: 'Executive Governance & Cash Flow',
    icon: Briefcase,
    color: '#A88660',
    badge: 'FULL ACCESS',
    demoEmail: 'owner@metrosuperstore.com',
    permissions: ['Cash Flow & Profitability Overview', 'Inventory Alerting & Approval Rights', '24/7 Gemini Strategic Advisor'],
  },
  {
    id: 'accountant',
    title: 'Accountant / CA',
    subtitle: 'Automated Ledger & GST Filings',
    icon: Calculator,
    color: '#5C705E',
    badge: 'FINANCIAL ROLE',
    demoEmail: 'accountant@metrosuperstore.com',
    permissions: ['Instant OCR Receipt & Bill Parsing', 'Automated GST (GSTR-1 & 3B) Schedules', 'Bank Reconciliation Ledger'],
  },
  {
    id: 'employee',
    title: 'Operations & Staff',
    subtitle: 'Receipt Snap & Requisitions',
    icon: Users,
    color: '#C88D74',
    badge: 'SCOPED ROLE',
    demoEmail: 'staff.ops@metrosuperstore.com',
    permissions: ['Mobile Receipt Snap & Expense Claim', 'Department Categorization', 'Restricted to Private Balances'],
  },
  {
    id: 'vendor',
    title: 'Vendor / Supplier',
    subtitle: 'B2B Procurement & PO Portal',
    icon: Store,
    color: '#A88660',
    badge: 'EXTERNAL PORTAL',
    demoEmail: 'supplier@apexindustrial.com',
    permissions: ['Quotation Submission & Rates Match', 'Purchase Order Confirmation', 'Real-Time Payment Tracking'],
  },
  {
    id: 'auditor',
    title: 'Admin & Auditor',
    subtitle: 'Security Policy & Audit Trail',
    icon: ShieldCheck,
    color: '#38332E',
    badge: 'GOVERNANCE ROLE',
    demoEmail: 'auditor@finguard.ai',
    permissions: ['Immutable User Activity Audit Log', 'RBAC Boundary Enforcement', 'AI Anomaly Detection Screening'],
  },
];

export default function LoginModal({ isOpen, onClose }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(role.demoEmail);
    setPassword('••••••••••••');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsSuccess(true);
    }, 800);
  };

  const handleReset = () => {
    setSelectedRole(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(26, 22, 16, 0.68)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.25s ease both',
    }}>
      <div className="gloss-card" style={{
        width: '100%', maxWidth: 580,
        maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        border: '1px solid rgba(201,185,154,0.4)',
        boxShadow: '0 24px 60px rgba(26,22,16,0.22)',
        padding: 36,
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#F5F0E8', border: '1px solid rgba(201,185,154,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#1A1610',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EDE4D5'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F5F0E8'}
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: 'rgba(74,222,128,0.15)', border: '2px solid #4ade80',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={36} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1610', marginBottom: 8 }}>
              Authenticated as {selectedRole.title}!
            </h2>
            <p style={{ color: '#6E6455', fontSize: 14, marginBottom: 24 }}>
              Redirecting to <strong>{selectedRole.title} Workspace</strong>...
            </p>

            <div style={{
              backgroundColor: '#FAF8F3', borderRadius: 14, padding: 18,
              border: '1px solid rgba(201,185,154,0.4)', textAlign: 'left',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7558', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 8 }}>
                SESSION AUTHORIZATION GRANTED
              </div>
              <div style={{ fontSize: 13, color: '#1A1610', fontWeight: 700 }}>{email}</div>
              <div style={{ fontSize: 12, color: '#6E6455', marginTop: 2 }}>Role Scope: {selectedRole.badge}</div>
            </div>

            <button
              onClick={handleReset}
              className="liquid-btn liquid-btn-primary"
              style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, justifyContent: 'center' }}
            >
              <span>Enter Workspace Dashboard</span>
              <ArrowRight size={16} color="#FFFFFF" />
            </button>
          </div>
        ) : !selectedRole ? (
          /* STEP 1: ROLE SELECTION BUTTONS ONLY */
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <div className="mono-badge" style={{ marginBottom: 12, display: 'inline-flex' }}>
                <KeyRound size={13} color="#6E5D44" />
                ROLE-BASED WORKSPACE ACCESS
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1610', marginBottom: 6 }}>
                Select Your Role to Log In
              </h2>
              <p style={{ color: '#6E6455', fontSize: 14 }}>
                Choose your enterprise role to open the specialized login terminal.
              </p>
            </div>

            {/* Role Buttons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rolesList.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: 16, borderRadius: 16,
                      backgroundColor: '#FAF8F3',
                      border: '1px solid rgba(201,185,154,0.45)',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      boxShadow: '0 2px 8px rgba(26,22,16,0.03)',
                      transition: 'all 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#F5EFE4';
                      e.currentTarget.style.borderColor = role.color;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#FAF8F3';
                      e.currentTarget.style.borderColor = 'rgba(201,185,154,0.45)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      backgroundColor: role.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={20} color="#FFFFFF" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1610' }}>{role.title}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                          backgroundColor: 'rgba(201,185,154,0.3)', color: '#6E5D44',
                          fontFamily: 'monospace', textTransform: 'uppercase',
                        }}>{role.badge}</span>
                      </div>
                      <span style={{ fontSize: 13, color: '#6E6455', marginTop: 2, display: 'block' }}>
                        {role.subtitle}
                      </span>
                    </div>

                    <ArrowRight size={18} color="#6E5D44" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* STEP 2: ROLE-SPECIFIC LOGIN TERMINAL */
          <div>
            <button
              onClick={() => setSelectedRole(null)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.4)',
                fontSize: 12, fontWeight: 700, color: '#1A1610', cursor: 'pointer',
                marginBottom: 20, fontFamily: 'inherit',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Role Selection</span>
            </button>

            {/* Selected Role Header Card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 16, borderRadius: 16,
              backgroundColor: '#FAF8F3',
              border: `1px solid ${selectedRole.color}`,
              marginBottom: 24,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                backgroundColor: selectedRole.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {React.createElement(selectedRole.icon, { size: 20, color: '#FFFFFF' })}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1610' }}>
                  {selectedRole.title} Login
                </div>
                <div style={{ fontSize: 12, color: '#6E6455', marginTop: 2 }}>
                  {selectedRole.subtitle}
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 9px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                color: '#5C705E', backgroundColor: 'rgba(92,112,94,0.12)',
              }}>
                <Lock size={11} color="#5C705E" /> RBAC Enforced
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                  Work Email / Workspace Username
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={selectedRole.demoEmail}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FAF8F3',
                    fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FAF8F3',
                    fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Scoped Permissions Preview */}
              <div style={{
                backgroundColor: '#FAF8F3', borderRadius: 12, padding: 14,
                border: '1px solid rgba(201,185,154,0.3)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7558', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 6 }}>
                  {selectedRole.title} Scoped Permissions:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedRole.permissions.map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#6E6455', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="liquid-btn liquid-btn-primary"
                  style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, justifyContent: 'center' }}
                >
                  <LogIn size={16} color="#FFFFFF" />
                  <span>{isLoggingIn ? 'Authenticating...' : `Log In to ${selectedRole.title} Workspace`}</span>
                  <ArrowRight size={16} color="#FFFFFF" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSuccess(true)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.4)',
                    color: '#6E5D44', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontFamily: 'inherit',
                  }}
                >
                  <Sparkles size={13} color="#6E5D44" />
                  <span>⚡ Quick Demo Log In as {selectedRole.title}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
