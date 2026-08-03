import React, { useState } from 'react';
import {
  ArrowLeft, Building2, Store, Users, Mail, Phone,
  Send, Sparkles, CheckCircle2, ShieldCheck,
  Lock, ArrowRight, Database
} from 'lucide-react';
import { registerUserInPostgres } from '../services/postgresDb';

const businessTypes = [
  { label: '🛒 Retail Store & Grocery', value: 'Retail & Grocery' },
  { label: '🔧 Hardware & Wholesale Shop', value: 'Hardware & Wholesale' },
  { label: '🏭 Manufacturing & Factory', value: 'Manufacturing' },
  { label: '💼 CA & Tax Accounting Office', value: 'CA & Accounting' },
  { label: '🏥 Medical Store & Pharmacy', value: 'Pharmacy' },
  { label: '💻 Online Store & E-Commerce', value: 'E-Commerce' },
  { label: '🛠️ Services & Consulting', value: 'Services' },
  { label: '🏢 Other Business', value: 'Other' },
];

const employeeRanges = [
  { label: '1 - 5', desc: 'Small Shop', emoji: '🧑‍💻' },
  { label: '6 - 20', desc: 'Growing Store', emoji: '🏬' },
  { label: '21 - 50', desc: 'Medium Company', emoji: '🏭' },
  { label: '50+', desc: 'Large Enterprise', emoji: '🌐' },
];

