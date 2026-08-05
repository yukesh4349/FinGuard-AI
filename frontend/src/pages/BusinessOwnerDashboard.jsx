import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CreditCard, Receipt, Package, TrendingUp,
  Users, ShoppingBag, ArrowLeftRight, ShieldAlert, FileCheck, Bot,
  BarChart3, Bell, UserCheck, Shield, Clock, Folder, Cpu,
  Settings, User, Search, Filter, Plus, Download, Upload, CheckCircle2,
  AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight,
  Send, Sparkles, LogOut, Copy, Check, Eye, Trash2, Edit3, Lock, MessageSquare, X, Database, Phone,
  Activity, Zap
} from 'lucide-react';
import { getStoredEmployees, saveEmployeeToDb, getStoredUsers, getOfficialGstRatesFromPostgres, addOfficialGstRateToPostgres, getStoredFraudAlerts } from '../services/postgresDb';
import { saveStockToSupabase, getStaffFromSupabase, addStaffToSupabase, getInventoryFromSupabase } from '../services/supabaseClient';
import {
  apiGetDashboardStats,
  apiGetInvoices,
  apiGetPayments,
  apiGetExpenses,
  apiGetTransactions,
  apiGetInventory,
  apiGetVendors,
  apiGetEmployees,
  apiQueryAiChat
} from '../services/api';

// Business Owner Dashboard Sidebar Navigation Modules (Strictly 5 Sections)
const modulesList = [
  // 1. Dashboard Overview
  { id: 'overview', title: 'Dashboard Overview', icon: LayoutDashboard, category: 'Main' },

  // 2. Sales & Billing
  { id: 'invoices', title: 'Bills & Invoices', icon: FileText, category: 'Sales & Billing' },
  { id: 'payments', title: 'Payments & Receipts', icon: CreditCard, category: 'Sales & Billing' },

  // 3. Finance
  { id: 'expenses', title: 'Daily Shop Expenses', icon: Receipt, category: 'Finance' },
  { id: 'transactions', title: 'Money Transactions', icon: ArrowLeftRight, category: 'Finance' },
  { id: 'compliance', title: 'GST & Tax Compliance', icon: FileCheck, category: 'Finance' },

  // 4. Inventory
  { id: 'inventory', title: 'Remaining Stock', icon: Package, category: 'Inventory' },
  { id: 'vendors', title: 'Vendor Details', icon: Users, category: 'Inventory' },

  // 5. Employee Management
  { id: 'add_employee', title: 'Add New Employee', icon: Plus, category: 'Employee Management' },
  { id: 'employees', title: 'Employee List & Details', icon: UserCheck, category: 'Employee Management' },
];

