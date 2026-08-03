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
        borderBottom: '1px solid rgba(13,148,136,0.12)',
        paddingBottom: 72,
      }}
    >
      {/* Ambient teal & blue orbs */}
      <div className="orb" style={{
        width: 520, height: 520,
        top: -130, left: -110,
        background: 'rgba(204,251,241,0.55)',
        filter: 'blur(88px)',
      }} />
      <div className="orb" style={{
        width: 420, height: 420,
        top: '8%', right: -90,
        background: 'rgba(224,242,254,0.7)',
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
            <Sparkles size={13} color="#0D9488" />
            SIMPLE MONEY &amp; BILL MANAGEMENT // AI ASSISTANT
          </div>

          {/* Headline */}
          <h1
            className="reveal reveal-delay-1"
            style={{
              color: '#0F172A',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: 18,
            }}
          >
            Smart Shop Management<br />
            &amp; AI Protection for{' '}
            <span style={{ color: '#0D9488' }}>Your Business</span>
          </h1>

          {/* Subheadline */}
          <p
            className="reveal reveal-delay-2"
            style={{
              color: '#475569',
              fontSize: 17,
              lineHeight: 1.65,
              fontWeight: 400,
              marginBottom: 28,
              maxWidth: 540,
            }}
          >
            All-in-one shop money app featuring instant bill photo scanning,
            simple GST tax reports, fake bill warnings, and 24/7 AI chat assistance.
          </p>

          {/* Checklist */}
          <div
            className="reveal reveal-delay-3"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 36 }}
          >
            {['Instant Bill Scanner', 'Fake Bill Interceptor', 'Easy GST Tax Filing'].map((item) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                <CheckCircle2 size={15} color="#0D9488" />
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
              <LogIn size={16} color="#0F172A" />
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
              backgroundColor: '#F0FDFA',
              border: '1px solid rgba(13,148,136,0.25)',
            }}
          >
            {[
              { icon: Lock, label: 'Secure Accounts' },
              { icon: ShieldCheck, label: 'Easy Staff Access' },
              { icon: Layers, label: 'Instant Bill Sync' },
            ].map(({ icon: Icon, label }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span style={{ width: 1, height: 14, backgroundColor: 'rgba(13,148,136,0.3)', display: 'block' }} />}
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0F172A', fontSize: 12, fontWeight: 600 }}>
                  <Icon size={13} color="#0D9488" />
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
              border: '1px solid rgba(13,148,136,0.25)',
              boxShadow: '0 24px 60px rgba(15,23,42,0.15)',
              backgroundColor: '#0F172A',
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
                <span style={{ color: '#CCFBF1', fontSize: 11, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em' }}>FINGUARD DASHBOARD — LIVE</span>
                <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontSize: 10, padding: '3px 10px', borderRadius: 99, fontWeight: 700, border: '1px solid rgba(74,222,128,0.3)' }}>● LIVE</span>
              </div>

              {/* Stat row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Cash Flow', val: '₹ 64,230', change: '+24%', up: true },
                  { label: 'Invoices', val: '1,284', change: '+8%', up: true },
                  { label: 'Fraud Blocked', val: '₹ 1,480', change: '3 alerts', up: false },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ color: '#94A3B8', fontSize: 10, fontFamily: 'sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
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
                      ? 'linear-gradient(180deg, #0D9488 0%, rgba(13,148,136,0.6) 100%)'
                      : 'rgba(255,255,255,0.08)',
                    transition: 'height 0.5s ease',
                  }} />
                ))}
              </div>

              {/* Bottom tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Bill Reader', 'GST Tax Auto', 'AI Chatbot', 'Staff Access'].map((t) => (
                  <span key={t} style={{ background: 'rgba(13,148,136,0.2)', color: '#CCFBF1', fontSize: 9, padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid rgba(13,148,136,0.3)' }}>{t}</span>
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

          {/* Floating badge 1 — AI Protection */}
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
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={15} color="#0D9488" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#0F172A', fontSize: 12, fontWeight: 700 }}>AI Bill Protection</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 1, fontWeight: 500 }}>Fake bill interceptor active.</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', flexShrink: 0 }} />
          </div>

          {/* Floating badge 2 — AI Helper Chat */}
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
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={15} color="#0284C7" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#0F172A', fontSize: 12, fontWeight: 700 }}>AI Business Helper</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 1, fontWeight: 500 }}>24/7 AI chat active.</div>
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
            <TrendingUp size={13} color="#0D9488" />
            <span style={{ color: '#0F172A', fontSize: 12, fontWeight: 700 }}>Cash Flow +24%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
