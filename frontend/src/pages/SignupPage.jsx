import React, { useState } from 'react';
import {
  ShieldCheck, ArrowLeft, CheckCircle2, Sparkles, Building2, Phone, Mail, Lock, User, AlertCircle
} from 'lucide-react';
import { registerUserInPostgres, triggerWebhookNode } from '../services/postgresDb';

export default function SignupPage({ onBack, onNavigateToLogin }) {
  const [ownerName, setOwnerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [businessType, setBusinessType] = useState('Grocery & Supermarket');
  const [mobileNum, setMobileNum] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  // Email OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleMobileChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNum(cleaned);
  };

  const handleTriggerOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!ownerName.trim()) {
      setErrorMessage('Please enter the Name of the Owner.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please enter the same password in both fields.');
      return;
    }

    if (mobileNum.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Generate 6-digit Email OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpInput('');
    setOtpError('');
    setShowOtpModal(true);

    // Call Webhook 1 with generated OTP details
    try {
      await triggerWebhookNode({
        event: 'send_email_otp',
        owner_name: ownerName,
        company_name: companyName,
        company_address: companyAddress,
        business_type: businessType,
        mobile_number: mobileNum,
        email: email,
        otp: code,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Webhook trigger notice:', err);
    }
  };

  const handleVerifyOtpAndCreate = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (otpInput.trim() !== generatedOtp) {
      setOtpError('Invalid 6-digit OTP code. Please check your email and try again.');
      return;
    }

    setShowOtpModal(false);
    setIsSubmitting(true);

    try {
      // Save new store account
      const result = await registerUserInPostgres({
        ownerName,
        companyName,
        companyAddress,
        businessType,
        mobileNumber: mobileNum,
        email,
        password,
        role: 'owner',
      });

      setTimeout(() => {
        setIsSubmitting(false);
        if (result.success) {
          setCreatedUser(result.user);
          const activeUserObj = {
            user_id: result.user?.user_id || email,
            owner_name: ownerName,
            company_name: companyName,
            company_address: companyAddress,
            email: email,
          };
          localStorage.setItem('finsight_active_user', JSON.stringify(activeUserObj));
        } else {
          setErrorMessage(result.message || 'Error creating account.');
        }
      }, 600);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Error registering account. Please try again.');
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
            color: '#B4781C', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#CCFBF1'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F0FDFA'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Home</span>
        </button>

        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/favcon_logo.png" alt="FinSight Logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
            FinSight <span style={{ color: '#B4781C' }}>AI</span>
          </span>
        </div>

        <button
          onClick={() => onNavigateToLogin && onNavigateToLogin('owner')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: '#B4781C',
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
            <span className="mono-badge" style={{ backgroundColor: 'rgba(243,205,151,0.2)', color: '#F3CD97', border: '1px solid rgba(243,205,151,0.4)', marginBottom: 12, display: 'inline-flex' }}>
              📝 EASY NEW REGISTRATION
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: 8 }}>
              Start Safeguarding Your Business Today
            </h2>
            <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5, fontWeight: 500 }}>
              See beyond the numbers. Join thousands of shop owners managing bills, stock, and profits in plain English.
            </p>
          </div>

          {/* Graphic Image Banner (Sign Up Image) */}
          <div style={{
            position: 'relative', zIndex: 10, margin: '20px 0',
            borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(243,205,151,0.3)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            backgroundColor: '#1E293B',
          }}>
            <img
              src="/assets/signup_banner.png"
              alt="FinSight AI Easy Business Protection"
              style={{
                width: '100%', height: 260, objectFit: 'cover', display: 'block',
              }}
              onError={(e) => {
                e.currentTarget.src = '/assets/hero_dashboard.png';
              }}
            />
            <div style={{
              padding: '12px 16px', backgroundColor: 'rgba(15,23,42,0.9)',
              backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(243,205,151,0.2)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#F3CD97" /> See Beyond the Numbers
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                Instant Setup • Simple English Interface
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 10, fontSize: 11, color: '#94A3B8' }}>
            FinSight AI © 2026 • Encrypted Authentication
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
                  Register your business to set up your account with password protection.
                </p>
              </div>

              <form onSubmit={handleTriggerOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 1. Name of the Owner */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    1. Name of the Owner *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="#F3CD97" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px 12px 42px', borderRadius: 10,
                        border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#0F172A', outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* 2. Business / Store Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    2. Business / Store Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} color="#F3CD97" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                      3. Store Location / Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MG Road, Chennai, TN"
                      value={companyAddress}
                      onChange={e => setCompanyAddress(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#0F172A', outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                      4. Store Category / Type *
                    </label>
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 10,
                        border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#FFFFFF',
                        fontSize: 14, color: '#0F172A', outline: 'none', fontWeight: 600,
                      }}
                    >
                      <option value="Grocery & Supermarket">Grocery &amp; Supermarket</option>
                      <option value="FMCG & Retail Mart">FMCG &amp; Retail Mart</option>
                      <option value="Electronics & Hardware">Electronics &amp; Hardware</option>
                      <option value="Pharmacy & Healthcare">Pharmacy &amp; Healthcare</option>
                      <option value="Textile & Garments">Textile &amp; Garments</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                      5. Mobile Number (10 Digits) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} color="#F3CD97" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                      6. Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#F3CD97" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                      7. Create Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#F3CD97" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                      8. Confirm Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="#F3CD97" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                  {isSubmitting ? 'Creating Account...' : '📧 Verify Email & Register Store'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Store Account Registered!</h2>
              <p style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>
                Your business account for <strong>{createdUser.company_name}</strong> has been created.
              </p>

              <div style={{ backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left', fontSize: 13 }}>
                <div><strong>Owner Name:</strong> {ownerName || 'Store Owner'}</div>
                <div><strong>System User ID:</strong> <code>{createdUser.user_id}</code></div>
                <div><strong>Store Address:</strong> {companyAddress || 'Not Provided'}</div>
                <div><strong>Registered Mobile:</strong> {createdUser.mobile_number}</div>
                <div><strong>Verified Email:</strong> {createdUser.email}</div>
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

      {/* ── EMAIL OTP VERIFICATION MODAL ─────────────────────────────── */}
      {showOtpModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: 420, maxWidth: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(13,148,136,0.3)',
            textAlign: 'center',
          }}>
            <div style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Mail size={26} color="#F3CD97" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Verify Email Address</h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
              A 6-digit verification code has been sent to <strong>{email}</strong>. Please check your inbox and enter the code below.
            </p>

            <form onSubmit={handleVerifyOtpAndCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, textAlign: 'center',
                  fontSize: 22, fontWeight: 800, letterSpacing: '0.25em', fontFamily: 'monospace',
                  border: '2px solid rgba(13,148,136,0.5)', outline: 'none', backgroundColor: '#F8FAFC',
                }}
              />

              {otpError && (
                <div style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>{otpError}</div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-btn liquid-btn-primary"
                  style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                >
                  Verify &amp; Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
