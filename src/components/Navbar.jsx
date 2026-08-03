import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────
   Navbar — Glassmorphic, Liquid Buttons, Aligned
   ───────────────────────────────────────────── */
export default function Navbar({ onOpenModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [
    { id: 'features',   label: 'Easy Features' },
    { id: 'roles',      label: 'Role Dashboards' },
    { id: 'ai-advisor', label: '24/7 AI Helper' },
    { id: 'roi',        label: 'Savings & Profit' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: scrolled
        ? 'rgba(255,255,255,0.94)'
        : 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 2px 20px rgba(26,22,16,0.07)' : 'none',
    }}>
      {/* Main row */}
      <div style={{
        maxWidth: 1340, margin: '0 auto',
        padding: '0 40px',
        height: 66,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 32,
      }}>

        {/* Logo */}
        <button onClick={() => scrollTo('hero')}
          style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div className="pulse-ring" style={{
            width:38, height:38, borderRadius:10,
            background:'#F5F0E8', border:'1px solid rgba(201,185,154,0.45)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1610" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:18, fontWeight:800, color:'#1A1610', lineHeight:1.1, letterSpacing:'-0.4px' }}>
              FinGuard <span style={{ color:'#9C8A6E' }}>AI</span>
            </div>
            <div style={{ fontSize:9, color:'#9C8A6E', fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Easy Business Helper
            </div>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <div style={{ display:'flex', alignItems:'center', gap:4, flex:1, justifyContent:'center' }}>
          {links.map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background:'none', border:'none', cursor:'pointer',
              padding:'6px 14px', borderRadius:8,
              fontSize:14, fontWeight:500, color:'#2E2820',
              fontFamily:'inherit',
              transition:'background 0.18s ease, color 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,240,232,0.8)'; e.currentTarget.style.color = '#1A1610'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#2E2820'; }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <button
            onClick={() => onOpenModal ? onOpenModal('login') : scrollTo('pricing')}
            className="liquid-btn liquid-btn-secondary"
            style={{ padding:'9px 18px', fontSize:13, borderRadius:99, gap:6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
            </svg>
            <span>Log In</span>
          </button>
          <button
            onClick={() => onOpenModal ? onOpenModal('setup') : scrollTo('pricing')}
            className="liquid-btn liquid-btn-primary"
            style={{ padding:'9px 20px', fontSize:13, borderRadius:99 }}
          >
            <span>Set Up FinGuard</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display:'none', // hidden on desktop
              background:'#F5F0E8', border:'1px solid rgba(201,185,154,0.4)',
              borderRadius:8, padding:'8px', cursor:'pointer',
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1610" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Animated underline */}
      <div className="nav-line" />

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{
          padding:'12px 40px 20px',
          borderTop:'1px solid rgba(201,185,154,0.2)',
          background:'rgba(255,255,255,0.97)',
          display:'flex', flexDirection:'column', gap:4,
          animation:'revealUp 0.25s ease both',
        }}>
          {[...links, { id:'pricing', label:'Get Started' }].map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background:'none', border:'none', cursor:'pointer',
              padding:'10px 12px', borderRadius:8, textAlign:'left',
              fontSize:15, fontWeight:500, color:'#1A1610', fontFamily:'inherit',
              borderBottom:'1px solid rgba(26,22,16,0.04)',
            }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
