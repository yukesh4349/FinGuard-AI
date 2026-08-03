import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, Lock, FileCheck } from 'lucide-react';

const footerLinks = [
  {
    header: 'Core Features',
    section: 'features',
    items: ['OCR Invoice Scanning', 'AI Fraud Detection', 'Stock Demand Predictor', 'Vendor Price Matcher', 'Automated GST Filings'],
  },
  {
    header: 'Solutions by Role',
    section: 'roles',
    items: ['Business Owners', 'Accountants & CAs', 'Department Staff', 'Vendors & Suppliers', 'System Admins'],
  },
  {
    header: 'Platform & Access',
    section: 'pricing',
    items: ['Log In to Workspace', 'Create Business Account', 'FastAPI Architecture', 'Gemini LLM Advisory'],
  },
];

export default function Footer({ onOpenModal }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.trim().length > 3) setSubmitted(true);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: '#FAF6EE' }}>
      {/* Top CTA Banner */}
      <div style={{
        padding: '48px 40px',
        backgroundColor: '#EFEAE2',
        borderTop: '1px solid #E2DBD0',
        borderBottom: '1px solid #E2DBD0',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: 28,
        }}>
          <div style={{ flex: '1 1 280px' }}>
            <h3 style={{ color: '#26221D', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
              Set Up FinGuard for Your Business
            </h3>
            <p style={{ color: '#6B6256', fontSize: 15, maxWidth: 520 }}>
              Start automating your accounting, GST filings, and invoice OCR in under 3 minutes.
            </p>
          </div>

          <div style={{ flex: '1 1 320px', maxWidth: 480 }}>
            {submitted ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: 14, borderRadius: 10,
                backgroundColor: '#EFEAE2', border: '1px solid #E2DBD0',
              }}>
                <CheckCircle2 size={20} color="#595248" />
                <span style={{ color: '#595248', fontSize: 14, fontWeight: 700 }}>
                  Account Setup Initiated! Check your email to log in.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="email"
                  placeholder="Enter business email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  style={{
                    flex: 1, backgroundColor: '#FFFFFF',
                    border: '1px solid #E2DBD0', borderRadius: 10,
                    padding: '12px 16px', color: '#26221D', fontSize: 14, outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={handleSubmit}
                  className="liquid-btn liquid-btn-primary"
                  style={{ padding: '12px 20px', borderRadius: 10, fontSize: 14, whiteSpace: 'nowrap' }}
                >
                  <span>Create Account</span>
                  <ArrowRight size={16} color="#FFFFFF" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ padding: '60px 40px 32px' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', gap: 48, marginBottom: 48,
        }}>
          {/* Brand col */}
          <div style={{ flex: '2 1 280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                backgroundColor: '#EFEAE2', border: '1px solid #E2DBD0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={20} color="#595248" />
              </div>
              <span style={{ color: '#26221D', fontSize: 20, fontWeight: 800 }}>
                FinGuard <span style={{ color: '#8C8275' }}>AI</span>
              </span>
            </div>
            <p style={{ color: '#6B6256', fontSize: 14, lineHeight: 1.6, marginBottom: 20, maxWidth: 360 }}>
              The AI-powered financial management operating system built for small businesses, stores, and growing enterprises.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { icon: Lock, label: 'Encrypted Ledger Data' },
                { icon: FileCheck, label: 'ISO Security Certified' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 8,
                  backgroundColor: '#FFFFFF', border: '1px solid #E2DBD0',
                }}>
                  <Icon size={12} color="#595248" />
                  <span style={{ color: '#423A31', fontSize: 11, fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ header, section, items }) => (
            <div key={header} style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ color: '#26221D', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{header}</h4>
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(section)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', padding: 0, fontFamily: 'inherit',
                    color: '#6B6256', fontSize: 14,
                    transition: 'color 0.18s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#26221D'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6B6256'}
                >
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: '1px solid #E2DBD0', gap: 14,
        }}>
          <p style={{ color: '#9E9385', fontSize: 13 }}>
            © {new Date().getFullYear()} FinGuard AI Platform Inc. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Security Audit'].map((item) => (
              <button key={item} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', color: '#9E9385', fontSize: 13,
                transition: 'color 0.18s ease', padding: 0,
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#26221D'}
                onMouseLeave={e => e.currentTarget.style.color = '#9E9385'}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
