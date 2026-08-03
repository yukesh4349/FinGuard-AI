import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import useScrollReveal from '../utils/useScrollReveal';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Patel',
    role: 'Owner, Metro Superstore (3 Locations)',
    text: "FinGuard AI's OCR invoice scanner saved our store 18 hours every week. The vendor price matcher automatically flagged a 14% cheaper bulk supplier for our top-selling items.",
    stars: 5,
    tag: 'Retail & Grocery',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    role: 'Finance Manager, Apex Hardware Supplies',
    text: "The AI Anomaly Engine caught a $1,480 duplicate supplier invoice on our second day! It's like having a 24/7 forensic accountant built into our cash register.",
    stars: 5,
    tag: 'Hardware & Wholesale',
  },
  {
    id: 3,
    name: 'Vikram Sharma',
    role: 'Chartered Accountant & Business Advisor',
    text: 'FinGuard AI makes GST compliance and audit log tracking completely effortless for small business clients. The Gemini LLM advisor gives surprisingly sharp liquidity forecasts.',
    stars: 5,
    tag: 'Tax & Audit',
  },
];

export default function TestimonialsSection() {
  useScrollReveal();

  return (
    <section
      style={{
        padding: '88px 40px',
        backgroundColor: '#0F1117',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 99, marginBottom: 14,
            backgroundColor: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
          }}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <span style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700 }}>Loved by 5,000+ SMB Owners</span>
          </div>
          <h2 style={{
            color: '#F8FAFC', fontSize: 'clamp(26px, 3.5vw, 38px)',
            fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12,
          }}>
            Real Results for Small Business
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
            Discover how owners, accountants, and inventory managers streamline operations with FinGuard AI.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {testimonials.map((t, i) => {
            const delays = ['reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3'];
            return (
              <div
                key={t.id}
                className={`reveal ${delays[i]}`}
                style={{
                  flex: '1 1 300px',
                  padding: 28,
                  borderRadius: 20,
                  backgroundColor: 'rgba(15,23,42,0.65)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 8,
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    color: '#818CF8', fontSize: 12, fontWeight: 700,
                  }}>{t.tag}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                    ))}
                  </div>
                </div>

                <Quote size={24} color="rgba(99,102,241,0.3)" style={{ marginBottom: 10 }} />
                <p style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 1.65, marginBottom: 24, fontStyle: 'italic', flex: 1 }}>
                  {t.text}
                </p>

                {/* Author */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: '#6366F1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 800 }}>{t.name[0]}</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 700 }}>{t.name}</span>
                      <CheckCircle2 size={12} color="#10B981" />
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