export default function SignupPage({ onBack, onNavigateToLogin }) {
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState(businessTypes[0].value);
  const [employees, setEmployees] = useState('6 - 20');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleMobileChange = (e) => {
    // Only allow numbers 0-9
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please type the same password twice.');
      return;
    }

    if (mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Register user in PostgreSQL database service
      await registerUserInPostgres({
        companyName,
        mobileNumber,
        email,
        password,
        role: 'owner',
      });

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Error creating account in PostgreSQL DB. Please try again.');
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

        {/* Existing Member Login link */}
        <button
          onClick={() => onNavigateToLogin && onNavigateToLogin()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: '#6E5D44',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#1A1610'}
          onMouseLeave={e => e.currentTarget.style.color = '#6E5D44'}
        >
          Already registered? <strong>Log In →</strong>
        </button>
      </header>

      {/* ── Main Content Area ─────── */}
      <main style={{
        flex: 1, display: 'grid', gridTemplateColumns: '440px 1fr',
        height: 'calc(100vh - 66px)', overflow: 'hidden',
        backgroundColor: '#FAF8F3',
      }}>
        {/* Left Side: Replaced Text Content with Visual Image Banner */}
        <div style={{
          backgroundColor: '#1A1610', color: '#FFFFFF',
          padding: '32px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
        }}>
          {/* Top Badge */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <span className="mono-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#C9B99A', border: '1px solid rgba(201,185,154,0.3)', marginBottom: 12, display: 'inline-flex' }}>
              📝 EASY NEW REGISTRATION
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: 8 }}>
              Start Safeguarding Your Business Today
            </h2>
            <p style={{ fontSize: 13, color: '#C9B99A', lineHeight: 1.5 }}>
              Join thousands of business owners managing invoices, stock, and profits in simple English.
            </p>
          </div>

          {/* Graphic Image Banner (Replaced text list with Image) */}
          <div style={{
            position: 'relative', zIndex: 10, margin: '20px 0',
            borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(201,185,154,0.4)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            backgroundColor: '#0F0D0A',
          }}>
            <img
              src="/assets/normal_shop_owner.png"
              alt="FinGuard AI Easy Business Protection"
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
                <Sparkles size={14} color="#C9B99A" /> Simple &amp; Powerful Business Tools
              </div>
              <div style={{ fontSize: 11, color: '#9C9185', marginTop: 2 }}>
                PostgreSQL Database Sync • No Jargon
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div style={{
            position: 'relative', zIndex: 10,
            padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#C9B99A',
          }}>
            <Database size={14} color="#C9B99A" style={{ verticalAlign: 'middle', marginRight: 6 }} />
            <strong>PostgreSQL Storage:</strong> Your account password is saved securely in PostgreSQL DB.
          </div>
        </div>

        {/* Right Form Area */}
        <div style={{
          padding: '36px 48px', overflowY: 'auto', display: 'flex',
          flexDirection: 'column', justifyContent: 'center',
        }}>
          {isSuccess ? (
            /* ── SUCCESS STATE: Account Created (DO NOT SHOW RAW ID/PASS CARDS) ──── */
            <div className="gloss-card" style={{
              backgroundColor: '#FFFFFF', borderRadius: 20,
              border: '1px solid rgba(201,185,154,0.45)',
              boxShadow: '0 20px 50px rgba(26,22,16,0.12)',
              padding: '36px 44px', textAlign: 'center', maxWidth: 640, margin: '0 auto', width: '100%',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: 'rgba(74,222,128,0.15)', border: '2px solid #4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={38} color="#16a34a" />
              </div>

              <span className="mono-badge" style={{ marginBottom: 8, display: 'inline-flex' }}>
                🎉 REGISTRATION SUCCESSFUL
              </span>

              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1610', marginBottom: 8 }}>
                Account Created for {companyName}!
              </h1>
              <p style={{ color: '#6E6455', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                Your business account has been saved in the <strong>PostgreSQL Database</strong>. You can now log in with your email or mobile number and password.
              </p>

              <button
                onClick={() => onNavigateToLogin && onNavigateToLogin('owner', email || mobileNumber, '', companyName, email)}
                className="liquid-btn liquid-btn-primary"
                style={{
                  width: '100%', padding: '15px 28px', fontSize: 16,
                  borderRadius: 12, justifyContent: 'center',
                }}
              >
                <span>🚀 Proceed to Login Now</span>
                <ArrowRight size={18} color="#FFFFFF" />
              </button>
            </div>
          ) : (
            /* ── SIGN-UP FORM ──── */
            <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
              <div style={{ marginBottom: 24 }}>
                <span className="mono-badge" style={{ marginBottom: 8, display: 'inline-flex' }}>
                  ✨ CREATE NEW BUSINESS ACCOUNT
                </span>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1610', marginBottom: 4, letterSpacing: '-0.4px' }}>
                  Register Your Store in FinGuard AI
                </h1>
                <p style={{ color: '#6E6455', fontSize: 14 }}>
                  Fill in your simple store details below to create your secure account.
                </p>
              </div>

              {errorMessage && (
                <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: 13, marginBottom: 14 }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* ROW 1: Email Address & Mobile Number (Numbers Only) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      <Mail size={14} color="#8A7558" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="owner@mycompany.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      <Phone size={14} color="#8A7558" />
                      <span>Mobile Number (Digits Only) *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="e.g. 9876543210 (Numbers only)"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                {/* ROW 2: Password & Confirm Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      <Lock size={14} color="#8A7558" />
                      <span>Create Password *</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      <Lock size={14} color="#8A7558" />
                      <span>Confirm Password *</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Re-type your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                {/* ROW 3: Company Name & Type of Business */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      <Building2 size={14} color="#8A7558" />
                      <span>Name of Store / Company *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro Superstore Ltd"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      <Store size={14} color="#8A7558" />
                      <span>Type of Business *</span>
                    </label>
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      {businessTypes.map(b => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ROW 4: Number of Employees & Telegram Chat ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610', marginBottom: 6 }}>
                      <Users size={14} color="#8A7558" />
                      <span>Number of Employees *</span>
                    </label>
                    <select
                      value={employees}
                      onChange={e => setEmployees(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      {employeeRanges.map(e => (
                        <option key={e.label} value={e.label}>{e.emoji} {e.label} ({e.desc})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1A1610' }}>
                        <Send size={14} color="#0088cc" />
                        <span>Telegram Phone or Username</span>
                      </label>
                      <span style={{ fontSize: 11, color: '#6E5D44', fontWeight: 600 }}>💬 Optional</span>
                    </div>
                    <input
                      type="text"
                      placeholder="@company_alerts or phone"
                      value={telegramChatId}
                      onChange={e => setTelegramChatId(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#1A1610', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-btn liquid-btn-primary"
                  style={{
                    width: '100%', padding: '15px 24px', fontSize: 16,
                    borderRadius: 12, justifyContent: 'center', marginTop: 8,
                  }}
                >
                  <span>{isSubmitting ? 'Saving in PostgreSQL DB...' : '✨ Create Account in PostgreSQL DB'}</span>
                  <ArrowRight size={18} color="#FFFFFF" />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
