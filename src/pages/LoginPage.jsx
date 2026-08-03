import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, UserCheck, ArrowLeft, Eye, EyeOff,
  CheckCircle2, Sparkles, Building2, ChevronRight, AlertCircle, Phone, Database
} from 'lucide-react';
import { authenticateUserInPostgres, getStoredUsers } from '../services/postgresDb';

const availableRoles = [
  {
    id: 'owner',
    title: 'Business Owner (You)',
    sub: 'Full owner access to graphs, stock, billing & employee details',
    icon: '👑',
    color: '#0D9488',
    badge: 'FULL ACCESS',
  },
  {
    id: 'accountant',
    title: 'Store Accountant / CA',
    sub: 'Manage GST filings, tax invoices, and profit/loss statements',
    icon: '📊',
    color: '#0284C7',
    badge: 'TAX & BILLS',
  },
  {
    id: 'manager',
    title: 'Store Executive / Staff',
    sub: 'Customer billing, daily sales entry, and stock updates',
    icon: '🛍️',
    color: '#0D9488',
    badge: 'BILLING & STOCK',
  },
];

export default function LoginPage({
  onBack,
  initialRole = null,
  initialOwnerId = '',
  initialOwnerPass = '',
  onNavigateToDashboard,
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [userId, setUserId] = useState(initialOwnerId || '');
  const [password, setPassword] = useState(initialOwnerPass || '');
  const [mobileNum, setMobileNum] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('Metro Superstore Ltd');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dbUsers, setDbUsers] = useState([]);

  useEffect(() => {
    setDbUsers(getStoredUsers());
  }, []);

  useEffect(() => {
    if (initialRole) {
      const match = availableRoles.find(r => r.id === initialRole);
      if (match) setSelectedRole(match);
    }
    if (initialOwnerId) setUserId(initialOwnerId);
    if (initialOwnerPass) setPassword(initialOwnerPass);
  }, [initialRole, initialOwnerId, initialOwnerPass]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role.id === 'owner') {
      if (!userId) setUserId(initialOwnerId || 'OWNER-METRO-8492');
      if (!password) setPassword(initialOwnerPass || 'FG-8924-XK9');
      if (!mobileNum) setMobileNum('9876543210');
    } else if (role.id === 'accountant') {
      setUserId('accountant@metrosuperstore.com');
      setPassword('FG-CA-2026');
      setMobileNum('9876523451');
    } else if (role.id === 'manager') {
      setUserId('manager.store1@metrosuperstore.com');
      setPassword('FG-MGR-552');
      setMobileNum('9876534562');
    }
  };

  const handleMobileChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNum(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMessage('');

    if (!mobileNum || mobileNum.length < 10) {
      setIsLoggingIn(false);
      setErrorMessage('Please enter your registered 10-digit mobile number.');
      return;
    }

    try {
      // Query PostgreSQL database service for authentication checking ID, Password, and Mobile Number strictly
      const result = await authenticateUserInPostgres(userId, password, mobileNum);
      
      setTimeout(() => {
        setIsLoggingIn(false);
        if (result.success) {
          setIsSuccess(true);
          if (result.user?.company_name) setCompanyName(result.user.company_name);
          if (onNavigateToDashboard) {
            onNavigateToDashboard(selectedRole ? selectedRole.id : 'owner', result.user?.company_name || companyName, userId || 'OWNER-USER');
          }
        } else {
          setErrorMessage(result.message || 'Invalid User ID, Password, or Mobile Number.');
        }
      }, 500);
    } catch (err) {
      setIsLoggingIn(false);
      setErrorMessage('Database connection error. Please try again.');
    }
  };

  const handleReset = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard(selectedRole ? selectedRole.id : 'owner', companyName, userId || 'OWNER-USER');
    } else {
      setSelectedRole(null);
      setIsSuccess(false);
      onBack();
    }
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex', flexDirection: 'column',
      color: '#0F172A', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* ── Top Header Navigation Bar ─────────────────────────────── */}
      <header style={{
        height: 66, padding: '0 32px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(13,148,136,0.2)',
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
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#CCFBF1'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F0FDFA'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Home</span>
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            backgroundColor: '#0D9488',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={18} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
            FinGuard <span style={{ color: '#0D9488' }}>AI</span>
          </span>
        </div>

        {/* PostgreSQL Indicator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0D9488', fontWeight: 700, backgroundColor: '#F0FDFA', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(13,148,136,0.3)' }}>
          <Database size={14} color="#0D9488" />
          <span>PostgreSQL Auth Active</span>
        </div>
      </header>

      {/* ── Main Content Area ─────── */}
      <main style={{
        flex: 1, display: 'grid', gridTemplateColumns: '440px 1fr',
        height: 'calc(100vh - 66px)', overflow: 'hidden',
        backgroundColor: '#F8FAFC',
      }}>
        {/* Left Side Visual Banner */}
        <div style={{
          backgroundColor: '#0F172A', color: '#FFFFFF',
          padding: '32px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
        }}>
          {/* Top Title Badge */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <span className="mono-badge" style={{ backgroundColor: 'rgba(13,148,136,0.2)', color: '#CCFBF1', border: '1px solid rgba(13,148,136,0.4)', marginBottom: 12, display: 'inline-flex' }}>
              🛡️ SAFE & EASY LOGIN
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: 8 }}>
              Simple Shop &amp; Bill Protection
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
              FinGuard AI keeps your retail shop safe from wrong bills, fake payments, and lost profits.
            </p>
          </div>

          {/* Center Graphic Image (Normal Shop Owner Image) */}
          <div style={{
            position: 'relative', zIndex: 10, margin: '20px 0',
            borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(13,148,136,0.3)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            backgroundColor: '#1E293B',
          }}>
            <img
              src="/assets/normal_shop_owner.png"
              alt="Shop Owner Managing Business Bills"
              style={{
                width: '100%', height: 260, objectFit: 'cover', display: 'block',
              }}
              onError={(e) => {
                e.currentTarget.src = '/assets/hero_dashboard.png';
              }}
            />
            <div style={{
              padding: '12px 16px', backgroundColor: 'rgba(15,23,42,0.9)',
              backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(13,148,136,0.2)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#0D9488" /> 24/7 Smart Business Safeguard
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                PostgreSQL Database Sync • Easy AI Dashboard
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 10, fontSize: 11, color: '#94A3B8' }}>
            FinGuard AI © 2026 • Encrypted PostgreSQL Authentication
          </div>
        </div>

        {/* Right Side Login Form */}
        <div style={{
          padding: '40px 60px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 680, width: '100%', margin: '0 auto',
        }}>
          {!isSuccess ? (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Log In to Your Store Account
                </h1>
                <p style={{ fontSize: 14, color: '#475569' }}>
                  Enter your User ID, Password, and registered Mobile Number to access your store dashboard.
                </p>
              </div>

              {/* Role Select Cards */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 10 }}>
                  1. Select Account Type:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {availableRoles.map(role => {
                    const isSel = selectedRole?.id === role.id;
                    return (
                      <div
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        style={{
                          padding: 14, borderRadius: 12, cursor: 'pointer',
                          backgroundColor: isSel ? '#F0FDFA' : '#FFFFFF',
                          border: `2px solid ${isSel ? '#0D9488' : 'rgba(15,23,42,0.1)'}`,
                          boxShadow: isSel ? '0 4px 14px rgba(13,148,136,0.15)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{role.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: isSel ? '#0D9488' : '#0F172A' }}>{role.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    2. User ID / Registered Email Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OWNER-METRO-8492 or owner@metrosuperstore.com"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                      fontSize: 14, color: '#0F172A', outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    3. Account Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your account password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 42px 12px 16px', borderRadius: 10,
                        border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#0F172A', outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    4. Registered Mobile Number (Digits Only) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="#0D9488" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      required
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="Enter your 10-digit mobile number"
                      value={mobileNum}
                      onChange={handleMobileChange}
                      style={{
                        width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10,
                        border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#0F172A', outline: 'none', fontWeight: 700,
                      }}
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div style={{
                    padding: 12, borderRadius: 8, backgroundColor: '#fee2e2',
                    border: '1px solid #fecdd3', color: '#b91c1c', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="liquid-btn liquid-btn-primary"
                  style={{
                    width: '100%', padding: 14, borderRadius: 12,
                    fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  {isLoggingIn ? 'Verifying Credentials...' : '🔑 Verify & Log In to Dashboard'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Authentication Successful!</h2>
              <p style={{ fontSize: 14, color: '#475569', marginBottom: 24 }}>
                Welcome back to <strong>{companyName}</strong>. Opening your dashboard...
              </p>
              <button
                onClick={handleReset}
                className="liquid-btn liquid-btn-primary"
                style={{ padding: '12px 24px', borderRadius: 10 }}
              >
                Go to Store Dashboard →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