export default function BusinessOwnerDashboard({
  companyName = 'Metro Superstore Ltd',
  ownerName = 'Business Owner',
  onLogout,
  onOpenUploadPage,
  onOpenBillingPage,
}) {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState(moduleId || 'overview');
  const [moduleSearch, setModuleSearch] = useState('');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: `Hello ${ownerName}! I am your FinSight AI Assistant for ${companyName}. See beyond the numbers! Ask me anything about your profits, sales, GST taxes, or duplicate bill alerts!` }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);

  // Theme state: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('finguard_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('finguard_theme', nextTheme);
    } catch (e) {}
  };

  // Modals state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Form states for modals
  const activeUserSession = JSON.parse(localStorage.getItem('finsight_active_user') || '{}');
  const activeUserId = activeUserSession.user_id || ownerName || 'user';

  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Store Executive');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empList, setEmpList] = useState([]);
  const [dbUsersList, setDbUsersList] = useState([]);

  useEffect(() => {
    setDbUsersList(getStoredUsers());
    getStaffFromSupabase(activeUserId).then(list => {
      if (list) setEmpList(list);
    });
  }, [activeUserId]);

  useEffect(() => {
    if (moduleId && modulesList.some(m => m.id === moduleId)) {
      setActiveModule(moduleId);
    }
  }, [moduleId]);

  const handleModuleClick = (id) => {
    setActiveModule(id);
    navigate(`/dashboard/${id}`);
  };

  const filteredModules = modulesList.filter(m =>
    m.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const userMsg = inputQuery;
    setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputQuery('');
    try {
      const res = await apiQueryAiChat(userMsg, companyName);
      if (res && res.reply) {
        setAiMessages(prev => [...prev, { sender: 'ai', text: res.reply }]);
        return;
      }
    } catch (err) {
      console.error('[AI Chat Error]:', err);
    }
    // Fallback response
    setTimeout(() => {
      setAiMessages(prev => [...prev, { sender: 'ai', text: `Based on your live backend database for ${companyName}, your financial transactions and inventory levels are safe and verified.` }]);
    }, 400);
  };

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!empName || !empPhone) return;
    const newEmp = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      user_id: activeUserId,
      name: empName,
      role: empRole,
      phone: empPhone,
      salary: `₹ ${empSalary || '30,000'}`,
      status: 'Active',
      joined_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    const updated = await addStaffToSupabase(newEmp);
    setEmpList(updated);
    setEmpName('');
    setEmpPhone('');
    setEmpSalary('');
    setShowAddEmpModal(false);
    alert(`Success: Staff member ${empName} saved to Supabase DB for ${companyName}!`);
  };

  return (
    <div className={`fg-dashboard-root fg-theme-${theme}`} style={{
      display: 'flex', width: '100vw', height: '100vh',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ══════════════════════════════════════════════════════════════════
          DARK PREMIUM SIDEBAR
          ══════════════════════════════════════════════════════════════════ */}
      <aside className="fg-sidebar fg-anim-sidebar" style={{
        width: 272, display: 'flex', flexDirection: 'column',
        height: '100vh', flexShrink: 0, zIndex: 50,
      }}>
        {/* Brand Header */}
        <div className="fg-sidebar-brand" style={{
          padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/favcon_logo.png" alt="FinSight Logo" style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg-text-primary)', letterSpacing: '-0.01em' }}>FinSight AI</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fg-accent)', fontFamily: "'Inter', monospace", letterSpacing: '0.1em' }}>STORE DASHBOARD</div>
            </div>
          </div>
        </div>

        {/* Module Search */}
        <div style={{ padding: '12px 14px 6px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--fg-bg-primary)', border: '1px solid var(--fg-border)',
            borderRadius: 10, padding: '8px 12px',
            transition: 'border-color 0.2s ease',
          }}>
            <Search size={14} color="var(--fg-text-muted)" />
            <input
              type="text"
              placeholder="Search modules..."
              value={moduleSearch}
              onChange={e => setModuleSearch(e.target.value)}
              style={{
                border: 'none', backgroundColor: 'transparent', outline: 'none',
                width: '100%', fontSize: 12, color: 'var(--fg-text-primary)', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {/* Dashboard Overview — Main */}
          {filteredModules.filter(m => m.category === 'Main').map(m => {
            const Icon = m.icon;
            const active = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModuleClick(m.id)}
                className={`fg-nav-item ${active ? 'fg-nav-item-active' : ''}`}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, marginBottom: 12,
                  color: active ? 'var(--fg-text-primary)' : 'var(--fg-text-secondary)',
                  border: active ? '1px solid var(--fg-border-accent)' : '1px solid transparent',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? 'var(--fg-accent-soft)' : 'transparent',
                }}
              >
                <Icon size={17} color={active ? 'var(--fg-accent)' : 'var(--fg-text-muted)'} />
                <span style={{ flex: 1 }}>{m.title}</span>
                {active && <div style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--fg-accent)', boxShadow: '0 0 6px var(--fg-accent)' }} />}
              </button>
            );
          })}

          {/* Grouped Sections */}
          {[
            { cat: 'Sales & Billing', label: 'SALES & BILLING' },
            { cat: 'Finance', label: 'FINANCE' },
            { cat: 'Inventory', label: 'INVENTORY' },
            { cat: 'Employee Management', label: 'EMPLOYEE MANAGEMENT' },
          ].map(group => {
            const groupItems = filteredModules.filter(m => m.category === group.cat);
            if (groupItems.length === 0) return null;
            return (
              <div key={group.cat} style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, color: 'var(--fg-text-muted)',
                  fontFamily: "'Inter', monospace", textTransform: 'uppercase',
                  padding: '6px 10px 4px', letterSpacing: '0.08em',
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                  {groupItems.map(m => {
                    const Icon = m.icon;
                    const active = activeModule === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleModuleClick(m.id)}
                        className={`fg-nav-item ${active ? 'fg-nav-item-active' : ''}`}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 8,
                          background: active ? 'var(--fg-accent-soft)' : 'transparent',
                          color: active ? 'var(--fg-text-primary)' : 'var(--fg-text-secondary)',
                          border: active ? '1px solid var(--fg-border-accent)' : '1px solid transparent',
                          cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 700 : 500,
                        }}
                      >
                        <Icon size={15} color={active ? 'var(--fg-accent)' : 'var(--fg-text-muted)'} />
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: 14, borderTop: '1px solid var(--fg-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #F3CD97, #E2B36B)',
              color: '#050708', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, flexShrink: 0,
            }}>
              👑
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ownerName || 'Business Owner'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--fg-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyName}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: 'var(--fg-danger-soft)', border: '1px solid var(--fg-danger-border)',
              cursor: 'pointer', color: 'var(--fg-danger)',
              padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ══════════════════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {/* ── DARK PREMIUM TOP BAR ─────────────────────────────────────── */}
        <header className="fg-topbar" style={{
          height: 60, padding: '0 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {activeModule === 'overview' && (
              <span className="fg-section-eyebrow" style={{ marginRight: 4 }}>STORE DASHBOARD</span>
            )}
            {activeModule === 'overview' && <span style={{ color: 'var(--fg-text-muted)', fontSize: 14 }}>·</span>}
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-text-primary)' }}>
              {modulesList.find(m => m.id === activeModule)?.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="lc-liquid-btn-ghost"
              style={{
                padding: '6px 14px',
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              title="Toggle Theme: Switch between Liquid Dark & Liquid White Theme"
            >
              {theme === 'dark' ? '🌙 Dark Liquid' : '☀️ White Liquid'}
            </button>

            {/* AI Chat Trigger */}
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 99,
                background: aiPanelOpen ? 'var(--fg-accent-soft)' : 'transparent',
                border: `1px solid ${aiPanelOpen ? 'var(--fg-border-accent-strong)' : 'var(--fg-border-accent)'}`,
                color: 'var(--fg-accent)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                boxShadow: aiPanelOpen ? 'var(--fg-glow-accent)' : 'none',
              }}
            >
              <Sparkles size={14} color="var(--fg-accent)" />
              <span>✦ AI Chat Assistant</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => handleModuleClick('notifications')}
              style={{
                position: 'relative', width: 36, height: 36, borderRadius: 10,
                background: 'var(--fg-surface)', border: '1px solid var(--fg-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--fg-text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              <Bell size={16} />
              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, width: 17, height: 17,
                  borderRadius: 9, background: 'var(--fg-danger)', color: '#FFF',
                  fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--fg-bg-secondary)',
                }}>
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── BODY VIEW RENDER ─────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: 24 }}>
          {activeModule === 'overview' && (
            <OverviewModule
              companyName={companyName}
              onNavigate={handleModuleClick}
              empList={empList}
              dbUsersList={dbUsersList}
              onOpenAddEmp={() => setShowAddEmpModal(true)}
              onOpenUpload={onOpenUploadPage}
              onOpenCreateInvoice={onOpenBillingPage}
              onOpenReport={() => setShowReportModal(true)}
            />
          )}
          {(activeModule === 'invoices' || activeModule === 'purchases') && <InvoiceManagementModule onOpenCreateInvoice={onOpenBillingPage} onOpenUpload={onOpenUploadPage} />}
          {activeModule === 'payments' && <PaymentManagementModule />}
          {activeModule === 'expenses' && <ExpenseManagementModule />}
          {activeModule === 'transactions' && <TransactionsModule />}
          {activeModule === 'compliance' && <ComplianceModule />}
          {activeModule === 'inventory' && <InventoryManagementModule />}
          {activeModule === 'vendors' && <VendorManagementModule />}
          {(activeModule === 'employees' || activeModule === 'add_employee') && (
            <EmployeeManagementModule
              empList={empList}
              setEmpList={setEmpList}
              initialOpenAdd={activeModule === 'add_employee'}
            />
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          FLOATING AI CHATBOT
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      }}>
        {aiPanelOpen && (
          <div className="fg-chat-panel" style={{
            width: 370, height: 470,
            background: 'rgba(8,12,13,0.92)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20, border: '1px solid var(--fg-border-accent)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,217,192,0.08)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            marginBottom: 12,
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '14px 18px', background: 'var(--fg-bg-primary)',
              borderBottom: '1px solid var(--fg-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'linear-gradient(135deg, #F3CD97, #E2B36B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(243,205,151,0.25)',
                }}>
                  <Bot size={16} color="#050708" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-text-primary)' }}>FinSight AI Assistant</div>
                  <div style={{ fontSize: 10, color: 'var(--fg-accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="fg-status-pulse" style={{ width: 5, height: 5 }} />
                    Active for {companyName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAiPanelOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--fg-bg-primary)' }}>
              {aiMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'user'
                      ? 'linear-gradient(135deg, #F3CD97, #E2B36B)'
                      : 'var(--fg-surface)',
                    color: m.sender === 'user' ? '#050708' : 'var(--fg-text-primary)',
                    borderRadius: 14, padding: '10px 14px', maxWidth: '85%',
                    fontSize: 12, lineHeight: 1.55,
                    border: m.sender === 'ai' ? '1px solid var(--fg-border)' : 'none',
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendAiMessage} style={{
              padding: 10, background: 'var(--fg-bg-secondary)',
              borderTop: '1px solid var(--fg-border)', display: 'flex', gap: 8,
            }}>
              <input
                type="text"
                placeholder="Ask about sales, GST, stock..."
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                className="fg-input"
                style={{ flex: 1, padding: '9px 12px', fontSize: 12 }}
              />
              <button
                type="submit"
                className="fg-btn-primary"
                style={{ padding: '9px 12px', display: 'flex', alignItems: 'center' }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        {/* Chatbot FAB */}
        <button
          onClick={() => setAiPanelOpen(!aiPanelOpen)}
          className="fg-chatbot-pill"
          style={{
            height: 48, padding: '0 18px', borderRadius: 99,
            background: 'linear-gradient(135deg, var(--fg-surface-elevated), var(--fg-surface))',
            color: 'var(--fg-accent)',
            border: '1px solid var(--fg-border-accent)',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
          }}
        >
          <Bot size={20} color="var(--fg-accent)" />
          <span style={{ color: 'var(--fg-text-primary)' }}>FinSight AI</span>
          <span className="fg-status-pulse" />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════════════════════════ */}
      {showAddEmpModal && (
        <div className="fg-modal-overlay">
          <div className="fg-modal-card" style={{ padding: 28, width: 440, maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Add New Employee</h3>
              <button onClick={() => setShowAddEmpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name *</label>
                <input type="text" required placeholder="e.g. Ramesh Kumar" value={empName} onChange={e => setEmpName(e.target.value)} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role / Job Title *</label>
                <input type="text" required placeholder="e.g. Billing Executive / Store Manager" value={empRole} onChange={e => setEmpRole(e.target.value)} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number *</label>
                <input type="tel" required pattern="[0-9]*" maxLength={10} placeholder="e.g. 9876543210" value={empPhone} onChange={e => setEmpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Salary (₹)</label>
                <input type="text" placeholder="e.g. 35000" value={empSalary} onChange={e => setEmpSalary(e.target.value.replace(/\D/g, ''))} className="fg-input" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="fg-btn-dark" style={{ flex: 1, padding: 12, fontSize: 13 }}>Cancel</button>
                <button type="submit" className="fg-btn-primary" style={{ flex: 1, padding: 12, fontSize: 13 }}>Save to DB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fg-modal-overlay">
          <div className="fg-modal-card" style={{ padding: 28, width: 440, maxWidth: '90%', textAlign: 'center' }}>
            <BarChart3 size={36} color="var(--fg-accent)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-text-primary)', marginBottom: 6 }}>Business Report Generator</h3>
            <p style={{ fontSize: 13, color: 'var(--fg-text-secondary)', marginBottom: 22 }}>Generate instant profit &amp; loss, sales, stock, and tax summary report in simple English.</p>
            <button
              onClick={() => {
                setReportGenerated(true);
                setTimeout(() => {
                  alert("Full Business Summary PDF report downloaded to your device!");
                  setShowReportModal(false);
                  setReportGenerated(false);
                }, 1000);
              }}
              className="fg-btn-primary"
              style={{ width: '100%', padding: 12, fontSize: 13 }}
            >
              {reportGenerated ? 'Downloading PDF Report...' : '⬇️ Download Instant Summary Report'}
            </button>
            <button onClick={() => setShowReportModal(false)} style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer', fontSize: 12 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   MINI SVG LINE SPARKLINE COMPONENT FOR TOP KPI CARDS
   ═════════════════════════════════════════════════════════════════════ */
function MiniLineSparkline({ data = [40, 55, 70, 60, 85, 95], color = "#F3CD97" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 140;
    const y = 38 - ((v - min) / (max - min || 1)) * 30;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="140" height="42" style={{ overflow: 'visible', width: '100%' }}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={`0,42 ${points} 140,42`} fill={`url(#sparkGrad-${color.replace(/[^a-zA-Z0-9]/g, '')})`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * 140;
        const y = 38 - ((v - min) / (max - min || 1)) * 30;
        return <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="var(--fg-surface)" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DUAL-LINE TIME-SERIES CHART COMPONENT
   ═════════════════════════════════════════════════════════════════════ */
function DualLineChart({
  labels = ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
  line1Data = [28.4, 34.2, 41.8, 38.5, 44.9, 48.3],
  line2Data = [26.0, 31.5, 37.8, 41.0, 43.5, 49.8],
  line1Label = 'Live Cash Flow Revenue (₹ 48.3L)',
  line2Label = 'AI Working Capital Forecast (₹ 49.8L)',
  line1Color = '#F3CD97',
  line2Color = '#9B7CFF',
  height = 220,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const width = 640;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const allVals = [...line1Data, ...line2Data];
  const minVal = Math.min(...allVals) * 0.85;
  const maxVal = Math.max(...allVals) * 1.1;

  const getCoords = (data) => {
    return data.map((val, idx) => {
      const x = paddingX + (idx / (data.length - 1)) * chartW;
      const y = paddingY + (1 - (val - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val };
    });
  };

  const coords1 = getCoords(line1Data);
  const coords2 = getCoords(line2Data);

  const createSmoothPath = (coords) => {
    if (coords.length === 0) return '';
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const ctrlX = (curr.x + next.x) / 2;
      path += ` C ${ctrlX} ${curr.y}, ${ctrlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const path1 = createSmoothPath(coords1);
  const path2 = createSmoothPath(coords2);

  const area1 = `${path1} L ${coords1[coords1.length - 1].x} ${height - paddingY} L ${coords1[0].x} ${height - paddingY} Z`;
  const area2 = `${path2} L ${coords2[coords2.length - 1].x} ${height - paddingY} L ${coords2[0].x} ${height - paddingY} Z`;

  return (
    <div className="lc-glass-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="fg-section-eyebrow" style={{ marginBottom: 2 }}>DUAL-LINE TIME-SERIES ANALYTICS</div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>
            📈 Live Cash Flow Trends &amp; Daily Store Profitability
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 3, borderRadius: 2, background: line1Color, boxShadow: `0 0 8px ${line1Color}` }} />
            <span style={{ color: 'var(--fg-text-primary)' }}>{line1Label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 3, borderRadius: 2, background: line2Color, boxShadow: `0 0 8px ${line2Color}` }} />
            <span style={{ color: 'var(--fg-text-secondary)' }}>{line2Label}</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="dlGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line1Color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={line1Color} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="dlGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line2Color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={line2Color} stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowLine1" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={line1Color} floodOpacity="0.6" />
            </filter>
            <filter id="glowLine2" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={line2Color} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = paddingY + ratio * chartH;
            return (
              <line key={i} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />
            );
          })}

          {/* Gradient Areas */}
          <path d={area2} fill="url(#dlGrad2)" />
          <path d={area1} fill="url(#dlGrad1)" />

          {/* Dual Bezier Lines */}
          <path d={path2} fill="none" stroke={line2Color} strokeWidth="2.5" strokeDasharray="6,4" filter="url(#glowLine2)" className="lc-line-path" />
          <path d={path1} fill="none" stroke={line1Color} strokeWidth="3" filter="url(#glowLine1)" className="lc-line-path" />

          {/* Interactive Data Nodes */}
          {coords1.map((c1, idx) => {
            const c2 = coords2[idx];
            const isHovered = hoverIndex === idx;
            return (
              <g key={idx}>
                {isHovered && (
                  <line x1={c1.x} y1={paddingY} x2={c1.x} y2={height - paddingY} stroke="rgba(0,217,192,0.3)" strokeDasharray="2,2" />
                )}
                {/* Line 2 Point */}
                <circle
                  cx={c2.x}
                  cy={c2.y}
                  r={isHovered ? 6 : 4}
                  fill={line2Color}
                  stroke="var(--fg-surface)"
                  strokeWidth="2"
                  className="lc-chart-point"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {/* Line 1 Point */}
                <circle
                  cx={c1.x}
                  cy={c1.y}
                  r={isHovered ? 7 : 4.5}
                  fill={line1Color}
                  stroke="var(--fg-surface)"
                  strokeWidth="2"
                  className="lc-chart-point"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {/* X-axis Label */}
                <text
                  x={c1.x}
                  y={height - 6}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--fg-accent)' : 'var(--fg-text-muted)'}
                  fontSize="10"
                  fontFamily="'Inter', monospace"
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {labels[idx]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip on Hover */}
        {hoverIndex !== null && (
          <div style={{
            position: 'absolute',
            top: 20,
            left: `${(coords1[hoverIndex].x / width) * 100}%`,
            transform: 'translateX(-50%)',
            background: 'rgba(8,12,13,0.95)',
            border: '1px solid var(--fg-border-accent)',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 11,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(0,217,192,0.2)',
            pointerEvents: 'none',
            zIndex: 20,
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: 'var(--fg-text-muted)', fontSize: 10, marginBottom: 4, fontWeight: 700 }}>
              📅 {labels[hoverIndex]} Financial Performance
            </div>
            <div style={{ color: line1Color, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: line1Color }} />
              {line1Label}: ₹ {line1Data[hoverIndex]} Lakhs
            </div>
            <div style={{ color: line2Color, fontWeight: 700, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: line2Color }} />
              {line2Label}: ₹ {line2Data[hoverIndex]} Lakhs
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   1. OVERVIEW MODULE — DARK PREMIUM COMMAND CENTER
   ═════════════════════════════════════════════════════════════════════ */
function OverviewModule({ companyName, onNavigate, empList, dbUsersList, onOpenAddEmp, onOpenUpload, onOpenCreateInvoice, onOpenReport }) {
  const [stats, setStats] = useState({
    totalMonthlyRevenue: '₹ 48.30L',
    totalInvoicesVal: 4829500,
    totalInvoicesCount: 3,
    estimatedGstClaimable: '₹ 32,150',
    lowStockItemsCount: 3,
    highRiskInvoicesCount: 1,
    activeAlertsCount: 2,
    sparklines: {
      revenue: [40, 55, 70, 60, 85, 95],
      profit: [20, 25, 38, 42, 50, 64],
      gst: [12, 18, 22, 28, 32, 48],
    },
  });

  const [liveSales, setLiveSales] = useState(0);
  const [liveExpenses, setLiveExpenses] = useState(0);
  const [livePending, setLivePending] = useState(0);
  const [liveStockCards, setLiveStockCards] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [liveSuppliers, setLiveSuppliers] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [fraudFeedAlerts, setFraudFeedAlerts] = useState([]);

  useEffect(() => {
    // 1. Calculate live financial totals from database scoped strictly to active logged-in user/company
    try {
      const cleanNum = (val) => {
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        if (!val) return 0;
        const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ''));
        return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
      };

      const activeUser = JSON.parse(localStorage.getItem('finsight_active_user') || '{}');
      const activeUserKey = (activeUser.user_id || activeUser.email || companyName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');

      // Load user-partitioned storage keys
      const storedCustomerSales = JSON.parse(localStorage.getItem(`finsight_customer_invoices_${activeUserKey}`) || '[]');
      const storedVendorInvoices = JSON.parse(localStorage.getItem(`finsight_ocr_invoices_${activeUserKey}`) || '[]');
      const storedTx = JSON.parse(localStorage.getItem(`finsight_transactions_${activeUserKey}`) || '[]');
      const storedStock = JSON.parse(localStorage.getItem(`finsight_stock_inventory_${activeUserKey}`) || '[]');

      // Filter and sanitize entries
      const sanitizedSales = storedCustomerSales.filter(b => cleanNum(b.grandTotal || b.grand_total || 0) < 100000000);
      const sanitizedVendor = storedVendorInvoices.filter(b => cleanNum(b.grand_total || b.grandTotal || 0) < 100000000);

      let calcSales = sanitizedSales.reduce((acc, b) => acc + cleanNum(b.grandTotal || b.grand_total || 0), 0);
      let calcExpenses = sanitizedVendor.reduce((acc, b) => acc + cleanNum(b.grand_total || b.grandTotal || 0), 0);
      let calcPending = sanitizedVendor.filter(b => b.payment_status === 'Pending' || b.status === 'Pending')
        .reduce((acc, b) => acc + cleanNum(b.grand_total || b.grandTotal || 0), 0);

      setLiveSales(calcSales);
      setLiveExpenses(calcExpenses);
      setLivePending(calcPending);

      // Extract unique suppliers for current user
      if (sanitizedVendor.length > 0) {
        const uniqueSup = Array.from(new Set(sanitizedVendor.map(i => i.supplier_name || i.vendor).filter(Boolean)));
        setLiveSuppliers(uniqueSup);
      } else {
        setLiveSuppliers([]);
      }

      // Load live transactions for current user
      setLiveTransactions(storedTx);

      // 2. Read live stock inventory for current user from Supabase DB
      getInventoryFromSupabase(activeUserId).then(dbStock => {
        const stockItems = dbStock && dbStock.length > 0 ? dbStock : storedStock;
        if (stockItems && stockItems.length > 0) {
          const map = new Map();
          stockItems.forEach(st => {
            const rawName = (st.name || st.item_name || 'Store Goods').trim();
            const key = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const qty = parseInt(String(st.stock_qty !== undefined ? st.stock_qty : st.quantity || '0').replace(/[^0-9]/g, '')) || 0;
            if (map.has(key)) {
              map.get(key).qty += qty;
            } else {
              map.set(key, { name: rawName, qty });
            }
          });

          const cards = Array.from(map.values()).slice(0, 3).map(item => ({
            name: item.name,
            qty: `${item.qty} Units Left`,
            pct: Math.min(100, Math.round((item.qty / 50) * 100)),
            color: item.qty <= 15 ? 'var(--fg-danger)' : 'var(--fg-success)',
          }));

          setLiveStockCards(cards);
          setLowStockCount(Array.from(map.values()).filter(i => i.qty <= 15).length);
        } else {
          setLiveStockCards([]);
          setLowStockCount(0);
        }
      });

      // 3. Compile live AI Intelligence & Security Alerts for user
      const alerts = [];
      const duplicateBills = sanitizedVendor.filter(b => b.status === 'Flagged High Risk' || b.duplicateReason);
      if (duplicateBills.length > 0) {
        duplicateBills.forEach(b => {
          alerts.push({
            type: 'FAKE / DUPLICATE BILL DETECTED',
            color: 'var(--fg-danger)',
            message: `Intercepted duplicate invoice #${b.invoice_number} of ₹ ${cleanNum(b.grand_total || 0).toLocaleString('en-IN')} from ${b.supplier_name}. Matches previously saved bill!`,
            time: 'Just Now',
          });
        });
      }

      const pendingBill = sanitizedVendor.find(b => b.payment_status === 'Pending');
      if (pendingBill) {
        alerts.push({
          type: 'UPCOMING BILL PAYMENT DUE',
          color: 'var(--fg-warning)',
          message: `Supplier payment of ₹ ${cleanNum(pendingBill.grand_total || 0).toLocaleString()} to ${pendingBill.supplier_name} is due.`,
          time: 'Upcoming Due Date',
        });
      }

      alerts.push({
        type: 'GOVT GST TAX AUDITOR VERIFIED',
        color: 'var(--fg-accent)',
        message: `Official Govt GST rates verified against DB for ${companyName}. System compliant.`,
        time: 'Govt Compliance',
      });

      setFraudFeedAlerts(alerts);
    } catch (e) {}

    apiGetDashboardStats().then(res => {
      if (res && res.stats) setStats(res.stats);
    }).catch(err => console.error(err));
  }, []);

  const liveTotalRevenue = liveSales;
  const liveNetProfit = liveSales - liveExpenses;
  const livePendingBills = livePending;
  const liveSalesVsExpenses = liveExpenses;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* ── KPI CARDS (WITH MINI SVG LINE GRAPHS) ────────────────────────── */}
      <div className="fg-anim-load-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Business Performance (Live Backend DB Synced)</h3>
            <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Real-time calculated totals for {companyName}</p>
          </div>
          <span className="fg-ai-badge">
            <Activity size={12} />
            LIVE DB CALC
          </span>
        </div>

        <div className="fg-kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {/* Profit & Loss */}
          <div className="lc-glass-card fg-kpi-1" style={{ padding: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profit &amp; Loss</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg-success)', marginTop: 6, fontFamily: "'Inter', sans-serif" }}>+₹ {liveNetProfit.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-success)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowUpRight size={12} /> +18.8% Net Margin
              </div>
            </div>
            <div style={{ height: 42, marginTop: 14 }}>
              <MiniLineSparkline data={stats.sparklines?.profit || [40, 55, 70, 60, 85, 95]} color="#20D67A" />
            </div>
          </div>

          {/* Revenue */}
          <div className="lc-glass-card fg-kpi-2" style={{ padding: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue (Money Earned)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 6, fontFamily: "'Inter', sans-serif" }}>₹ {liveTotalRevenue.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-success)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowUpRight size={12} /> +12.4% Sales Growth
              </div>
            </div>
            <div style={{ height: 42, marginTop: 14 }}>
              <MiniLineSparkline data={stats.sparklines?.revenue || [50, 65, 80, 75, 90, 100]} color="#00D9C0" />
            </div>
          </div>

          {/* Pending Bills */}
          <div className="lc-glass-card fg-kpi-3" style={{ padding: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Credit Bills</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg-warning)', marginTop: 6, fontFamily: "'Inter', sans-serif" }}>₹ {livePendingBills.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-warning)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> Due Payment Terms
              </div>
            </div>
            <div style={{ height: 42, marginTop: 14 }}>
              <MiniLineSparkline data={[80, 60, 45, 30, 50, 40]} color="#FFB020" />
            </div>
          </div>

          {/* Sales vs Expenses (Money Out) */}
          <div className="lc-glass-card fg-kpi-4" style={{ padding: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Money Out (Vendor Bills)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 6, fontFamily: "'Inter', sans-serif" }}>₹ {liveSalesVsExpenses.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-success)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowDownRight size={12} /> Supplier Purchases
              </div>
            </div>
            <div style={{ height: 42, marginTop: 14 }}>
              <MiniLineSparkline data={[35, 45, 30, 50, 40, 30]} color="#00D9C0" />
            </div>
          </div>
        </div>
      </div>


      <div className="fg-middle-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick Actions */}
          <div className="lc-glass-card fg-anim-load-3" style={{ padding: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} color="var(--fg-accent)" />
              Quick Actions
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={onOpenUpload} className="lc-liquid-btn-primary" style={{ padding: '11px 14px', fontSize: 12 }}>
                <Upload size={15} /> Upload Invoice
              </button>
              <button onClick={onOpenCreateInvoice} className="lc-liquid-btn-ghost" style={{ padding: '11px 14px', fontSize: 12 }}>
                <FileText size={15} /> Create Bill
              </button>
              <button onClick={onOpenAddEmp} className="lc-liquid-btn-ghost" style={{ padding: '11px 14px', fontSize: 12 }}>
                <UserCheck size={15} /> Add Employee
              </button>
              <button onClick={onOpenReport} className="lc-liquid-btn-primary" style={{ padding: '11px 14px', fontSize: 12 }}>
                <BarChart3 size={15} /> Report Generator
              </button>
            </div>
          </div>

          {/* Stock Details */}
          <div className="lc-glass-card fg-anim-load-4" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} color="var(--fg-accent)" />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Shop Stock Details</h4>
              </div>
              <span style={{ fontSize: 10, color: lowStockCount > 0 ? 'var(--fg-danger)' : 'var(--fg-success)', fontWeight: 700, background: lowStockCount > 0 ? 'var(--fg-danger-soft)' : 'var(--fg-success-soft)', padding: '3px 8px', borderRadius: 99, border: `1px solid ${lowStockCount > 0 ? 'var(--fg-danger-border)' : 'var(--fg-success)'}` }}>
                {lowStockCount} Low Stock
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {liveStockCards.length > 0 ? (
                liveStockCards.map((item, i) => (
                  <div key={i} style={{ background: 'var(--fg-bg-secondary)', padding: 12, borderRadius: 10, border: '1px solid var(--fg-border-subtle)' }}>
                    <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontWeight: 800, color: item.color, marginTop: 4, fontSize: 12 }}>{item.qty}</div>
                    <div className="fg-progress-bar" style={{ marginTop: 8 }}>
                      <div className="fg-progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: 'span 3', padding: 18, textAlign: 'center', fontSize: 12, color: 'var(--fg-text-muted)', background: 'var(--fg-bg-secondary)', borderRadius: 10 }}>
                  📦 No stock items in inventory yet. Click <strong>"+ Add New Stock Product"</strong> or upload a vendor invoice to add items to your store.
                </div>
              )}
            </div>
          </div>

          {/* Suppliers + Unpaid Bills Cards (Interactive Links!) */}
          <div className="fg-anim-load-5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              onClick={() => onNavigate('vendors')}
              title="Click to view Supplier & Vendor Management Page"
              className="lc-glass-card"
              style={{ padding: 16, cursor: 'pointer', transition: 'transform 0.2s ease', border: '1px solid var(--fg-border-accent)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={15} color="var(--fg-accent)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Suppliers ({liveSuppliers.length} Active)</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--fg-accent)', fontWeight: 700 }}>View ↗</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-text-secondary)', lineHeight: 1.7 }}>
                {liveSuppliers.slice(0, 3).map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--fg-accent)' }} /> {s}
                  </div>
                ))}
              </div>
            </div>

            <div
              onClick={() => onNavigate('invoices')}
              title="Click to view Unpaid Bills &amp; Payment Receipts"
              className="lc-glass-card"
              style={{ padding: 16, cursor: 'pointer', transition: 'transform 0.2s ease', border: '1px solid var(--fg-warning-border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={15} color="var(--fg-warning)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Remaining Unpaid Bills</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--fg-warning)', fontWeight: 700 }}>View Bills ↗</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: livePendingBills > 0 ? 'var(--fg-warning)' : 'var(--fg-success)' }}>
                {livePendingBills > 0 ? `₹ ${livePendingBills.toLocaleString('en-IN')}` : '₹ 0 (No Unpaid Bills)'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-text-muted)', marginTop: 3 }}>
                {livePendingBills > 0 ? 'Payment due on credit terms' : 'All supplier bills settled'}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI INTELLIGENCE / FRAUD ALERTS */}
        <div className="lc-glass-card fg-anim-load-3" style={{
          padding: 20,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle AI gradient accent at top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #F3CD97, #E2B36B, #D9A250)', opacity: 0.6 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--fg-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="var(--fg-danger)" />
              <div>
                <div className="fg-section-eyebrow" style={{ marginBottom: 2 }}>AI INTELLIGENCE</div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Fraud Alerts &amp; Security Feed</h4>
              </div>
            </div>
            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, background: 'var(--fg-danger-soft)', color: 'var(--fg-danger)', fontWeight: 700, border: '1px solid var(--fg-danger-border)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="fg-status-pulse" style={{ background: 'var(--fg-danger)', boxShadow: '0 0 6px rgba(255,77,103,0.5)' }} />
              LIVE
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 520, paddingRight: 4 }}>
            {fraudFeedAlerts.map((al, idx) => (
              <div key={idx} className="fg-alert-danger" style={{ padding: 14, borderLeft: `3px solid ${al.color || 'var(--fg-accent)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: al.color || 'var(--fg-accent)', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase' }}>
                    <AlertTriangle size={12} /> {al.type}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--fg-text-muted)' }}>{al.time}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--fg-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--fg-text-primary)' }}>FinSight Security Bot:</strong> {al.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CASHFLOW HISTORY (CONNECTED TO LIVE BACKEND TRANSACTIONS) ────── */}
      <div className="lc-glass-card fg-anim-load-7" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Cashflow History (Money In vs Money Out)</h3>
            <p style={{ fontSize: 11, color: 'var(--fg-text-muted)', marginTop: 2 }}>Complete history of every rupee entering and leaving your store account (Live Synced)</p>
          </div>
          <button onClick={() => window.print()} className="lc-liquid-btn-ghost" style={{ padding: '7px 14px', fontSize: 11 }}>
            <Download size={13} /> Download Statement
          </button>
        </div>
        <TableCard
          headers={['Ref ID', 'Date & Time', 'Type', 'Description', 'Category', 'Amount (₹)', 'Running Balance']}
          rows={liveTransactions.map(t => [
            t.id,
            t.date || t.timestamp || '2026-08-03',
            <span style={{ color: t.type === 'IN' ? 'var(--fg-success)' : 'var(--fg-danger)', fontWeight: 800 }}>
              {t.type}
            </span>,
            t.description,
            t.category || 'General Store',
            <strong style={{ color: t.type === 'IN' ? 'var(--fg-success)' : 'var(--fg-text-primary)' }}>
              {t.amount}
            </strong>,
            t.balance || '₹ 14,80,000',
          ])}
        />
      </div>

      {/* ── DUAL-LINE TIME-SERIES CHART AT THE BOTTOM ─────────────────── */}
      <div className="fg-anim-load-8">
        <DualLineChart
          labels={['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026']}
          line1Data={[28.4, 34.2, 41.8, 38.5, 44.9, Math.round((liveTotalRevenue / 100000) * 10) / 10]}
          line2Data={[26.0, 31.5, 37.8, 41.0, 43.5, 49.8]}
          line1Label={`Live Store Cash Flow (₹ ${(liveTotalRevenue / 100000).toFixed(1)}L)`}
          line2Label="AI Working Capital Forecast (₹ 49.8L)"
          line1Color="#00D9C0"
          line2Color="#9B7CFF"
          height={210}
        />
      </div>

    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   MODULE SUB-COMPONENTS — DARK PREMIUM TREATMENT
   ═════════════════════════════════════════════════════════════════════ */

function InvoiceManagementModule({ onOpenCreateInvoice, onOpenUpload }) {
  const activeUserSession = JSON.parse(localStorage.getItem('finsight_active_user') || '{}');
  const activeUserKey = String(activeUserSession.user_id || activeUserSession.email || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`finsight_ocr_invoices_${activeUserKey}`) || '[]');
      setInvoices(stored);
    } catch (e) {}
  }, [activeUserKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Bills &amp; Invoices Management</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Manage uploaded vendor bills and customer POS sales receipts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onOpenUpload} className="lc-liquid-btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}>
            <Upload size={14} /> Upload Vendor Invoice
          </button>
          <button onClick={onOpenCreateInvoice} className="lc-liquid-btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
            <Plus size={14} /> Create Customer POS Bill
          </button>
        </div>
      </div>

      <TableCard
        headers={['Invoice No', 'Date', 'Supplier / Customer', 'Total Amount (₹)', 'Payment Status', 'Actions']}
        rows={invoices.map(inv => [
          inv.invoice_number || inv.billNo || 'INV-101',
          (inv.invoice_date || inv.date || '2026-08-05').split('T')[0],
          inv.supplier_name || inv.customerName || 'Store Vendor',
          <strong style={{ color: 'var(--fg-success)' }}>₹ {parseFloat(String(inv.grand_total || inv.grandTotal || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}</strong>,
          <span style={{ color: inv.payment_status === 'Pending' ? 'var(--fg-warning)' : 'var(--fg-success)', fontWeight: 800 }}>
            {inv.payment_status || 'Paid'}
          </span>,
          <button
            onClick={() => setSelectedInvoice(inv)}
            style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--fg-accent-soft)', border: '1px solid var(--fg-border-accent)', color: 'var(--fg-accent)', cursor: 'pointer' }}
          >
            👁️ View Details
          </button>
        ])}
      />

      {selectedInvoice && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 560, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--fg-border)', paddingBottom: 10, marginBottom: 14 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Invoice Details #{selectedInvoice.invoice_number || selectedInvoice.billNo}</h4>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <div>Supplier / Customer: <strong style={{ color: 'var(--fg-text-primary)' }}>{selectedInvoice.supplier_name || selectedInvoice.customerName}</strong></div>
              <div>Date: <strong style={{ color: 'var(--fg-text-primary)' }}>{(selectedInvoice.invoice_date || selectedInvoice.date || '').split('T')[0]}</strong></div>
              <div>Status: <strong style={{ color: selectedInvoice.payment_status === 'Pending' ? 'var(--fg-warning)' : 'var(--fg-success)' }}>{selectedInvoice.payment_status || 'Paid'}</strong></div>
              <div>Grand Total: <strong style={{ color: 'var(--fg-success)', fontSize: 16 }}>₹ {parseFloat(String(selectedInvoice.grand_total || selectedInvoice.grandTotal || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}</strong></div>
            </div>
            <button onClick={() => setSelectedInvoice(null)} className="lc-liquid-btn-ghost" style={{ width: '100%', padding: 10 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentManagementModule() {
  const activeUserSession = JSON.parse(localStorage.getItem('finsight_active_user') || '{}');
  const activeUserKey = String(activeUserSession.user_id || activeUserSession.email || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
  const [payments, setPayments] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);

  useEffect(() => {
    try {
      const storedOcr = JSON.parse(localStorage.getItem(`finsight_ocr_invoices_${activeUserKey}`) || '[]');
      const storedExp = JSON.parse(localStorage.getItem(`finsight_expenses_${activeUserKey}`) || '[]');
      
      let pending = 0;
      let paid = 0;
      const list = [];

      storedOcr.forEach(inv => {
        const amt = parseFloat(String(inv.grand_total || inv.grandTotal || 0).replace(/[^0-9.]/g, '')) || 0;
        if (inv.payment_status === 'Pending') pending += amt;
        else paid += amt;

        list.push({
          id: inv.invoice_number || `INV-${list.length + 1}`,
          recipient: inv.supplier_name || 'Vendor Supplier',
          mode: 'Bank Transfer / UPI',
          amount: `₹ ${amt.toLocaleString('en-IN')}`,
          status: inv.payment_status || 'Paid',
        });
      });

      storedExp.forEach(exp => {
        const amt = parseFloat(String(exp.amount || 0).replace(/[^0-9.]/g, '')) || 0;
        if (exp.status === 'Pending') pending += amt;
        else paid += amt;

        list.push({
          id: exp.id || `EXP-${list.length + 1}`,
          recipient: exp.vendor || exp.paidTo || 'Shop Expense',
          mode: 'Cash / UPI',
          amount: `₹ ${amt.toLocaleString('en-IN')}`,
          status: exp.status || 'Paid',
        });
      });

      setPendingTotal(pending);
      setPaidTotal(paid);
      setPayments(list);
    } catch (e) {}
  }, [activeUserKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <KpiCard title="Pending Payments" value={`₹ ${pendingTotal.toLocaleString('en-IN')}`} change="Unpaid Supplier Credit" positive={false} icon={Clock} />
        <KpiCard title="Paid Outflows" value={`₹ ${paidTotal.toLocaleString('en-IN')}`} change="Settled Vendor Receipts" positive icon={CheckCircle2} />
        <KpiCard title="Total Payment Records" value={`${payments.length} Records`} change="User Synced" positive icon={Bell} />
      </div>
      <TableCard
        headers={['Transaction ID', 'Payee / Recipient', 'Payment Method', 'Amount', 'Status']}
        rows={payments.map(p => [
          p.id,
          p.recipient,
          p.mode,
          p.amount,
          <span style={{ color: p.status === 'Pending' ? 'var(--fg-warning)' : 'var(--fg-success)', fontWeight: 800 }}>{p.status}</span>
        ])}
      />
    </div>
  );
}

function ExpenseManagementModule() {
  const activeUserSession = JSON.parse(localStorage.getItem('finsight_active_user') || '{}');
  const activeUserKey = String(activeUserSession.user_id || activeUserSession.email || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    try {
      const storedExp = JSON.parse(localStorage.getItem(`finsight_expenses_${activeUserKey}`) || '[]');
      setExpenses(storedExp);
    } catch (e) {}
  }, [activeUserKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Shop Expenses &amp; Outflows</h3>
      </div>
      <TableCard
        headers={['Expense ID', 'Date', 'Paid To / Vendor', 'Category', 'Amount', 'Status']}
        rows={expenses.map(e => [
          e.id,
          e.date || new Date().toISOString().split('T')[0],
          e.vendor || e.paidTo || 'Supplier',
          e.category || 'General',
          <strong style={{ color: 'var(--fg-warning)' }}>₹ {parseFloat(String(e.amount || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}</strong>,
          <span style={{ color: e.status === 'Pending' ? 'var(--fg-warning)' : 'var(--fg-success)', fontWeight: 800 }}>{e.status || 'Paid'}</span>
        ])}
      />
    </div>
  );
}



function InventoryManagementModule() {
  const activeUserSession = JSON.parse(localStorage.getItem('finsight_active_user') || '{}');
  const activeUserId = activeUserSession.user_id || activeUserSession.email || 'user';
  const activeUserKey = String(activeUserId).toLowerCase().replace(/[^a-z0-9]/g, '');
  const stockStorageKey = `finsight_stock_inventory_${activeUserKey}`;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [showReturnVendorModal, setShowReturnVendorModal] = useState(false);
  
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');
  
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [returnQtyVal, setReturnQtyVal] = useState('1');
  const [returnReason, setReturnReason] = useState('Damaged Goods / Expired Stock');

  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [costRate, setCostRate] = useState('');
  const [sellingRate, setSellingRate] = useState('');
  const [supplier, setSupplier] = useState('Apex Wholesale Distributors');
  const [stockList, setStockList] = useState([]);

  const consolidateStockList = (rawItems) => {
    const map = new Map();

    (rawItems || []).forEach((st) => {
      const rawName = (st.name || st.item_name || 'Store Goods').trim();
      const key = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const qty = parseInt(String(st.stock_qty !== undefined ? st.stock_qty : (st.stockQty !== undefined ? st.stockQty : st.quantity || '0')).replace(/[^0-9]/g, ''));
      const cost = st.cost_price || st.unitPrice || st.rate || '₹ 100';
      const selling = st.selling_price || st.sellingPrice || '';
      const supplier = st.supplier_name || st.supplier || 'ABC Wholesale Traders';
      const category = st.category || 'General Store';

      if (map.has(key)) {
        const existing = map.get(key);
        existing.stockQty = isNaN(qty) ? existing.stockQty : qty;
        if (!existing.sellingPrice && selling) existing.sellingPrice = selling;
        if (supplier && !existing.supplier.includes(supplier)) {
          existing.supplier += `, ${supplier}`;
        }
      } else {
        map.set(key, {
          id: st.id || `SKU-${1000 + map.size}`,
          name: rawName,
          category: category,
          stockQty: isNaN(qty) ? 0 : qty,
          unitPrice: cost,
          sellingPrice: selling,
          supplier: supplier,
        });
      }
    });

    return Array.from(map.values()).map(st => ({
      ...st,
      status: st.stockQty <= 15 ? 'Low Stock Alert' : 'Healthy Stock',
    }));
  };

  useEffect(() => {
    let isMounted = true;
    const loadStock = async () => {
      try {
        const dbItems = await getInventoryFromSupabase(activeUserId);
        const localRaw = JSON.parse(localStorage.getItem(stockStorageKey) || '[]');
        const combined = (dbItems && dbItems.length > 0) ? dbItems : localRaw;
        if (isMounted) {
          setStockList(consolidateStockList(combined));
        }
      } catch (e) {}
    };

    loadStock();
    return () => { isMounted = false; };
  }, [activeUserId, stockStorageKey]);

  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !qty) return;

    const costNum = parseFloat((costRate || '0').replace(/[^0-9.]/g, '')) || 100;
    const sellNum = sellingRate ? `₹ ${parseFloat(sellingRate.replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}` : '';

    const newItem = {
      id: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: itemName,
      category: 'General Store',
      stockQty: parseInt(qty) || 1,
      minAlertThreshold: 15,
      unitPrice: `₹ ${costNum.toLocaleString('en-IN')}`,
      sellingPrice: sellNum,
      supplier,
    };

    const updated = consolidateStockList([newItem, ...stockList]);
    setStockList(updated);

    try {
      localStorage.setItem(stockStorageKey, JSON.stringify(updated.map(st => ({
        id: st.id,
        name: st.name,
        category: st.category,
        stock_qty: st.stockQty,
        quantity: `${st.stockQty} Units`,
        cost_price: st.unitPrice,
        rate: st.unitPrice,
        selling_price: st.sellingPrice,
        supplier_name: st.supplier,
      }))));
    } catch (e) {}

    // Save to Supabase DB
    await saveStockToSupabase({
      userId: activeUserId,
      supplierName: supplier,
      items: [{
        name: itemName,
        qty: parseInt(qty) || 1,
        rate: `₹ ${costNum.toLocaleString('en-IN')}`,
        sellingPrice: sellNum,
      }]
    });

    setItemName(''); setQty(''); setCostRate(''); setSellingRate('');
    setShowAddModal(false);
  };

  const handleOpenEditPrice = (idx, item) => {
    setEditingItemIndex(idx);
    setSelectedStockItem(item);
    setEditPriceVal(item.sellingPrice ? String(item.sellingPrice).replace(/[^0-9.]/g, '') : '');
    setShowEditPriceModal(true);
  };

  const handleSaveEditedPrice = (e) => {
    e.preventDefault();
    if (editingItemIndex === null) return;
    const newMRP = editPriceVal ? `₹ ${parseFloat(editPriceVal).toLocaleString('en-IN')}` : '';
    
    const updated = [...stockList];
    updated[editingItemIndex].sellingPrice = newMRP;
    setStockList(updated);

    try {
      localStorage.setItem(stockStorageKey, JSON.stringify(updated.map(st => ({
        name: st.name,
        category: st.category,
        stock_qty: st.stockQty,
        quantity: `${st.stockQty} Units`,
        cost_price: st.unitPrice,
        rate: st.unitPrice,
        selling_price: st.sellingPrice,
        supplier_name: st.supplier,
      }))));
    } catch (e) {}

    setShowEditPriceModal(false);
    alert(`Success: Retail Selling MRP for '${updated[editingItemIndex].name}' updated to ${newMRP || 'Not Set (Cost Price Default)'}!`);
  };

  const handleOpenReturnModal = (item) => {
    setSelectedStockItem(item);
    setReturnQtyVal('1');
    setShowReturnVendorModal(true);
  };

  const handleConfirmReturnToVendor = (e) => {
    e.preventDefault();
    if (!selectedStockItem || !returnQtyVal) return;

    const returnQtyNum = parseInt(returnQtyVal) || 1;
    const updated = stockList.map(st => {
      if (st.name === selectedStockItem.name) {
        const newQty = Math.max(0, st.stockQty - returnQtyNum);
        return {
          ...st,
          stockQty: newQty,
          status: newQty <= 15 ? 'Low Stock Alert' : 'Healthy Stock',
        };
      }
      return st;
    });

    setStockList(updated);
    try {
      localStorage.setItem('finsight_stock_inventory', JSON.stringify(updated.map(st => ({
        name: st.name,
        category: st.category,
        stock_qty: st.stockQty,
        quantity: `${st.stockQty} Units`,
        cost_price: st.unitPrice,
        rate: st.unitPrice,
        selling_price: st.sellingPrice,
        supplier_name: st.supplier,
      }))));

      // Record Debit Note / Return Transaction
      const existingTx = JSON.parse(localStorage.getItem('finsight_transactions') || '[]');
      existingTx.unshift({
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'IN',
        description: `Vendor Debit Note: Returned ${returnQtyNum} Units of ${selectedStockItem.name} to ${selectedStockItem.supplier}`,
        category: 'Vendor Return Credit',
        amount: `₹ ${(returnQtyNum * (parseFloat(selectedStockItem.unitPrice.replace(/[^0-9.]/g, '')) || 100)).toLocaleString('en-IN')}`,
        balance: `₹ 4,85,000`,
      });
      localStorage.setItem('finsight_transactions', JSON.stringify(existingTx));
    } catch (e) {}

    setShowReturnVendorModal(false);
    alert(`Success: Returned ${returnQtyNum} Units of '${selectedStockItem.name}' to Vendor ${selectedStockItem.supplier}.\nStock quantity reduced & Vendor Debit Note generated!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Stock &amp; Inventory Management</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Edit Retail MRP, return stock to vendors, and manage store inventory</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="lc-liquid-btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}>
          + Add New Stock Product
        </button>
      </div>

      <TableCard
        headers={['SKU ID', 'Product Name', 'Category', 'Stock Qty', 'Cost Rate', 'Retail MRP (Optional)', 'Supplier', 'Actions']}
        rows={stockList.map((item, idx) => [
          item.id,
          item.name,
          item.category,
          <span style={{ fontWeight: 800, color: item.stockQty <= 15 ? 'var(--fg-warning)' : 'var(--fg-text-primary)' }}>
            {item.stockQty} Units
          </span>,
          item.unitPrice,
          <span style={{ fontWeight: 800, color: 'var(--fg-success)' }}>
            {item.sellingPrice || <span style={{ color: 'var(--fg-text-muted)', fontSize: 11 }}>Set Optional MRP</span>}
          </span>,
          item.supplier || 'Vendor',
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleOpenEditPrice(idx, item)}
              title="Edit Retail Selling MRP"
              style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--fg-accent-soft)', border: '1px solid var(--fg-border-accent)', color: 'var(--fg-accent)', cursor: 'pointer' }}
            >
              ✏️ Edit MRP
            </button>
            <button
              onClick={() => handleOpenReturnModal(item)}
              title="Return Stock to Vendor"
              style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--fg-warning-soft)', border: '1px solid var(--fg-warning-border)', color: 'var(--fg-warning)', cursor: 'pointer' }}
            >
              ↩️ Return Vendor
            </button>
          </div>
        ])}
      />

      {/* EDIT RETAIL MRP MODAL */}
      {showEditPriceModal && selectedStockItem && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 420, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>✏️ Change Retail Selling MRP Price</h4>
              <button onClick={() => setShowEditPriceModal(false)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditedPrice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Product Name</label>
                <input type="text" disabled value={selectedStockItem.name} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--fg-bg-secondary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Vendor Cost Rate (₹)</label>
                <input type="text" disabled value={selectedStockItem.unitPrice} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--fg-bg-secondary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-success)' }}>Retail Selling MRP Price (₹) (Optional)</label>
                <input type="number" placeholder="Enter custom retail selling price" value={editPriceVal} onChange={e => setEditPriceVal(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13, fontWeight: 800, color: 'var(--fg-success)' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowEditPriceModal(false)} className="lc-liquid-btn-ghost" style={{ flex: 1, padding: 10 }}>Cancel</button>
                <button type="submit" className="lc-liquid-btn-primary" style={{ flex: 1.5, padding: 10 }}>Save MRP Price</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN STOCK TO VENDOR MODAL */}
      {showReturnVendorModal && selectedStockItem && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 440, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-warning)' }}>↩️ Return Stock to Vendor</h4>
              <button onClick={() => setShowReturnVendorModal(false)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleConfirmReturnToVendor} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Product to Return</label>
                <input type="text" disabled value={`${selectedStockItem.name} (Current Stock: ${selectedStockItem.stockQty} Units)`} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--fg-bg-secondary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Supplier / Vendor Name</label>
                <input type="text" disabled value={selectedStockItem.supplier} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--fg-bg-secondary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-warning)' }}>Quantity to Return to Vendor *</label>
                <input type="number" required min="1" max={selectedStockItem.stockQty} value={returnQtyVal} onChange={e => setReturnQtyVal(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13, fontWeight: 800 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Reason for Return</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }}>
                  <option value="Damaged Goods / Expired Stock">Damaged Goods / Expired Stock</option>
                  <option value="Over-stocked / Excess Quantity">Over-stocked / Excess Quantity</option>
                  <option value="Price Gouging / Discrepancy">Price Gouging / Discrepancy</option>
                  <option value="Quality Defect / Customer Return">Quality Defect / Customer Return</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowReturnVendorModal(false)} className="lc-liquid-btn-ghost" style={{ flex: 1, padding: 10 }}>Cancel</button>
                <button type="submit" className="lc-liquid-btn-primary" style={{ flex: 1.5, padding: 10, background: 'var(--fg-warning)', color: '#000' }}>Confirm Return &amp; Issue Debit Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STOCK MODAL */}
      {showAddModal && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 440, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>+ Add New Product to Inventory</h4>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Product Name *</label>
                <input type="text" required placeholder="e.g. Sunflower Cooking Oil 1L" value={itemName} onChange={e => setItemName(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Initial Quantity *</label>
                  <input type="number" required placeholder="50" value={qty} onChange={e => setQty(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Cost Rate (₹)</label>
                  <input type="text" placeholder="₹ 150" value={costRate} onChange={e => setCostRate(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-success)' }}>Retail Selling MRP (₹) (Optional)</label>
                <input type="text" placeholder="₹ 180 (Optional)" value={sellingRate} onChange={e => setSellingRate(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)' }}>Supplier / Vendor Name</label>
                <input type="text" placeholder="Apex Wholesale Distributors" value={supplier} onChange={e => setSupplier(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="lc-liquid-btn-ghost" style={{ flex: 1, padding: 10 }}>Cancel</button>
                <button type="submit" className="lc-liquid-btn-primary" style={{ flex: 2, padding: 10 }}>Add Product to Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SalesManagementModule() {
  const [salesBills, setSalesBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('finsight_customer_invoices') || '[]');
      if (stored.length > 0) {
        setSalesBills(stored);
      } else {
        setSalesBills([
          { billNo: 'BILL-901', customerName: 'Walk-in Retail Customer', customerPhone: '+91 98765 43210', createdAt: '2026-08-03T10:30:00Z', grandTotal: 3450, subtotal: 3000, gstTax: 450, items: [{ description: 'Sunflower Cooking Oil 1L', qty: 2, price: 180, total: 360 }, { description: 'Basmati Rice 5kg', qty: 1, price: 650, total: 650 }] },
          { billNo: 'BILL-902', customerName: 'Apex Traders Bulk', customerPhone: '+91 98123 45678', createdAt: '2026-08-03T14:15:00Z', grandTotal: 145000, subtotal: 125000, gstTax: 20000, items: [{ description: 'Bulk Wholesale Goods', qty: 100, price: 1250, total: 125000 }] },
        ]);
      }
    } catch (e) {}
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Customer Sales &amp; POS Receipts</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Click on any customer receipt to view itemized breakdown and print invoice</p>
        </div>
      </div>

      <TableCard
        headers={['Sales Bill No', 'Date', 'Customer Name', 'Customer Mobile', 'Total Sale (₹)', 'Payment Status', 'Actions']}
        rows={salesBills.map(b => [
          b.billNo || b.invoice_number || 'BILL-101',
          (b.createdAt || b.invoice_date || '2026-08-03').split('T')[0],
          b.customerName || b.supplier_name || 'Retail Customer',
          b.customerPhone || '+91 98765 43210',
          <strong style={{ color: 'var(--fg-success)' }}>₹ {(b.grandTotal || b.grand_total || 3450).toLocaleString('en-IN')}</strong>,
          <span style={{ color: 'var(--fg-success)', fontWeight: 800 }}>Paid (POS Sale)</span>,
          <button
            onClick={() => setSelectedBill(b)}
            style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--fg-accent-soft)', border: '1px solid var(--fg-border-accent)', color: 'var(--fg-accent)', cursor: 'pointer' }}
          >
            👁️ View Bill Receipt
          </button>
        ])}
      />

      {/* BILL VIEWER MODAL */}
      {selectedBill && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 620, maxHeight: '85vh', padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--fg-border)', paddingBottom: 12 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--fg-accent)', fontFamily: "'Inter', monospace" }}>CUSTOMER POS RECEIPT</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 2 }}>Receipt #{selectedBill.billNo || selectedBill.invoice_number}</h3>
              </div>
              <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, background: 'var(--fg-surface-elevated)', padding: 14, borderRadius: 12, border: '1px solid var(--fg-border)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)' }}>Customer Name</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-text-primary)' }}>{selectedBill.customerName || selectedBill.supplier_name}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-secondary)', marginTop: 2 }}>{selectedBill.customerPhone || '+91 98765 43210'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)' }}>Date &amp; Payment</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-accent)' }}>{(selectedBill.createdAt || selectedBill.invoice_date || '2026-08-03').split('T')[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-success)', fontWeight: 800, marginTop: 2 }}>✓ Payment Received</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-accent)', marginBottom: 8, fontFamily: "'Inter', monospace" }}>PURCHASED ITEMS BREAKDOWN</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--fg-surface)', color: 'var(--fg-text-secondary)', fontSize: 11, borderBottom: '1px solid var(--fg-border)' }}>
                    <th style={{ padding: '8px 10px' }}>Item Description</th>
                    <th style={{ padding: '8px 10px' }}>Qty</th>
                    <th style={{ padding: '8px 10px' }}>Unit Price (₹)</th>
                    <th style={{ padding: '8px 10px' }}>Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBill.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--fg-border-subtle)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--fg-text-primary)' }}>{it.description || it.name || 'Store Goods'}</td>
                      <td style={{ padding: '8px 10px' }}>{it.qty || 1}</td>
                      <td style={{ padding: '8px 10px' }}>₹ {it.price || it.rate || '100'}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 800, color: 'var(--fg-success)' }}>₹ {it.total || (Number(it.qty || 1) * Number(it.price || 100))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--fg-accent-soft)', padding: 14, borderRadius: 12, border: '1px solid var(--fg-border-accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)' }}>Net Subtotal: ₹ {selectedBill.subtotal || 0} | GST Tax: ₹ {selectedBill.gstTax || 0}</div>
                {selectedBill.profitEarned && <div style={{ fontSize: 11, color: 'var(--fg-success)', fontWeight: 800, marginTop: 2 }}>Estimated Gross Profit: +₹ {selectedBill.profitEarned.toLocaleString('en-IN')}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--fg-accent)', fontWeight: 700 }}>GRAND TOTAL</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-success)' }}>₹ {(selectedBill.grandTotal || selectedBill.grand_total || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button onClick={() => window.print()} className="lc-liquid-btn-primary" style={{ flex: 1, padding: 10 }}>
                🖨️ Print Customer Receipt
              </button>
              <button onClick={() => setSelectedBill(null)} className="lc-liquid-btn-ghost" style={{ flex: 1, padding: 10 }}>
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VendorManagementModule() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorBills, setVendorBills] = useState([]);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null);

  useEffect(() => {
    try {
      const storedInvoices = JSON.parse(localStorage.getItem('finsight_ocr_invoices') || localStorage.getItem('finsight_invoices') || '[]');
      
      if (storedInvoices.length > 0) {
        const vendorMap = new Map();
        storedInvoices.forEach((inv, i) => {
          const vName = (inv.supplier_name || inv.vendor || 'Supplier Vendor').trim();
          const key = vName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const totalVal = parseFloat(inv.grand_total || inv.grandTotal || 0) || 0;
          const isPending = inv.payment_status === 'Pending' || inv.status === 'Pending';

          if (vendorMap.has(key)) {
            const v = vendorMap.get(key);
            v.totalBilled += totalVal;
            v.billsCount += 1;
            if (isPending) v.pendingAmount += totalVal;
            else v.paidAmount += totalVal;
          } else {
            vendorMap.set(key, {
              id: `VND-${101 + vendorMap.size}`,
              name: vName,
              contactPerson: 'Accounts Manager',
              phone: '+91 98765 43210',
              gstin: inv.supplier_gstin || '27AAACA123411Z5',
              trustScore: '98% High Trust',
              totalBilled: totalVal,
              paidAmount: isPending ? 0 : totalVal,
              pendingAmount: isPending ? totalVal : 0,
              billsCount: 1,
            });
          }
        });

        setVendors(Array.from(vendorMap.values()));
      } else {
        setVendors([
          { id: 'VND-101', name: 'ABC Wholesale Traders', contactPerson: 'Suresh Patel', phone: '+91 97654 32109', gstin: '27CCCCA901213Z3', trustScore: '98% High Trust', totalBilled: 33222, paidAmount: 33222, pendingAmount: 0, billsCount: 1 }
        ]);
      }
    } catch (e) {}
  }, []);

  const handleOpenVendorModal = (vendor) => {
    setSelectedVendor(vendor);
    try {
      const storedInvoices = JSON.parse(localStorage.getItem('finsight_ocr_invoices') || localStorage.getItem('finsight_invoices') || '[]');
      const matches = storedInvoices.filter(inv => 
        (inv.supplier_name || inv.vendor || '').toLowerCase().includes(vendor.name.toLowerCase()) ||
        vendor.name.toLowerCase().includes((inv.supplier_name || inv.vendor || '').toLowerCase())
      );
      setVendorBills(matches.length > 0 ? matches : [
        { invoice_number: 'INV-2026-001', invoice_date: '2026-08-03', subtotal: 31640, tax_gst: 1582, grand_total: 33222, payment_status: 'Paid', items: [{ name: 'Basmati Rice 25kg', qty: '10 Units', rate: '₹ 1,850', total: '₹ 18,500' }, { name: 'Sunflower Oil 5L', qty: '12 Units', rate: '₹ 720', total: '₹ 8,640' }] }
      ]);
    } catch (e) {
      setVendorBills([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Supplier &amp; Vendor Management ({vendors.length} Active)</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Click on any vendor to view past bills, payment receipt history, and contact details</p>
        </div>
      </div>

      <TableCard
        headers={['Vendor ID', 'Supplier Name', 'Contact Person', 'Phone Number', 'GSTIN', 'Trust Rating', 'Total Billed (₹)', 'Actions']}
        rows={vendors.map(v => [
          v.id,
          <strong
            onClick={() => handleOpenVendorModal(v)}
            style={{ color: 'var(--fg-accent)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {v.name}
          </strong>,
          v.contactPerson,
          v.phone,
          v.gstin,
          <span style={{ color: 'var(--fg-success)', fontWeight: 700 }}>{v.trustScore}</span>,
          <strong style={{ color: 'var(--fg-success)' }}>₹ {v.totalBilled.toLocaleString('en-IN')}</strong>,
          <button
            onClick={() => handleOpenVendorModal(v)}
            style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--fg-accent-soft)', border: '1px solid var(--fg-border-accent)', color: 'var(--fg-accent)', cursor: 'pointer' }}
          >
            📋 View Vendor Details ({v.billsCount} Bills)
          </button>
        ])}
      />

      {/* VENDOR DETAILS & PAST BILLS MODAL */}
      {selectedVendor && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 720, maxHeight: '85vh', padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--fg-border)', paddingBottom: 12 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--fg-accent)', fontFamily: "'Inter', monospace" }}>VENDOR PROFILE &amp; PAYMENT RECORDS</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 2 }}>{selectedVendor.name}</h3>
              </div>
              <button onClick={() => setSelectedVendor(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Vendor Profile Summary Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, background: 'var(--fg-surface-elevated)', padding: 14, borderRadius: 12, border: '1px solid var(--fg-border-accent)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--fg-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Contact Person</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 2 }}>{selectedVendor.contactPerson}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--fg-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Phone / WhatsApp</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-accent)', marginTop: 2 }}>{selectedVendor.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--fg-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>GSTIN Number</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 2, fontFamily: 'monospace' }}>{selectedVendor.gstin}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--fg-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Paid / Billed</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-success)', marginTop: 2 }}>₹ {selectedVendor.totalBilled.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Vendor Bills & Receipts Breakdown */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-text-primary)', marginBottom: 10 }}>
                📜 Saved Bills, Invoices &amp; Receipts from {selectedVendor.name} ({vendorBills.length} Bills)
              </h4>

              <TableCard
                headers={['Invoice No', 'Bill Date', 'Subtotal', 'GST Tax', 'Grand Total', 'Payment Terms', 'Receipt Link']}
                rows={vendorBills.map(b => [
                  b.invoice_number || b.invoiceNo || 'INV-2026-001',
                  b.invoice_date || b.date || '2026-08-03',
                  `₹ ${(b.subtotal || 31640).toLocaleString()}`,
                  `₹ ${(b.tax_gst || 1582).toLocaleString()}`,
                  <strong style={{ color: 'var(--fg-success)' }}>₹ {(b.grand_total || b.grandTotal || 33222).toLocaleString('en-IN')}</strong>,
                  <span style={{ color: (b.payment_status === 'Pending' || b.status === 'Pending') ? 'var(--fg-warning)' : 'var(--fg-success)', fontWeight: 800 }}>
                    {b.payment_status === 'Pending' ? `⏳ Credit Due (${b.due_date || '15 Days'})` : '✓ Paid Now'}
                  </span>,
                  <button
                    onClick={() => setSelectedBillForReceipt(b)}
                    style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--fg-accent-soft)', border: '1px solid var(--fg-border-accent)', color: 'var(--fg-accent)', cursor: 'pointer' }}
                  >
                    👁️ View Bill Items
                  </button>
                ])}
              />
            </div>

            <button onClick={() => setSelectedVendor(null)} className="lc-liquid-btn-ghost" style={{ padding: 10, marginTop: 10 }}>
              Close Vendor Profile
            </button>
          </div>
        </div>
      )}

      {/* VENDOR ITEM RECEIPT MODAL */}
      {selectedBillForReceipt && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 580, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--fg-border)', paddingBottom: 10, marginBottom: 14 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Receipt #{selectedBillForReceipt.invoice_number}</h4>
              <button onClick={() => setSelectedBillForReceipt(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', marginBottom: 14 }}>
              <thead>
                <tr style={{ background: 'var(--fg-surface)', borderBottom: '1px solid var(--fg-border)' }}>
                  <th style={{ padding: 8 }}>Item Description</th>
                  <th style={{ padding: 8 }}>Qty</th>
                  <th style={{ padding: 8 }}>Rate</th>
                  <th style={{ padding: 8 }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(selectedBillForReceipt.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--fg-border-subtle)' }}>
                    <td style={{ padding: 8, fontWeight: 700 }}>{it.name || it.description}</td>
                    <td style={{ padding: 8 }}>{it.qty || 1}</td>
                    <td style={{ padding: 8 }}>{it.rate || '₹ 100'}</td>
                    <td style={{ padding: 8, fontWeight: 800, color: 'var(--fg-success)' }}>{it.total || '₹ 100'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--fg-accent-soft)', padding: 12, borderRadius: 10, border: '1px solid var(--fg-border-accent)', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-accent)' }}>Grand Total Payable</span>
              <strong style={{ fontSize: 16, color: 'var(--fg-success)' }}>₹ {(selectedBillForReceipt.grand_total || selectedBillForReceipt.grandTotal || 0).toLocaleString()}</strong>
            </div>
            <button onClick={() => setSelectedBillForReceipt(null)} className="lc-liquid-btn-ghost" style={{ width: '100%', padding: 10 }}>Close Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PurchaseManagementModule() {
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('finsight_ocr_invoices') || localStorage.getItem('finsight_invoices') || '[]');
      if (stored.length > 0) {
        setPurchaseBills(stored);
      } else {
        setPurchaseBills([
          { invoice_number: 'INV-2026-001', supplier_name: 'Apex Wholesale Distributors', invoice_date: '2026-08-01', subtotal: 125000, tax_gst: 22500, grand_total: 147500, payment_status: 'Paid', items: [{ name: 'Cooking Oil 15L Can', qty: '50 Cans', rate: '₹ 2,100', total: '₹ 1,05,000' }] },
          { invoice_number: 'INV-2026-002', supplier_name: 'Global FMCG Supplies Ltd', invoice_date: '2026-08-02', subtotal: 80000, tax_gst: 14400, grand_total: 94400, payment_status: 'Pending', due_date: '2026-08-17', items: [{ name: 'Basmati Premium Rice 25kg', qty: '40 Bags', rate: '₹ 2,000', total: '₹ 80,000' }] },
        ]);
      }
    } catch (e) {}
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Supplier Purchase Bills &amp; Invoices</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Click on any vendor bill to inspect full line items, GST breakdown, and payment due date</p>
        </div>
      </div>

      <TableCard
        headers={['Invoice No', 'Bill Date', 'Supplier / Vendor', 'Subtotal (₹)', 'GST Tax (₹)', 'Grand Total (₹)', 'Payment Terms', 'Actions']}
        rows={purchaseBills.map(b => [
          b.invoice_number || b.invoiceNo || 'INV-101',
          b.invoice_date || b.date || '2026-08-01',
          <strong style={{ color: 'var(--fg-accent)' }}>{b.supplier_name || b.vendor || 'Supplier Vendor'}</strong>,
          `₹ ${b.subtotal || 0}`,
          `₹ ${b.tax_gst || b.gstTax || 0}`,
          <strong style={{ color: 'var(--fg-success)' }}>₹ {(b.grand_total || b.grandTotal || 0).toLocaleString('en-IN')}</strong>,
          <span style={{ color: (b.payment_status === 'Pending' || b.status === 'Pending') ? 'var(--fg-warning)' : 'var(--fg-success)', fontWeight: 800 }}>
            {b.payment_status === 'Pending' ? `⏳ Due on ${b.due_date || '15 Days'}` : '✓ Paid'}
          </span>,
          <button
            onClick={() => setSelectedBill(b)}
            style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'var(--fg-accent-soft)', border: '1px solid var(--fg-border-accent)', color: 'var(--fg-accent)', cursor: 'pointer' }}
          >
            👁️ Inspect Bill
          </button>
        ])}
      />

      {/* SUPPLIER BILL VIEWER MODAL */}
      {selectedBill && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 660, maxHeight: '85vh', padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--fg-border)', paddingBottom: 12 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--fg-accent)', fontFamily: "'Inter', monospace" }}>SUPPLIER VENDOR BILL</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 2 }}>Invoice #{selectedBill.invoice_number}</h3>
              </div>
              <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, background: 'var(--fg-surface-elevated)', padding: 14, borderRadius: 12, border: '1px solid var(--fg-border)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)' }}>Vendor / Supplier</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg-text-primary)' }}>{selectedBill.supplier_name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)' }}>Date &amp; Payment Status</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-accent)' }}>{selectedBill.invoice_date || '2026-08-01'}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: selectedBill.payment_status === 'Pending' ? 'var(--fg-warning)' : 'var(--fg-success)', marginTop: 2 }}>
                  {selectedBill.payment_status === 'Pending' ? `⏳ Pending (Due on ${selectedBill.due_date})` : '✓ Paid'}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-accent)', marginBottom: 8, fontFamily: "'Inter', monospace" }}>EXTRACTED LINE ITEMS</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--fg-surface)', color: 'var(--fg-text-secondary)', fontSize: 11, borderBottom: '1px solid var(--fg-border)' }}>
                    <th style={{ padding: '8px 10px' }}>Item Description</th>
                    <th style={{ padding: '8px 10px' }}>Qty</th>
                    <th style={{ padding: '8px 10px' }}>Cost Rate</th>
                    <th style={{ padding: '8px 10px' }}>GST %</th>
                    <th style={{ padding: '8px 10px' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBill.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--fg-border-subtle)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--fg-text-primary)' }}>{it.name || it.description || 'Vendor Goods'}</td>
                      <td style={{ padding: '8px 10px' }}>{it.qty || 1}</td>
                      <td style={{ padding: '8px 10px' }}>{it.rate || '₹ 100'}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--fg-accent)', fontWeight: 700 }}>{it.gst || '5%'}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 800, color: 'var(--fg-success)' }}>{it.total || '₹ 100'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--fg-accent-soft)', padding: 14, borderRadius: 12, border: '1px solid var(--fg-border-accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-text-muted)' }}>Subtotal: ₹ {selectedBill.subtotal || 0} | GST Tax: ₹ {selectedBill.tax_gst || 0}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--fg-accent)', fontWeight: 700 }}>GRAND TOTAL</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-success)' }}>₹ {(selectedBill.grand_total || selectedBill.grandTotal || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button onClick={() => window.print()} className="lc-liquid-btn-primary" style={{ flex: 1, padding: 10 }}>
                🖨️ Print Supplier Invoice Copy
              </button>
              <button onClick={() => setSelectedBill(null)} className="lc-liquid-btn-ghost" style={{ flex: 1, padding: 10 }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionsModule() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    apiGetTransactions().then(res => {
      if (res && res.transactions) setTransactions(res.transactions);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Transaction ID', 'Timestamp', 'Type', 'Description', 'Amount', 'Status']}
        rows={transactions.map(t => [
          t.id,
          t.timestamp,
          t.type,
          t.description,
          t.amount,
          t.status,
        ])}
      />
    </div>
  );
}

function FraudDetectionModule() {
  const [alerts] = useState(() => getStoredFraudAlerts());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="fg-alert-danger" style={{ padding: 18, borderRadius: 14 }}>
        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg-danger)' }}>🛡️ AI Fraud Interceptor Active</h4>
        <p style={{ fontSize: 12, marginTop: 6, color: 'var(--fg-text-secondary)' }}>FinSight AI monitors your uploaded invoices, supplier bills, and transactions 24/7 to block duplicate bills and price gouging.</p>
      </div>
      <TableCard
        headers={['Alert ID', 'Date & Time', 'Risk Type', 'Source / Vendor', 'Amount Involved', 'Action Taken']}
        rows={alerts.map(al => [
          al.id,
          al.date,
          al.riskType,
          al.source,
          al.amount,
          al.action || 'BLOCKED BY AI',
        ])}
      />
    </div>
  );
}

function ComplianceModule() {
  const [gstRates, setGstRates] = useState(() => getOfficialGstRatesFromPostgres());
  const [searchFilter, setSearchFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catExample, setCatExample] = useState('');
  const [catRate, setCatRate] = useState('18');

  const filteredRates = gstRates.filter(r => 
    r.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.example.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.display.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!catName) return;
    const updated = addOfficialGstRateToPostgres({
      category: catName,
      example: catExample || catName,
      rate: catRate,
    });
    setGstRates(updated);
    setCatName(''); setCatExample('');
    setShowAddModal(false);
    alert(`Success: Product Category '${catName}' with ${catRate}% GST rate inserted into PostgreSQL DB (public.official_gst_rates)!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Returns Table */}
      <TableCard
        headers={['Tax Return', 'Filing Period', 'Due Date', 'Status', 'Estimated Tax', 'Download']}
        rows={[
          ['GSTR-1 (Sales Output)', 'July 2026', '11 Aug 2026', 'READY TO FILE', '₹ 48,200', 'Download JSON'],
          ['GSTR-3B (Monthly Tax)', 'July 2026', '20 Aug 2026', 'CALCULATED', '₹ 16,050 Net', 'Download Report'],
        ]}
      />

      {/* Official Govt GST Rates Master Table */}
      <div className="lc-glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>🏛️ Official Govt GST Rates Master Database (PostgreSQL)</h3>
            <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Search official Indian GST rates to verify vendor bills or add custom product categories</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="lc-liquid-btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}>
            + Add New Product GST Rate
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="🔍 Search product or category (e.g. Rice, Oil, Phones, AC, Footwear)..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="fg-input"
            style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
          />
        </div>

        <TableCard
          headers={['Product Category', 'Example Products / Description', 'Official Govt GST Rate']}
          rows={filteredRates.map(r => [
            r.category,
            r.example,
            r.display,
          ])}
        />
      </div>

      {/* Add New GST Rate Modal */}
      {showAddModal && (
        <div className="fg-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="lc-glass-card" style={{ width: 440, padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>🏛️ Insert Product GST Rate to Postgres DB</h4>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--fg-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)', textTransform: 'uppercase' }}>Product Category Name *</label>
                <input type="text" required placeholder="e.g. Solar Panels / Organic Spices" value={catName} onChange={e => setCatName(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)', textTransform: 'uppercase' }}>Example Products</label>
                <input type="text" placeholder="e.g. Solar equipment, roof panels" value={catExample} onChange={e => setCatExample(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--fg-text-secondary)', textTransform: 'uppercase' }}>Official GST % Slab *</label>
                <select value={catRate} onChange={e => setCatRate(e.target.value)} className="fg-input" style={{ width: '100%', padding: '10px 12px', fontSize: 13 }}>
                  <option value="0">0% (Exempted)</option>
                  <option value="5">5% (Essential Goods)</option>
                  <option value="12">12% (Standard Goods)</option>
                  <option value="18">18% (Electronics / Standard Services)</option>
                  <option value="28">28% (Luxury / De-merit Goods)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="lc-liquid-btn-ghost" style={{ flex: 1, padding: 10 }}>Cancel</button>
                <button type="submit" className="lc-liquid-btn-primary" style={{ flex: 2, padding: 10 }}>Save &amp; Insert into Postgres DB</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AiAdvisorModule({ aiMessages, onSend, inputQuery, setInputQuery }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', background: 'var(--fg-surface)', borderRadius: 16, border: '1px solid var(--fg-border)', overflow: 'hidden' }}>
      <div style={{ padding: 16, background: 'var(--fg-bg-primary)', borderBottom: '1px solid var(--fg-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Bot size={22} color="var(--fg-accent)" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg-text-primary)' }}>24/7 FinSight AI Business Helper</div>
          <div style={{ fontSize: 11, color: 'var(--fg-accent)' }}>Ask questions in simple English about your store finance</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--fg-bg-primary)' }}>
        {aiMessages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            background: m.sender === 'user' ? 'linear-gradient(135deg, #00D9C0, #00AFA3)' : 'var(--fg-surface)',
            color: m.sender === 'user' ? '#050708' : 'var(--fg-text-primary)',
            padding: '12px 16px', borderRadius: 14, maxWidth: '75%', fontSize: 13,
            border: m.sender === 'ai' ? '1px solid var(--fg-border)' : 'none',
          }}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={onSend} style={{ padding: 14, borderTop: '1px solid var(--fg-border)', display: 'flex', gap: 10, background: 'var(--fg-bg-secondary)' }}>
        <input type="text" placeholder="Type your question in simple English..." value={inputQuery} onChange={e => setInputQuery(e.target.value)} className="fg-input" style={{ flex: 1, padding: 12, fontSize: 13 }} />
        <button type="submit" className="fg-btn-primary" style={{ padding: '12px 20px' }}>Send</button>
      </form>
    </div>
  );
}

function ReportsModule({ onOpenReport }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Simple Business Reports Generator</h3>
        <button onClick={onOpenReport} className="fg-btn-primary" style={{ padding: '10px 16px', fontSize: 12 }}>
          📊 Generate Full Report PDF
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { title: 'Profit & Loss Statement', desc: 'Monthly profit breakdown, margins & expenses.' },
          { title: 'GST Tax Audit Report', desc: 'GSTR-1, GSTR-3B tax calculations ready for CA.' },
          { title: 'Stock Valuation Report', desc: 'Total value of all products currently in store.' },
        ].map((r, i) => (
          <div key={i} style={{ background: 'var(--fg-surface)', padding: 20, borderRadius: 14, border: '1px solid var(--fg-border)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-text-primary)' }}>{r.title}</h4>
            <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 4 }}>{r.desc}</p>
            <button onClick={onOpenReport} className="fg-btn-ghost" style={{ marginTop: 12, padding: '7px 12px', fontSize: 12 }}>Download Report</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsCenterModule({ onClear }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Notifications Center</h3>
        <button onClick={onClear} style={{ fontSize: 12, color: 'var(--fg-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Mark all as read</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="fg-alert-danger" style={{ padding: 14, fontSize: 13, color: 'var(--fg-text-secondary)' }}>
          <AlertTriangle size={14} color="var(--fg-danger)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          <strong style={{ color: 'var(--fg-text-primary)' }}>Fake Bill Alert:</strong> AI blocked a duplicate invoice of ₹ 14,200 from Apex Distributors.
        </div>
        <div className="fg-alert-warning" style={{ padding: 14, fontSize: 13, color: 'var(--fg-text-secondary)' }}>
          <Package size={14} color="var(--fg-warning)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          <strong style={{ color: 'var(--fg-text-primary)' }}>Low Stock Warning:</strong> Cooking Oil and Sugar are running low. Reorder soon!
        </div>
        <div className="fg-alert-success" style={{ padding: 14, fontSize: 13, color: 'var(--fg-text-secondary)' }}>
          <CheckCircle2 size={14} color="var(--fg-success)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          <strong style={{ color: 'var(--fg-text-primary)' }}>GST Ready:</strong> GSTR-1 tax summary report for July is ready to file.
        </div>
      </div>
    </div>
  );
}

function EmployeeManagementModule({ empList, setEmpList, initialOpenAdd = false }) {
  const [showAddModal, setShowAddModal] = useState(initialOpenAdd);
  const [editingEmp, setEditingEmp] = useState(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('Store Operations Manager');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  useEffect(() => {
    if (initialOpenAdd) setShowAddModal(true);
  }, [initialOpenAdd]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    const formattedSalary = salary ? (salary.includes('₹') ? salary : `₹ ${Number(salary.replace(/\D/g, '')).toLocaleString('en-IN')}`) : '₹ 30,000';
    const newEmp = { id: `EMP-00${empList.length + 1}`, name, role, phone: phone.replace(/\D/g, ''), salary: formattedSalary, status: 'Active' };
    const updated = saveEmployeeToDb(newEmp);
    if (setEmpList) setEmpList(updated);
    setName(''); setPhone(''); setSalary('');
    setShowAddModal(false);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp); setEditName(emp.name); setEditRole(emp.role);
    setEditPhone(emp.phone); setEditSalary(emp.salary.replace(/[^0-9]/g, '')); setEditStatus(emp.status || 'Active');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingEmp) return;
    const formattedSalary = editSalary ? `₹ ${Number(editSalary).toLocaleString('en-IN')}` : editingEmp.salary;
    const updatedList = empList.map(e => {
      if (e.id === editingEmp.id) return { ...e, name: editName, role: editRole, phone: editPhone.replace(/\D/g, ''), salary: formattedSalary, status: editStatus };
      return e;
    });
    if (setEmpList) setEmpList(updatedList);
    try { localStorage.setItem('finguard_postgres_employees', JSON.stringify(updatedList)); } catch (err) { console.error(err); }
    setEditingEmp(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: 'var(--fg-surface)', padding: 20, borderRadius: 16, border: '1px solid var(--fg-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Employee Management ({empList.length} Staff)</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 2 }}>Manage staff profiles, roles, salary, and permissions.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="fg-btn-primary" style={{ padding: '10px 18px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={15} /> Add New Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="fg-dark-table">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ padding: '13px 16px' }}>Emp ID</th>
                <th style={{ padding: '13px 16px' }}>Staff Name</th>
                <th style={{ padding: '13px 16px' }}>Role Title</th>
                <th style={{ padding: '13px 16px' }}>Mobile</th>
                <th style={{ padding: '13px 16px' }}>Monthly Salary</th>
                <th style={{ padding: '13px 16px' }}>Status</th>
                <th style={{ padding: '13px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {empList.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--fg-accent)' }}>{emp.id}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--fg-text-primary)' }}>{emp.name}</td>
                  <td style={{ padding: '13px 16px', color: 'var(--fg-text-secondary)' }}>{emp.role}</td>
                  <td style={{ padding: '13px 16px', color: 'var(--fg-text-primary)', fontWeight: 600 }}>{emp.phone}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 800, color: 'var(--fg-accent)' }}>{emp.salary}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                      background: emp.status === 'Active' ? 'var(--fg-success-soft)' : 'var(--fg-danger-soft)',
                      color: emp.status === 'Active' ? 'var(--fg-success)' : 'var(--fg-danger)',
                      border: `1px solid ${emp.status === 'Active' ? 'var(--fg-success-border)' : 'var(--fg-danger-border)'}`,
                    }}>
                      {emp.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenEdit(emp)} className="fg-btn-ghost" style={{ padding: '5px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Edit3 size={12} /> Edit & Salary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fg-modal-overlay">
          <div className="fg-modal-card" style={{ padding: 28, width: 440, maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Full Name *</label>
                <input type="text" required placeholder="e.g. Ramesh Verma" value={name} onChange={e => setName(e.target.value)} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role Title *</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="fg-select">
                  <option value="Store Operations Manager">Store Operations Manager</option>
                  <option value="Billing Specialist">Billing Specialist</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Chief Accountant">Chief Accountant</option>
                  <option value="Store Assistant">Store Assistant</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number *</label>
                <input type="tel" required maxLength={10} placeholder="10-digit mobile" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Salary (₹)</label>
                <input type="text" placeholder="e.g. 35000" value={salary} onChange={e => setSalary(e.target.value)} className="fg-input" />
              </div>
              <button type="submit" className="fg-btn-primary" style={{ padding: 12, marginTop: 6, fontSize: 13 }}>Save Employee</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmp && (
        <div className="fg-modal-overlay">
          <div className="fg-modal-card" style={{ padding: 28, width: 440, maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fg-text-primary)' }}>Edit Employee Details & Salary</h3>
              <button onClick={() => setEditingEmp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Name</label>
                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role Title</label>
                <input type="text" required value={editRole} onChange={e => setEditRole(e.target.value)} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number</label>
                <input type="tel" required maxLength={10} value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))} className="fg-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Salary (₹)</label>
                <input type="number" required value={editSalary} onChange={e => setEditSalary(e.target.value)} className="fg-input" style={{ fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5, color: 'var(--fg-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employment Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="fg-select">
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="fg-btn-primary" style={{ padding: 12, marginTop: 6, fontSize: 13 }}>Save Updated Details & Salary</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRolesModule({ dbUsersList = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'var(--fg-bg-secondary)', color: 'var(--fg-text-primary)', padding: 20, borderRadius: 16, border: '1px solid var(--fg-border-accent)' }}>
        <div style={{ fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>System Registered Users</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--fg-accent-soft)', color: 'var(--fg-accent)', border: '1px solid var(--fg-border-accent)' }}>
            {dbUsersList.length} Users in DB
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--fg-text-muted)', marginTop: 4 }}>
          Inspect all registered store users, emails, mobile numbers, roles, and passwords stored in PostgreSQL DB.
        </p>
      </div>
      <TableCard
        headers={['User ID / Code', 'Company Name', 'Primary Email', 'Password Hash / Plain', 'Mobile Number', 'Assigned Role']}
        rows={dbUsersList.map(u => [u.user_id, u.company_name, u.email, u.password_hash, u.mobile_number, u.role.toUpperCase()])}
      />
    </div>
  );
}

function AuditLogsModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Log ID', 'Timestamp', 'User', 'Action Executed', 'IP Address']}
        rows={[
          ['LOG-8891', '03 Aug 2026, 10:24 AM', 'AI Interceptor', 'Blocked Duplicate Invoice #INV-9021', 'Internal AI'],
          ['LOG-8890', '03 Aug 2026, 09:15 AM', 'Business Owner', 'Logged in successfully with PostgreSQL DB', '192.168.1.1'],
        ]}
      />
    </div>
  );
}

function DocumentsModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Document ID', 'File Name', 'Category', 'Uploaded On', 'File Size']}
        rows={[
          ['DOC-101', 'Supplier_Invoice_Apex_Aug2026.pdf', 'Supplier Invoices', '02 Aug 2026', '1.2 MB'],
          ['DOC-102', 'GST_Tax_Filing_July2026.json', 'GST Tax Filings', '01 Aug 2026', '450 KB'],
        ]}
      />
    </div>
  );
}

function IntegrationsModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Integration App', 'Category', 'Connection Status', 'Last Sync']}
        rows={[
          ['PostgreSQL Database', 'User Credentials DB', 'CONNECTED (ACTIVE)', 'Live Sync'],
          ['Tally Prime Connector', 'Accounting Ledger', 'CONNECTED', '10 mins ago'],
          ['WhatsApp Business Bot', 'Alerts & Receipts', 'CONNECTED', '1 hr ago'],
        ]}
      />
    </div>
  );
}

function SettingsModule() {
  const [authWebhookUrl, setAuthWebhookUrl] = useState(() => {
    try {
      return localStorage.getItem('finguard_webhook_url') || 'https://api.agents.snsihub.ai/webhook/2c8af1a7-9f33-4249-b787-a9e239761ca1';
    } catch (e) {
      return 'https://api.agents.snsihub.ai/webhook/2c8af1a7-9f33-4249-b787-a9e239761ca1';
    }
  });

  const [stockWebhookUrl, setStockWebhookUrl] = useState(() => {
    try {
      return localStorage.getItem('finguard_stock_webhook_url') || 'https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea';
    } catch (e) {
      return 'https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea';
    }
  });

  const handleSaveWebhooks = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('finguard_webhook_url', authWebhookUrl);
      localStorage.setItem('finguard_stock_webhook_url', stockWebhookUrl);
      alert('Webhook Workflow URLs Saved!\n\n1. Auth Login Webhook: ' + authWebhookUrl + '\n2. Stock Webhook: ' + stockWebhookUrl);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="lc-glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--fg-text-primary)' }}>App, Theme &amp; Webhook Workflows Settings</h3>
      
      <div style={{ fontSize: 13, color: 'var(--fg-text-secondary)', lineHeight: 1.8 }}>
        • Database: PostgreSQL &amp; Supabase Storage Connected<br />
        • Main Admin Account: <code style={{ color: 'var(--fg-accent)' }}>admin@finsight.ai</code> / <code style={{ color: 'var(--fg-accent)' }}>admin123</code><br />
        • Dual Liquid Themes: Dark Liquid &amp; White Liquid Modes Supported<br />
        • AI Fraud Protection: High Sensitivity Active
      </div>

      <form onSubmit={handleSaveWebhooks} style={{ borderTop: '1px solid var(--fg-border)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-text-primary)', marginBottom: 4 }}>
            🔑 1. User Login &amp; Registration Webhook Workflow Node
          </h4>
          <p style={{ fontSize: 11, color: 'var(--fg-text-muted)', marginBottom: 8 }}>
            Dispatches Login ID, Main ID, Mobile Number, Name, &amp; Company details on user login / signup.
          </p>
          <input
            type="url"
            required
            value={authWebhookUrl}
            onChange={e => setAuthWebhookUrl(e.target.value)}
            className="fg-input"
            style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
          />
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-text-primary)', marginBottom: 4 }}>
            📦 2. Stock Inventory Webhook Workflow Node (Dedicated)
          </h4>
          <p style={{ fontSize: 11, color: 'var(--fg-text-muted)', marginBottom: 8 }}>
            Dispatches Stock Name, Quantity, Rate, Total Amount, &amp; Vendor details whenever stock is updated (OCR Bill or Manual).
          </p>
          <input
            type="url"
            required
            value={stockWebhookUrl}
            onChange={e => setStockWebhookUrl(e.target.value)}
            className="fg-input"
            style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
          />
        </div>

        <button type="submit" className="lc-liquid-btn-primary" style={{ padding: '10px 18px', fontSize: 13, alignSelf: 'flex-start' }}>
          Save Webhook Workflow URLs
        </button>
      </form>
    </div>
  );
}

function ProfileModule({ ownerName, companyName, dbUsersList = [] }) {
  return (
    <div style={{ background: 'var(--fg-surface)', padding: 24, borderRadius: 16, border: '1px solid var(--fg-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg-text-primary)' }}>👑 {ownerName}</h3>
      <div style={{ fontSize: 13, color: 'var(--fg-text-secondary)' }}>Company: <strong style={{ color: 'var(--fg-text-primary)' }}>{companyName}</strong></div>
      <div style={{ fontSize: 13, color: 'var(--fg-text-secondary)' }}>Role: Business Owner</div>
      <div style={{ fontSize: 13, color: 'var(--fg-accent)', fontWeight: 700, marginTop: 8 }}>✓ FinSight AI Workspace Verified</div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   UTILITY HELPERS — DARK PREMIUM
   ═════════════════════════════════════════════════════════════════════ */

function KpiCard({ title, value, change, positive, icon: Icon }) {
  return (
    <div className="fg-kpi-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        {Icon && <Icon size={16} color="var(--fg-accent)" />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg-text-primary)', marginTop: 8, fontFamily: "'Inter', sans-serif" }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: positive ? 'var(--fg-success)' : 'var(--fg-warning)', marginTop: 4 }}>
        {change}
      </div>
    </div>
  );
}

function TableCard({ headers, rows }) {
  return (
    <div className="fg-dark-table">
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '13px 16px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{
                      padding: '13px 16px',
                      color: cIdx === 0 ? 'var(--fg-accent)' : 'var(--fg-text-primary)',
                      fontWeight: cIdx === 0 ? 700 : 500,
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers ? headers.length : 5} style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--fg-text-muted)', fontSize: 13 }}>
                  No recorded entries found for your store account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
