import React, { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, LogIn, Lock, Layers, TrendingUp, Bot } from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

export default function HeroSection({ onOpenModal }) {
  useScrollReveal();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(26,22,16,0.08)',
        paddingBottom: 72,
      }}
    >
      {/* Ambient cream orbs */}
      <div className="orb" style={{
        width: 520, height: 520,
        top: -130, left: -110,
        background: 'rgba(237,228,213,0.55)',
        filter: 'blur(88px)',
      }} />
      <div className="orb" style={{
        width: 420, height: 420,
        top: '8%', right: -90,
        background: 'rgba(250,248,243,0.9)',
        filter: 'blur(72px)',
        animationDelay: '2s',
      }} />

      {/* ── Main hero layout ─────────────────────────── */}
      <div style={{
        maxWidth: 1360,
        margin: '0 auto',
        padding: '64px 40px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 56,
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 2,
      }}>

        {/* LEFT: Text column */}
        <div style={{ flex: '1 1 440px', minWidth: 320, maxWidth: 620 }}>

          {/* Mono pill badge */}
          <div className="reveal mono-badge" style={{ marginBottom: 22, display: 'inline-flex' }}>
            <Sparkles size={13} color="#6E5D44" />
            FINANCIAL OPERATING SYSTEM // GEMINI AI
          </div>

          {/* Headline */}
          <h1
            className="reveal reveal-delay-1"
            style={{
              color: '#1A1610',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: 18,
            }}
          >
            Smart Financial Management<br />
            &amp; AI Intelligence for{' '}
            <span style={{ color: '#8A7558' }}>Your Business</span>
          </h1>

          {/* Subheadline */}
          <p
            className="reveal reveal-delay-2"
            style={{
              color: '#6E6455',
              fontSize: 17,
              lineHeight: 1.65,
              fontWeight: 400,
              marginBottom: 28,
              maxWidth: 540,
            }}
          >
            Unified financial platform integrating instant OCR invoice scanning,
            real-time GST compliance, AI fraud governance, and 24/7 Gemini
            business advisory.
          </p>

          {/* Checklist */}
          <div
            className="reveal reveal-delay-3"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 36 }}
          >
            {['Instant OCR Parsing', 'AI Fraud Governance', 'GST Compliance Automation'].map((item) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#1A1610' }}>
                <CheckCircle2 size={15} color="#1A1610" />
                {item}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div
            className="reveal reveal-delay-4"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}
          >
            <button
              onClick={() => onOpenModal ? onOpenModal('setup') : scrollTo('pricing')}
              className="liquid-btn liquid-btn-primary"
              style={{ fontSize: 15, padding: '14px 26px', borderRadius: 12 }}
            >
              <span>Create FinGuard for Your Business</span>
              <ArrowRight size={16} color="#FFFFFF" />
            </button>
            <button
              onClick={() => onOpenModal ? onOpenModal('login') : scrollTo('pricing')}
              className="liquid-btn liquid-btn-secondary"
              style={{ fontSize: 15, padding: '14px 22px', borderRadius: 12 }}
            >
              <LogIn size={16} color="#1A1610" />
              <span>Log In to Workspace</span>
            </button>
          </div>

          {/* Trust bar */}
          <div
            className="reveal reveal-delay-5"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
              padding: '14px 18px',
              borderRadius: 12,
              backgroundColor: '#FAF8F3',
              border: '1px solid rgba(201,185,154,0.3)',
            }}
          >
            {[
              { icon: Lock, label: 'Encrypted Ledger' },
              { icon: ShieldCheck, label: 'Role-Based Permissions' },
              { icon: Layers, label: 'Kafka Event Stream' },
            ].map(({ icon: Icon, label }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span style={{ width: 1, height: 14, backgroundColor: 'rgba(201,185,154,0.4)', display: 'block' }} />}
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6E6455', fontSize: 12, fontWeight: 500 }}>
                  <Icon size={13} color="#9C8A6E" />
                  {label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT: Visual column */}
        <div
          className="reveal reveal-delay-2"
          style={{
            flex: '1 1 400px',
            minWidth: 320,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Dashboard card — floats */}
          <div
            className="anim-float2 gloss-card"
            style={{
              width: '100%',
              maxWidth: 580,
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(201,185,154,0.3)',
              boxShadow: '0 24px 60px rgba(26,22,16,0.12)',
              backgroundColor: '#1A1610',
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Fake dashboard UI */}
            <div style={{ width: '100%', height: '100%', padding: 20, position: 'relative', overflow: 'hidden' }}>
              {/* Top bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: '#C9B99A', fontSize: 11, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em' }}>FINGUARD DASHBOARD — Q2 2024</span>
                <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontSize: 10, padding: '3px 10px', borderRadius: 99, fontWeight: 700, border: '1px solid rgba(74,222,128,0.3)' }}>● LIVE</span>
              </div>

              {/* Stat row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Cash Flow', val: '$64,230', change: '+24%', up: true },
                  { label: 'Invoices', val: '1,284', change: '+8%', up: true },
                  { label: 'Fraud Blocked', val: '$1,480', change: '3 alerts', up: false },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ color: '#C9B99A', fontSize: 10, fontFamily: 'sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{s.val}</div>
                    <div style={{ color: s.up ? '#4ade80' : '#F59E0B', fontSize: 10, fontWeight: 700 }}>{s.change}</div>
                  </div>
                ))}
              </div>

              {/* Fake chart bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 70, marginBottom: 14, padding: '0 4px' }}>
                {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: '4px 4px 0 0',
                    background: i >= 9
                      ? 'linear-gradient(180deg, #C9B99A 0%, rgba(201,185,154,0.6) 100%)'
                      : 'rgba(255,255,255,0.08)',
                    transition: 'height 0.5s ease',
                  }} />
                ))}
              </div>

              {/* Bottom tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['OCR Engine', 'GST Auto-Filed', 'Gemini AI', 'RBAC Active'].map((t) => (
                  <span key={t} style={{ background: 'rgba(201,185,154,0.12)', color: '#C9B99A', fontSize: 9, padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid rgba(201,185,154,0.2)' }}>{t}</span>
                ))}
              </div>

              {/* Gloss overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
                borderRadius: '20px 20px 0 0',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Floating badge 1 — AI Risk Governance */}
          <div
            className="glass-badge anim-float"
            style={{
              position: 'absolute',
              top: -18,
              left: -10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 14,
              width: 250,
              zIndex: 10,
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={15} color="#1A1610" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#1A1610', fontSize: 12, fontWeight: 700 }}>AI Risk Governance</div>
              <div style={{ color: '#6E6455', fontSize: 11, marginTop: 1, fontWeight: 500 }}>Real-time audit active. Ledger clear.</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', flexShrink: 0 }} />
          </div>

          {/* Floating badge 2 — Gemini AI Advisory */}
          <div
            className="glass-badge anim-float3"
            style={{
              position: 'absolute',
              bottom: -18,
              right: -10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 14,
              width: 240,
              zIndex: 10,
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EDE4D5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={15} color="#6E5D44" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#1A1610', fontSize: 12, fontWeight: 700 }}>Gemini AI Advisory</div>
              <div style={{ color: '#6E6455', fontSize: 11, marginTop: 1, fontWeight: 500 }}>Business advisory live.</div>
            </div>
          </div>

          {/* Stat bubble — Cash Flow */}
          <div
            className="glass-badge anim-float2"
            style={{
              position: 'absolute',
              top: '42%',
              right: -28,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 99,
              zIndex: 10,
            }}
          >
            <TrendingUp size={13} color="#1A1610" />
            <span style={{ color: '#1A1610', fontSize: 12, fontWeight: 700 }}>Cash Flow +24%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
