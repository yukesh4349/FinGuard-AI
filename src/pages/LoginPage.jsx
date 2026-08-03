import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Briefcase, Calculator, Users, Store,
  Lock, ArrowRight, CheckCircle2, KeyRound, Sparkles, LogIn, ShieldCheck, Database
} from 'lucide-react';
import { authenticateUserInPostgres } from '../services/postgresDb';

const rolesList = [
  {
    id: 'owner',
    title: 'Business Owner',
    subtitle: 'Manage Profits, Cash & Business Decisions',
    emoji: '👑',
    icon: Briefcase,
    color: '#A88660',
    badge: 'OWNER ROLE',
    demoId: 'OWNER-METRO-8492',
    demoPass: 'FG-8924-XK9',
    permissions: [
      'See total profits, sales, and money left in bank',
      'Approve bills and employee expense requests fast',
      '24/7 AI Business Advisor for easy tips',
      'Get instant warnings for duplicate or fake bills',
    ],
  },
  {
    id: 'accountant',
    title: 'Accountant / CA',
    subtitle: 'Bills, Taxes, GST & Receipt Scanning',
    emoji: '🧮',
    icon: Calculator,
    color: '#5C705E',
    badge: 'FINANCE ROLE',
    demoId: 'accountant@metrosuperstore.com',
    demoPass: 'FG-CA-2026',
    permissions: [
      'Scan paper bills and receipts automatically',
      'Calculate GST taxes and export tax reports easily',
      'Match bank statements with sales records',
      'Catch double payments and vendor billing errors',
    ],
  },
  {
    id: 'employee',
    title: 'Operations & Staff',
    subtitle: 'Upload Bills & Submit Expense Claims',
    emoji: '👥',
    icon: Users,
    color: '#C88D74',
    badge: 'STAFF ROLE',
    demoId: 'staff.ops@metrosuperstore.com',
    demoPass: 'FG-STAFF-982',
    permissions: [
      'Snap bill photos with phone and claim money back',
      'Tag expense categories for store items',
      'Keep main company bank balances private and safe',
      'Get status updates on your buying requests',
    ],
  },
  {
    id: 'manager',
    title: 'Store Manager',
    subtitle: 'Stock Inventory, Supplier Orders & Store Cash',
    emoji: '🏬',
    icon: Store,
    color: '#4F46E5',
    badge: 'STORE ROLE',
    demoId: 'manager.store1@metrosuperstore.com',
    demoPass: 'FG-MGR-552',
    permissions: [
      'Get low stock alerts before items run out',
      'Create and send purchase orders to suppliers',
      'Check daily sales and cash register balances',
      'Compare supplier prices to buy at cheapest rates',
    ],
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
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNum, setMobileNum] = useState('');
  const [companyName, setCompanyName] = useState('Metro Superstore Ltd');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('finguard_latest_owner');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyName) setCompanyName(parsed.companyName);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    if (initialRole) {
      const found = rolesList.find(r => r.id === initialRole) || rolesList[0];
      setSelectedRole(found);
    }
  }, [initialRole]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    // Leave inputs clean without autofilling raw ID and passwords
    setUserId('');
    setPassword('');
    setMobileNum('');
  };

  const handleMobileChange = (e) => {
    // Mobile number input must only accept numbers
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNum(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMessage('');

    try {
      // Query PostgreSQL database service for authentication checking ID, Password, and Mobile Number
      const result = await authenticateUserInPostgres(userId, password, mobileNum);
      
      setTimeout(() => {
        setIsLoggingIn(false);
        if (result.success) {
          setIsSuccess(true);
          if (result.user?.company_name) setCompanyName(result.user.company_name);
          if (onNavigateToDashboard) {
            onNavigateToDashboard(selectedRole ? selectedRole.id : 'owner', companyName, userId || 'OWNER-USER');
          }
        } else {
          setErrorMessage(result.message || 'Invalid User ID, Password, or Mobile Number.');
        }
      }, 600);
    } catch (err) {
      setIsLoggingIn(false);
      setErrorMessage('Database error. Please try again.');
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
      backgroundColor: '#FAF8F3',
      display: 'flex', flexDirection: 'column',
      color: '#1A1610', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* ── Top Header Navigation Bar ─────────────────────────────── */}
      <header style={{
        height: 66, padding: '0 32px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,185,154,0.3)',
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
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EDE4D5'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F5F0E8'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Home</span>
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            backgroundColor: '#1A1610',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={18} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1A1610' }}>
            FinGuard <span style={{ color: '#8A7558' }}>AI</span>
          </span>
        </div>

        {/* PostgreSQL Indicator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5C705E', fontWeight: 700, backgroundColor: 'rgba(92,112,94,0.1)', padding: '4px 10px', borderRadius: 99 }}>
          <Database size={14} color="#5C705E" />
          <span>PostgreSQL Auth Connected</span>
        </div>
      </header>

      {/* ── Main Content Area (Edge-to-Edge Split Layout) ─────── */}
      <main style={{
        flex: 1, display: 'grid', gridTemplateColumns: '440px 1fr',
        height: 'calc(100vh - 66px)', overflow: 'hidden',
        backgroundColor: '#FAF8F3',
      }}>
        {/* Left Side: Replaced Text Content with Visual Shop Banner Image */}
        <div style={{
          backgroundColor: '#1A1610', color: '#FFFFFF',
          padding: '32px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
        }}>
          {/* Top Title Badge */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <span className="mono-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#C9B99A', border: '1px solid rgba(201,185,154,0.3)', marginBottom: 12, display: 'inline-flex' }}>
              🛡️ SAFE & EASY LOGIN
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: 8 }}>
              Simple Shop &amp; Bill Protection
            </h2>
            <p style={{ fontSize: 13, color: '#C9B99A', lineHeight: 1.5 }}>
              FinGuard AI keeps your retail shop safe from wrong bills, fake payments, and lost profits.
            </p>
          </div>

          {/* Center Graphic Image (Normal Shop Owner Image) */}
          <div style={{
            position: 'relative', zIndex: 10, margin: '20px 0',
            borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(201,185,154,0.4)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            backgroundColor: '#0F0D0A',
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
              padding: '12px 16px', backgroundColor: 'rgba(26,22,16,0.9)',
              backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(201,185,154,0.2)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#C9B99A" /> 24/7 Smart Business Safeguard
              </div>
              <div style={{ fontSize: 11, color: '#9C9185', marginTop: 2 }}>
                PostgreSQL Secure Database • Easy AI Dashboard
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div style={{
            position: 'relative', zIndex: 10,
            padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#C9B99A',
          }}>
            🔒 <strong>100% Private &amp; Secure:</strong> Your passwords and business details are encrypted in PostgreSQL DB.
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{
          padding: '36px 48px', overflowY: 'auto', display: 'flex',
          flexDirection: 'column', justifyContent: 'center',
        }}>
          {isSuccess ? (
            /* ── SUCCESS STATE: Logged in ────────────────────────────── */
            <div className="gloss-card" style={{
              backgroundColor: '#FFFFFF', borderRadius: 20,
              border: '1px solid rgba(201,185,154,0.45)',
              boxShadow: '0 20px 50px rgba(26,22,16,0.12)',
              padding: '36px 44px', textAlign: 'center', maxWidth: 800, margin: '0 auto', width: '100%',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: 'rgba(74,222,128,0.15)', border: '2px solid #4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>

              <span className="mono-badge" style={{ marginBottom: 8, display: 'inline-flex' }}>
                🎉 WELCOME BACK!
              </span>

              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1610', marginBottom: 6 }}>
                Welcome, {companyName}!
              </h1>
              <p style={{ color: '#6E6455', fontSize: 14, marginBottom: 20 }}>
                Logged in successfully with PostgreSQL DB Security.
              </p>

              <div style={{
                backgroundColor: '#FAF8F3', borderRadius: 14, padding: 18,
                border: '1px solid rgba(201,185,154,0.4)', textAlign: 'left',
                marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7558', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  YOUR EASY ACCESS PERMISSIONS:
                </div>
                {selectedRole?.permissions.map((p, idx) => (
                  <div key={idx} style={{ fontSize: 13, color: '#1A1610', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="liquid-btn liquid-btn-primary"
                style={{
                  width: '100%', padding: '15px 28px', fontSize: 16,
                  borderRadius: 12, justifyContent: 'center',
                }}
              >
                <span>🚀 Open Business Owner Dashboard</span>
                <ArrowRight size={18} color="#FFFFFF" />
              </button>
            </div>
          ) : !selectedRole ? (
            /* ── STEP 1: ROLE SELECTION CARDS ────────────────────────── */
            <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
              <div style={{ marginBottom: 24 }}>
                <span className="mono-badge" style={{ marginBottom: 8, display: 'inline-flex' }}>
                  <KeyRound size={12} color="#6E5D44" />
                  EASY LOGIN TERMINAL
                </span>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1610', marginBottom: 4, letterSpacing: '-0.4px' }}>
                  Select Your Role to Log In
                </h1>
                <p style={{ color: '#6E6455', fontSize: 14 }}>
                  Choose your role below to open your simple English dashboard.
                </p>
              </div>

              {/* Roles List Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {rolesList.map((role) => {
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                        padding: '20px 22px', borderRadius: 16,
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid rgba(201,185,154,0.45)',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        boxShadow: '0 4px 14px rgba(26,22,16,0.03)',
                        transition: 'all 0.22s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#FAF8F3';
                        e.currentTarget.style.borderColor = role.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = 'rgba(201,185,154,0.45)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        backgroundColor: role.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                      }}>
                        {role.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1610' }}>{role.title}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                            backgroundColor: 'rgba(201,185,154,0.3)', color: '#6E5D44',
                            fontFamily: 'monospace', textTransform: 'uppercase',
                          }}>{role.badge}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#6E6455', marginTop: 3, display: 'block' }}>
                          {role.subtitle}
                        </span>
                      </div>

                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        backgroundColor: 'rgba(201,185,154,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <ArrowRight size={16} color="#1A1610" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── STEP 2: LOGIN FORM WITH NUMERIC MOBILE INPUT & NO AUTOFILL ────────── */
            <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <button
                  onClick={() => setSelectedRole(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8,
                    backgroundColor: '#FFFFFF', border: '1px solid rgba(201,185,154,0.4)',
                    fontSize: 13, fontWeight: 700, color: '#1A1610', cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EDE4D5'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  <ArrowLeft size={14} />
                  <span>← Choose Different Role</span>
                </button>
                <span style={{ fontSize: 12, color: '#5C705E', fontWeight: 700, fontFamily: 'monospace' }}>
                  POSTGRESQL DB AUTH
                </span>
              </div>

              {/* Selected Role Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px', borderRadius: 16,
                backgroundColor: '#FFFFFF',
                border: `1.5px solid ${selectedRole.color}`,
                marginBottom: 20, boxShadow: '0 4px 14px rgba(26,22,16,0.03)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  backgroundColor: selectedRole.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {selectedRole.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1610' }}>
                    {selectedRole.title} Login
                  </div>
                  <div style={{ fontSize: 13, color: '#6E6455' }}>
                    {selectedRole.subtitle}
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  color: '#5C705E', backgroundColor: 'rgba(92,112,94,0.12)',
                }}>
                  <Lock size={12} color="#5C705E" /> Secure Login
                </span>
              </div>

              {errorMessage && (
                <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: 13, marginBottom: 14 }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Clean Login Form (No Autofill & Numbers-Only Mobile Field) */}
              <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  {/* User ID or Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      User ID or Email Address *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                      placeholder="e.g. owner@mycompany.com or OWNER-METRO-8492"
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your secret password"
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Company / Store Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      Company / Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Metro Superstore Ltd"
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Mobile Number Field (NUMBERS ONLY STRICT ENFORCEMENT) */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      Mobile Phone Number (Digits Only) *
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]*"
                      maxLength={10}
                      value={mobileNum}
                      onChange={handleMobileChange}
                      placeholder="e.g. 9876543210 (Numbers only)"
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                    <span style={{ fontSize: 11, color: '#6E5D44', marginTop: 4, display: 'block' }}>
                      Only numbers (0-9) allowed. No letters or symbols.
                    </span>
                  </div>
                </div>

                {/* Permissions Box */}
                <div style={{
                  backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
                  border: '1px solid rgba(201,185,154,0.35)', boxShadow: '0 2px 8px rgba(26,22,16,0.02)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7558', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 8 }}>
                    {selectedRole.title} Easy Features:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {selectedRole.permissions.map((p, idx) => (
                      <div key={idx} style={{ fontSize: 12, color: '#6E6455', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 4 }}>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="liquid-btn liquid-btn-primary"
                    style={{ width: '100%', padding: '14px 20px', fontSize: 15, borderRadius: 12, justifyContent: 'center' }}
                  >
                    <LogIn size={18} color="#FFFFFF" />
                    <span>{isLoggingIn ? 'Connecting to PostgreSQL...' : `Log In as ${selectedRole.title}`}</span>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </button>

                  {/* Quick Direct Launch Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(true);
                      if (onNavigateToDashboard) onNavigateToDashboard(selectedRole.id, companyName, userId || 'OWNER-8492');
                    }}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: 12,
                      backgroundColor: '#FFFFFF', border: '1px solid rgba(201,185,154,0.5)',
                      color: '#6E5D44', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: 'inherit', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF8F3'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  >
                    <Sparkles size={15} color="#6E5D44" />
                    <span>⚡ Quick Open Dashboard</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

