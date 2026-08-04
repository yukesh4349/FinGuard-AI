import React, { useState } from 'react';
import {
  ShieldCheck, ArrowLeft, CheckCircle2, Sparkles, Building2, Phone, Mail, Lock, User, AlertCircle
} from 'lucide-react';
import { registerUserInPostgres } from '../services/postgresDb';

export default function SignupPage({ onBack, onNavigateToLogin }) {
  const [companyName, setCompanyName] = useState('');
  const [mobileNum, setMobileNum] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  const handleMobileChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNum(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (password !== confirmPassword) {
      setIsSubmitting(false);
      setErrorMessage('Passwords do not match. Please enter the same password in both fields.');
      return;
    }

    if (mobileNum.length < 10) {
      setIsSubmitting(false);
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      // Save new account into PostgreSQL database
      const result = await registerUserInPostgres({
        companyName,
        mobileNumber: mobileNum,
        email,
        password,
        role: 'owner',
      });

      setTimeout(() => {
        setIsSubmitting(false);
        if (result.success) {
          setCreatedUser(result.user);
        } else {
          setErrorMessage(result.message || 'Error creating account.');
        }
      }, 600);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Database error. Please try again.');
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

        <button
          onClick={() => onNavigateToLogin && onNavigateToLogin('owner')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: '#0D9488',
            fontFamily: 'inherit',
          }}
        >
          Already registered? <strong>Log In →</strong>
        </button>
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
          {/* Top Badge */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <span className="mono-badge" style={{ backgroundColor: 'rgba(13,148,136,0.2)', color: '#CCFBF1', border: '1px solid rgba(13,148,136,0.4)', marginBottom: 12, display: 'inline-flex' }}>
              📝 EASY NEW REGISTRATION
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: 8 }}>
              Start Safeguarding Your Business Today
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
              Join thousands of business owners managing invoices, stock, and profits in simple English.
            </p>
          </div>

          {/* Graphic Image Banner */}
          <div style={{
            position: 'relative', zIndex: 10, margin: '20px 0',
            borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(13,148,136,0.3)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            backgroundColor: '#1E293B',
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
              padding: '12px 16px', backgroundColor: 'rgba(15,23,42,0.9)',
              backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(13,148,136,0.2)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#0D9488" /> 24/7 AI Business Safeguard
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                PostgreSQL Database Sync • Simple English Interface
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 10, fontSize: 11, color: '#94A3B8' }}>
            FinGuard AI © 2026 • Encrypted PostgreSQL Authentication
          </div>
        </div>

        {/* Right Side Signup Form */}
        <div style={{
          padding: '40px 60px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 680, width: '100%', margin: '0 auto',
        }}>
          {!createdUser ? (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                  Create Your Store Account
                </h1>
                <p style={{ fontSize: 14, color: '#475569' }}>
                  Register your business to set up your PostgreSQL account with custom password protection.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    1. Business / Store Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} color="#0D9488" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro Superstore Ltd"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10,
                        border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#0F172A', outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                      2. Mobile Number (Digits Only) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} color="#0D9488" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="tel"
                        required
                        pattern="[0-9]*"
                        maxLength={10}
                        placeholder="e.g. 9876543210"
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

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                      3. Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#0D9488" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        required
                        placeholder="e.g. owner@store.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10,
                          border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                          fontSize: 14, color: '#0F172A', outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                      4. Create Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#0D9488" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="password"
                        required
                        placeholder="Set your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10,
                          border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                          fontSize: 14, color: '#0F172A', outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                      5. Confirm Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#0D9488" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10,
                          border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                          fontSize: 14, color: '#0F172A', outline: 'none',
                        }}
                      />
                    </div>
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
                  disabled={isSubmitting}
                  className="liquid-btn liquid-btn-primary"
                  style={{
                    width: '100%', padding: 14, borderRadius: 12,
                    fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  {isSubmitting ? 'Saving to PostgreSQL Database...' : '✨ Create Account & Register Store'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Account Created Successfully!</h2>
              <p style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>
                Your account for <strong>{createdUser.company_name}</strong> has been saved in PostgreSQL.
              </p>

              <div style={{ backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left', fontSize: 13 }}>
                <div><strong>System Generated Login ID:</strong> <code>{createdUser.user_id}</code></div>
                <div><strong>Registered Mobile Number:</strong> {createdUser.mobile_number}</div>
                <div><strong>Email Address:</strong> {createdUser.email}</div>
              </div>

              <button
                onClick={() => onNavigateToLogin && onNavigateToLogin('owner', createdUser.user_id, password, createdUser.company_name, createdUser.email)}
                className="liquid-btn liquid-btn-primary"
                style={{ padding: '12px 24px', borderRadius: 10 }}
              >
                Proceed to Log In →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
