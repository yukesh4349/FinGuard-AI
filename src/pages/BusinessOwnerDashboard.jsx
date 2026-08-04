import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CreditCard, Receipt, Package, TrendingUp,
  Users, ShoppingBag, ArrowLeftRight, ShieldAlert, FileCheck, Bot,
  BarChart3, Bell, UserCheck, Shield, Clock, Folder, Cpu,
  Settings, User, Search, Filter, Plus, Download, Upload, CheckCircle2,
  AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight,
  Send, Sparkles, LogOut, Copy, Check, Eye, Trash2, Edit3, Lock, MessageSquare, X, Database, Phone
} from 'lucide-react';
import { getStoredEmployees, saveEmployeeToDb, getStoredUsers } from '../services/postgresDb';

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
    { sender: 'ai', text: `Hello ${ownerName}! I am your FinGuard AI Assistant for ${companyName}. Ask me anything about your profits, sales, GST taxes, or fake bill warnings!` }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);

  // Modals state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Form states for modals
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Store Executive');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empList, setEmpList] = useState(getStoredEmployees());
  const [dbUsersList, setDbUsersList] = useState([]);

  useEffect(() => {
    setDbUsersList(getStoredUsers());
  }, []);

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

  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const userMsg = inputQuery;
    setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputQuery('');
    setTimeout(() => {
      let reply = `Based on your store records for ${companyName}, your profit margin grew by 4.2% this week. I recommend paying 2 supplier bills before Friday to save ₹4,500 in early discounts.`;
      if (userMsg.toLowerCase().includes('gst') || userMsg.toLowerCase().includes('tax')) {
        reply = "Your estimated GST tax payable for this month is ₹48,200. You have ₹32,150 in tax credits ready to claim!";
      } else if (userMsg.toLowerCase().includes('fraud') || userMsg.toLowerCase().includes('fake') || userMsg.toLowerCase().includes('alert')) {
        reply = "FinGuard AI blocked 1 fake duplicate bill of ₹14,200 from 'Apex Wholesale'. Your money is safe!";
      } else if (userMsg.toLowerCase().includes('stock') || userMsg.toLowerCase().includes('inventory')) {
        reply = "You have 3 items running low on stock: Cooking Oil (12 packs left), Rice Bags (8 bags left), and Sugar (15 kg left).";
      }
      setAiMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!empName || !empPhone) return;
    const newEmp = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: empName,
      role: empRole,
      phone: empPhone,
      salary: `₹ ${empSalary || '30,000'}`,
      status: 'Active',
    };
    const updated = saveEmployeeToDb(newEmp);
    setEmpList(updated);
    setEmpName('');
    setEmpPhone('');
    setEmpSalary('');
    setShowAddEmpModal(false);
    alert(`Success: Employee ${empName} added to company records!`);
  };

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh',
      backgroundColor: '#F8FAFC', color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ── FIXED LEFT SIDEBAR NAVIGATION (TEAL/OCEAN BLUE DESIGN) ──────── */}
      <aside style={{
        width: 280, backgroundColor: '#0F172A', color: '#FFFFFF',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', flexShrink: 0, zIndex: 50,
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: '#0D9488',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>FinGuard AI</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#0D9488', fontFamily: 'monospace' }}>OWNER DASHBOARD</div>
            </div>
          </div>
        </div>

        {/* Module Search Filter */}
        <div style={{ padding: '14px 16px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#0F172A', border: '1px solid rgba(13,148,136,0.3)',
            borderRadius: 10, padding: '8px 12px',
          }}>
            <Search size={14} color="#0D9488" />
            <input
              type="text"
              placeholder="Search Owner Modules..."
              value={moduleSearch}
              onChange={e => setModuleSearch(e.target.value)}
              style={{
                border: 'none', backgroundColor: 'transparent', outline: 'none',
                width: '100%', fontSize: 12, color: '#FFFFFF', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Structured 5 Section Sidebar Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          {/* Top Main Item: Dashboard Overview */}
          {filteredModules.filter(m => m.category === 'Main').map(m => {
            const Icon = m.icon;
            const active = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModuleClick(m.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 10, marginBottom: 14,
                  backgroundColor: active ? '#0D9488' : 'rgba(255,255,255,0.06)',
                  color: '#FFFFFF', border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 800 : 600,
                  boxShadow: active ? '0 4px 14px rgba(13,148,136,0.3)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <Icon size={18} color={active ? '#FFFFFF' : '#0D9488'} />
                <span style={{ flex: 1 }}>{m.title}</span>
              </button>
            );
          })}

          {/* Grouped 4 Sections: Sales & Billing, Finance, Inventory, Employee Management */}
          {[
            { cat: 'Sales & Billing', label: 'SALES & BILLING' },
            { cat: 'Finance', label: 'FINANCE' },
            { cat: 'Inventory', label: 'INVENTORY' },
            { cat: 'Employee Management', label: 'EMPLOYEE MANAGEMENT' },
          ].map(group => {
            const groupItems = filteredModules.filter(m => m.category === group.cat);
            if (groupItems.length === 0) return null;
            return (
              <div key={group.cat} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, color: '#0D9488',
                  fontFamily: 'monospace', textTransform: 'uppercase',
                  padding: '4px 8px', letterSpacing: '0.06em',
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                  {groupItems.map(m => {
                    const Icon = m.icon;
                    const active = activeModule === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleModuleClick(m.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 12px', borderRadius: 9,
                          backgroundColor: active ? '#0D9488' : 'transparent',
                          color: active ? '#FFFFFF' : '#94A3B8',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 700 : 500,
                          transition: 'all 0.18s ease',
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#FFFFFF'; } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
                      >
                        <Icon size={16} color={active ? '#FFFFFF' : '#0D9488'} />
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

        {/* Sidebar Footer User Info */}
        <div style={{
          padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 17, backgroundColor: '#0D9488',
              color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14, flexShrink: 0,
            }}>
              👑
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ownerName || 'Business Owner'}
              </div>
              <div style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyName}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444',
              padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA (INDEPENDENTLY SCROLLABLE) ───────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Top Header */}
        <header style={{
          height: 64, padding: '0 28px', backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(13,148,136,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              {modulesList.find(m => m.id === activeModule)?.title}
            </h2>
            
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Quick AI Trigger */}
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 99,
                backgroundColor: aiPanelOpen ? '#0F172A' : '#F0FDFA',
                border: '1px solid rgba(13,148,136,0.3)',
                color: aiPanelOpen ? '#FFFFFF' : '#0D9488',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Sparkles size={14} color={aiPanelOpen ? '#FFFFFF' : '#0D9488'} />
              <span>AI Chat Assistant</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => handleModuleClick('notifications')}
              style={{
                position: 'relative', width: 38, height: 38, borderRadius: 10,
                backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#0F172A',
              }}
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3, width: 16, height: 16,
                  borderRadius: 8, backgroundColor: '#ef4444', color: '#FFF',
                  fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Body View Render */}
        <div style={{ flex: 1, padding: 28 }}>
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
          {activeModule === 'invoices' && <InvoiceManagementModule onOpenCreateInvoice={onOpenBillingPage} onOpenUpload={onOpenUploadPage} />}
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

      {/* ── FLOATING AI CHATBOT IN BOTTOM RIGHT CORNER ───────────────── */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      }}>
        {aiPanelOpen && (
          <div style={{
            width: 360, height: 460, backgroundColor: '#FFFFFF',
            borderRadius: 20, border: '1.5px solid rgba(13,148,136,0.3)',
            boxShadow: '0 20px 40px rgba(15,23,42,0.18)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            marginBottom: 12, animation: 'fadeInUp 0.25s ease',
          }}>
            <div style={{
              padding: '14px 18px', backgroundColor: '#0F172A', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>FinGuard AI Assistant</div>
                  <div style={{ fontSize: 10, color: '#CCFBF1' }}>Always active for {companyName}</div>
                </div>
              </div>
              <button
                onClick={() => setAiPanelOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: '#F8FAFC' }}>
              {aiMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: m.sender === 'user' ? '#0F172A' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    borderRadius: 14, padding: '10px 14px', maxWidth: '85%',
                    fontSize: 12, lineHeight: 1.5,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    border: m.sender === 'ai' ? '1px solid rgba(13,148,136,0.2)' : 'none',
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendAiMessage} style={{ padding: 10, backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(13,148,136,0.2)', display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ask about sales, GST, stock..."
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8,
                  border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#F8FAFC',
                  fontSize: 12, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '9px 12px', borderRadius: 8, backgroundColor: '#0D9488',
                  color: '#FFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setAiPanelOpen(!aiPanelOpen)}
          style={{
            height: 52, padding: '0 20px', borderRadius: 99,
            backgroundColor: '#0D9488', color: '#FFFFFF',
            border: '2px solid #CCFBF1',
            boxShadow: '0 10px 25px rgba(13,148,136,0.35)',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800,
            transition: 'all 0.22s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={22} color="#FFFFFF" />
          <span>FinGuard AI Chatbot</span>
          <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' }} />
        </button>
      </div>

      {/* MODALS */}
      {showAddEmpModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28,
            width: 440, maxWidth: '90%', border: '1px solid rgba(13,148,136,0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>➕ Add New Employee</h3>
              <button onClick={() => setShowAddEmpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={handleAddEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={empName}
                  onChange={e => setEmpName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Role / Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Billing Executive / Store Manager"
                  value={empRole}
                  onChange={e => setEmpRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Mobile Number (Digits Only) *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={empPhone}
                  onChange={e => setEmpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Monthly Salary (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 35000"
                  value={empSalary}
                  onChange={e => setEmpSalary(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddEmpModal(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', backgroundColor: '#F8FAFC', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', backgroundColor: '#0D9488', color: '#FFF', cursor: 'pointer', fontWeight: 700 }}>Save to DB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, width: 440, maxWidth: '90%', border: '1px solid rgba(13,148,136,0.3)', textAlign: 'center' }}>
            <BarChart3 size={40} color="#0D9488" style={{ marginBottom: 10 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>📊 Business Report Generator</h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>Generate instant profit &amp; loss, sales, stock, and tax summary report in simple English.</p>
            <button
              onClick={() => {
                setReportGenerated(true);
                setTimeout(() => {
                  alert("Full Business Summary PDF report downloaded to your device!");
                  setShowReportModal(false);
                  setReportGenerated(false);
                }, 1000);
              }}
              style={{ width: '100%', padding: 12, borderRadius: 8, backgroundColor: '#0D9488', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              {reportGenerated ? 'Downloading PDF Report...' : '⬇️ Download Instant Summary Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   1. OVERVIEW MODULE
   ═════════════════════════════════════════════════════════════════════ */
function OverviewModule({ companyName, onNavigate, empList, dbUsersList, onOpenAddEmp, onOpenUpload, onOpenCreateInvoice, onOpenReport }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── TOP SECTION: GRAPHS FIRST ────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>📊 Business Performance Graphs</h3>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Easy to understand visual charts for profit, revenue, and pending works</p>
          </div>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, backgroundColor: '#0D9488', color: '#FFF', fontWeight: 700 }}>
            LIVE STORE STATS
          </span>
        </div>

        {/* 4 Interactive Easy Visual Graphs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(13,148,136,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Profit &amp; Loss Graph</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>+₹ 19,15,300</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>▲ +18.8% Net Profit</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[40, 55, 70, 60, 85, 95].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#16a34a', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Month ${i+1}: ${val}% profit`} />
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(13,148,136,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Revenue (Money Earned)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>₹ 48,29,500</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>▲ +12.4% Sales Growth</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[50, 65, 80, 75, 90, 100].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#0D9488', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Revenue: ${val}%`} />
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(13,148,136,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Pending Bills &amp; Works</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', marginTop: 4 }}>₹ 3,45,000</div>
              <div style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginTop: 2 }}>⌛ 6 Supplier Bills Pending</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[80, 60, 45, 30, 50, 40].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#d97706', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Pending: ${val}%`} />
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(13,148,136,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>Sales vs Expenses</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>₹ 29,14,200</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>▼ -3.1% Expenses Cut</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[35, 45, 30, 50, 40, 30].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#0D9488', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Expense: ${val}%`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid rgba(13,148,136,0.2)' }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>⚡ Quick Action Buttons</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={onOpenUpload} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#0D9488', color: '#FFFFFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={16} color="#FFFFFF" />
                <span>Upload Invoice (Supplier)</span>
              </button>

              <button onClick={onOpenCreateInvoice} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#F0FDFA', color: '#0F172A', border: '1.5px solid rgba(13,148,136,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="#0D9488" />
                <span>Create Customer Bill</span>
              </button>

              <button onClick={onOpenAddEmp} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#F0FDFA', color: '#0F172A', border: '1.5px solid rgba(13,148,136,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={16} color="#0D9488" />
                <span>➕ Add New Employee</span>
              </button>

              <button onClick={onOpenReport} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#0D9488', color: '#FFFFFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="#FFFFFF" />
                <span>📊 Report Generator</span>
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(13,148,136,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={18} color="#0D9488" />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>📦 Shop Stock Details</h4>
              </div>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: 99 }}>
                3 Low Stock Items
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.15)' }}>
                <div style={{ color: '#475569', fontSize: 11 }}>Cooking Oil</div>
                <div style={{ fontWeight: 800, color: '#ef4444', marginTop: 2 }}>12 Packs Left</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.15)' }}>
                <div style={{ color: '#475569', fontSize: 11 }}>Rice Bags (25kg)</div>
                <div style={{ fontWeight: 800, color: '#ef4444', marginTop: 2 }}>8 Bags Left</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.15)' }}>
                <div style={{ color: '#475569', fontSize: 11 }}>Refined Sugar</div>
                <div style={{ fontWeight: 800, color: '#ef4444', marginTop: 2 }}>15 kg Left</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, border: '1px solid rgba(13,148,136,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Users size={16} color="#0D9488" />
                <span style={{ fontSize: 13, fontWeight: 800 }}>Suppliers (6 Active)</span>
              </div>
              <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                • Apex Wholesale Distributors<br />
                • Global FMCG Supplies<br />
                • National Logistics Corp
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, border: '1px solid rgba(13,148,136,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Receipt size={16} color="#d97706" />
                <span style={{ fontSize: 13, fontWeight: 800 }}>Remaining Unpaid Bills</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>₹ 3,45,000</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Due in next 7 to 15 days</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(13,148,136,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={18} color="#0D9488" />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>👥 Employees ({empList.length} Staff Members)</h4>
              </div>
              <button onClick={onOpenAddEmp} style={{ fontSize: 11, color: '#0D9488', fontWeight: 700, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>
                + Add Staff
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {empList.slice(0, 4).map((emp, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, backgroundColor: '#F8FAFC', fontSize: 12 }}>
                  <div>
                    <strong style={{ color: '#0F172A' }}>{emp.name}</strong>
                    <span style={{ color: '#475569', marginLeft: 8 }}>({emp.role})</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0D9488' }}>{emp.salary}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: FRAUD ALERTS AS CHAT HISTORY */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid rgba(13,148,136,0.2)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(13,148,136,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} color="#ef4444" />
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>🛡️ Fraud Alerts Chat History</h4>
                <div style={{ fontSize: 11, color: '#475569' }}>Real-time AI Security &amp; Fake Bill Chat Feed</div>
              </div>
            </div>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 800 }}>
              LIVE SECURITY CHAT
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 520, paddingRight: 4 }}>
            <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#e11d48', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⚠️ FAKE BILL DETECTED
                </span>
                <span style={{ fontSize: 10, color: '#9f1239' }}>Today, 10:24 AM</span>
              </div>
              <p style={{ fontSize: 12, color: '#881337', lineHeight: 1.5, marginBottom: 8 }}>
                <strong>FinGuard Security Bot:</strong> Intercepted a duplicate invoice of <strong>₹ 14,200</strong> from Apex Distributors. Invoice #INV-9021 matches a bill paid 5 days ago!
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => alert("Fake invoice blocked successfully!")} style={{ padding: '6px 12px', borderRadius: 6, backgroundColor: '#e11d48', color: '#FFF', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Block Bill</button>
                <button onClick={() => alert("Marked as verified.")} style={{ padding: '6px 12px', borderRadius: 6, backgroundColor: '#FFFFFF', color: '#881337', border: '1px solid #fecdd3', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Ignore Alert</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#d48806', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⚠️ PRICE INFLATION WARNING
                </span>
                <span style={{ fontSize: 10, color: '#8c6b00' }}>Yesterday, 04:15 PM</span>
              </div>
              <p style={{ fontSize: 12, color: '#614700', lineHeight: 1.5 }}>
                <strong>FinGuard Security Bot:</strong> Supplier 'Global FMCG' charged ₹ 450 per unit for Cooking Oil. Market price benchmark is ₹ 390. Total overcharge: <strong>₹ 3,600</strong>.
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✅ SAFE PAYMENT VERIFIED
                </span>
                <span style={{ fontSize: 10, color: '#15803d' }}>01 Aug, 02:00 PM</span>
              </div>
              <p style={{ fontSize: 12, color: '#14532d', lineHeight: 1.5 }}>
                <strong>FinGuard Security Bot:</strong> Store staff salary payout of ₹ 1,45,000 verified against biometric attendance and approved by owner.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM SECTION: CASHFLOW HISTORY ─────────────────────────── */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, border: '1px solid rgba(13,148,136,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>📜 Cashflow History (Money In vs Money Out)</h3>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Complete history of every rupee entering and leaving your store account</p>
          </div>
          <button style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', color: '#0D9488', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Download Cashflow Statement
          </button>
        </div>

        <TableCard
          headers={['Ref ID', 'Date & Time', 'Type', 'Description', 'Category', 'Amount (₹)', 'Running Balance']}
          rows={[
            ['TRX-9011', '03 Aug 2026, 09:30 AM', 'IN', 'Daily Store Retail Customer Sales', 'Sales Revenue', '+₹ 1,45,000', '₹ 14,80,000'],
            ['TRX-9010', '02 Aug 2026, 04:15 PM', 'OUT', 'Vendor Payment - Apex Wholesale', 'Supplier Bills', '-₹ 45,000', '₹ 13,35,000'],
            ['TRX-9009', '01 Aug 2026, 06:00 PM', 'OUT', 'Store Electricity Bill Payment', 'Shop Utilities', '-₹ 18,400', '₹ 13,80,000'],
            ['TRX-9008', '31 Jul 2026, 02:30 PM', 'IN', 'Wholesale Bulk Order Payment', 'Bulk Sales', '+₹ 3,20,000', '₹ 13,98,400'],
            ['TRX-9007', '30 Jul 2026, 11:00 AM', 'OUT', 'Monthly Staff Salary Payout', 'Employee Salaries', '-₹ 1,65,000', '₹ 10,78,400'],
          ]}
        />
      </div>

    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   MODULE SUB-COMPONENTS
   ═════════════════════════════════════════════════════════════════════ */

function InvoiceManagementModule({ onOpenCreateInvoice, onOpenUpload }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Invoice Management Terminal</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onOpenUpload} style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', color: '#0D9488', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Upload size={14} /> Scan Supplier Invoice
          </button>
          <button onClick={onOpenCreateInvoice} style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#0D9488', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Create Customer Bill
          </button>
        </div>
      </div>
      <TableCard
        headers={['Invoice ID', 'Customer / Vendor', 'Date', 'Amount', 'Status', 'Actions']}
        rows={[
          ['INV-2026-001', 'Metro Retail Ltd', '01 Aug 2026', '₹ 1,45,000', 'PAID', 'Download PDF'],
          ['INV-2026-002', 'Apex Hardware', '30 Jul 2026', '₹ 88,400', 'PENDING', 'Send Reminder'],
          ['INV-2026-003', 'Globex Corp', '28 Jul 2026', '₹ 2,10,000', 'PAID', 'Download PDF'],
          ['INV-2026-004', 'Sigma Logistics', '25 Jul 2026', '₹ 45,000', 'DUPLICATE ALERT', 'Resolve Risk'],
        ]}
      />
    </div>
  );
}

function PaymentManagementModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <KpiCard title="Pending Payments" value="₹ 3,45,000" change="4 Invoices" positive={false} icon={Clock} />
        <KpiCard title="Paid Payments (This Month)" value="₹ 24,10,000" change="18 Receipts" positive icon={CheckCircle2} />
        <KpiCard title="Upcoming Due (Next 7 Days)" value="₹ 1,80,000" change="2 Reminders Sent" positive icon={Bell} />
      </div>
      <TableCard
        headers={['Transaction ID', 'Payee / Recipient', 'Payment Method', 'Amount', 'Status']}
        rows={[
          ['PAY-8821', 'Apex Hardware Supplies', 'UPI Direct Link', '₹ 45,000', 'SUCCESS'],
          ['PAY-8822', 'State Electricity Board', 'Auto Bank Transfer', '₹ 18,400', 'SCHEDULED'],
          ['PAY-8823', 'Logistics Freight Corp', 'NEFT Bank Link', '₹ 62,000', 'PENDING'],
        ]}
      />
    </div>
  );
}

function ExpenseManagementModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Shop Expenses &amp; Employee Claims</h3>
        <button style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#0D9488', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Add New Expense Claim
        </button>
      </div>
      <TableCard
        headers={['Expense ID', 'Department', 'Submitted By', 'Category', 'Amount', 'Status']}
        rows={[
          ['EXP-101', 'Logistics & Warehouse', 'Rajesh K. (Ops)', 'Fuel & Transit', '₹ 12,400', 'APPROVED'],
          ['EXP-102', 'Store Operations', 'Priya M. (Staff)', 'Store Packaging', '₹ 8,500', 'PENDING APPROVAL'],
          ['EXP-103', 'IT & Infrastructure', 'Vikram S. (Admin)', 'Software Subscriptions', '₹ 34,000', 'APPROVED'],
        ]}
      />
    </div>
  );
}

function InventoryManagementModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Stock &amp; Inventory Management</h3>
        <button style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#0D9488', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Add New Product Item
        </button>
      </div>
      <TableCard
        headers={['SKU Code', 'Item Name', 'Category', 'In Stock Units', 'Reorder Level', 'Status']}
        rows={[
          ['SKU-8821', 'Sunflower Cooking Oil (1L)', 'Grocery', '12 Packs', '20 Packs', 'LOW STOCK ALERT'],
          ['SKU-8822', 'Basmati Rice Bag (25kg)', 'Grains', '8 Bags', '15 Bags', 'LOW STOCK ALERT'],
          ['SKU-8823', 'Refined Sugar (1kg)', 'Essentials', '15 kg', '30 kg', 'LOW STOCK ALERT'],
          ['SKU-8824', 'Wheat Flour (10kg)', 'Grains', '120 Bags', '25 Bags', 'HEALTHY STOCK'],
        ]}
      />
    </div>
  );
}

function SalesManagementModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Sales Ref', 'Date', 'Customer Name', 'Items Count', 'Total Sale Amount', 'Payment Type']}
        rows={[
          ['SALE-901', '03 Aug 2026', 'Walk-in Retail Customer', '6 Items', '₹ 3,450', 'UPI Direct'],
          ['SALE-902', '03 Aug 2026', 'Apex Traders Bulk', '120 Items', '₹ 1,45,000', 'Bank Transfer'],
          ['SALE-903', '02 Aug 2026', 'City Restaurant Chain', '45 Items', '₹ 48,000', 'Cash Credit'],
        ]}
      />
    </div>
  );
}

function VendorManagementModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Vendor ID', 'Supplier Name', 'Contact Person', 'Mobile Number', 'Pending Amount', 'Status']}
        rows={[
          ['VEN-001', 'Apex Wholesale Distributors', 'Suresh Patel', '9876511223', '₹ 1,45,000', 'Active'],
          ['VEN-002', 'Global FMCG Supplies Ltd', 'Amitabh Roy', '9876522334', '₹ 88,400', 'Active'],
          ['VEN-003', 'National Logistics Corp', 'Rohan Sharma', '9876533445', '₹ 0.00', 'Active'],
        ]}
      />
    </div>
  );
}

function PurchaseManagementModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['PO Number', 'Supplier', 'Order Date', 'Total Items', 'PO Amount', 'Delivery Status']}
        rows={[
          ['PO-2026-88', 'Apex Wholesale Distributors', '01 Aug 2026', '500 Units', '₹ 2,10,000', 'IN TRANSIT'],
          ['PO-2026-89', 'Global FMCG Supplies', '28 Jul 2026', '250 Units', '₹ 95,000', 'DELIVERED'],
        ]}
      />
    </div>
  );
}

function TransactionsModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Transaction ID', 'Date', 'Type', 'Description', 'Amount', 'Status']}
        rows={[
          ['TX-1001', '03 Aug 2026', 'CREDIT', 'Customer Invoice #INV-2026-001', '+₹ 1,45,000', 'SUCCESS'],
          ['TX-1002', '02 Aug 2026', 'DEBIT', 'Supplier Bill #PAY-8821', '-₹ 45,000', 'SUCCESS'],
          ['TX-1003', '01 Aug 2026', 'DEBIT', 'Electricity Utilities Bill', '-₹ 18,400', 'SUCCESS'],
        ]}
      />
    </div>
  );
}

function FraudDetectionModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ padding: 18, borderRadius: 12, backgroundColor: '#fee2e2', border: '1px solid #fecdd3', color: '#9f1239' }}>
        <h4 style={{ fontSize: 16, fontWeight: 800 }}>🛡️ AI Fraud Interceptor Active</h4>
        <p style={{ fontSize: 12, marginTop: 4 }}>FinGuard AI monitors your invoices and bank transfers 24/7 to block duplicate bills and price gouging.</p>
      </div>
      <TableCard
        headers={['Alert ID', 'Date & Time', 'Risk Type', 'Source / Vendor', 'Amount Involved', 'Action Taken']}
        rows={[
          ['ALERT-901', '03 Aug 2026, 10:24 AM', 'DUPLICATE INVOICE', 'Apex Distributors', '₹ 14,200', 'BLOCKED BY AI'],
          ['ALERT-889', '28 Jul 2026, 04:15 PM', 'PRICE INFLATION', 'Global FMCG Ltd', '₹ 3,600 Overcharge', 'FLAGGED FOR REVIEW'],
        ]}
      />
    </div>
  );
}

function ComplianceModule() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TableCard
        headers={['Tax Return', 'Filing Period', 'Due Date', 'Status', 'Estimated Tax', 'Download']}
        rows={[
          ['GSTR-1 (Sales Output)', 'July 2026', '11 Aug 2026', 'READY TO FILE', '₹ 48,200', 'Download JSON'],
          ['GSTR-3B (Monthly Tax)', 'July 2026', '20 Aug 2026', 'CALCULATED', '₹ 16,050 Net', 'Download Report'],
        ]}
      />
    </div>
  );
}

function AiAdvisorModule({ aiMessages, onSend, inputQuery, setInputQuery }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(13,148,136,0.2)', overflow: 'hidden' }}>
      <div style={{ padding: 16, backgroundColor: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Bot size={22} color="#0D9488" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>24/7 FinGuard AI Business Helper</div>
          <div style={{ fontSize: 11, color: '#CCFBF1' }}>Ask questions in simple English about your store finance</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: '#F8FAFC' }}>
        {aiMessages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: m.sender === 'user' ? '#0F172A' : '#FFFFFF', color: m.sender === 'user' ? '#FFF' : '#0F172A', padding: '12px 16px', borderRadius: 14, maxWidth: '75%', fontSize: 13, border: m.sender === 'ai' ? '1px solid rgba(13,148,136,0.2)' : 'none' }}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={onSend} style={{ padding: 14, borderTop: '1px solid rgba(13,148,136,0.15)', display: 'flex', gap: 10, backgroundColor: '#FFF' }}>
        <input type="text" placeholder="Type your question in simple English..." value={inputQuery} onChange={e => setInputQuery(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontSize: 13 }} />
        <button type="submit" style={{ padding: '12px 20px', borderRadius: 8, backgroundColor: '#0D9488', color: '#FFF', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Send</button>
      </form>
    </div>
  );
}

function ReportsModule({ onOpenReport }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Simple Business Reports Generator</h3>
        <button onClick={onOpenReport} style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#0D9488', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          📊 Generate Full Report PDF
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 14, border: '1px solid rgba(13,148,136,0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800 }}>Profit &amp; Loss Statement</h4>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Monthly profit breakdown, margins &amp; expenses.</p>
          <button onClick={onOpenReport} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', color: '#0D9488', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Report</button>
        </div>
        <div style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 14, border: '1px solid rgba(13,148,136,0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800 }}>GST Tax Audit Report</h4>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>GSTR-1, GSTR-3B tax calculations ready for CA.</p>
          <button onClick={onOpenReport} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', color: '#0D9488', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Report</button>
        </div>
        <div style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 14, border: '1px solid rgba(13,148,136,0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800 }}>Stock Valuation Report</h4>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Total value of all products currently in store.</p>
          <button onClick={onOpenReport} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)', color: '#0D9488', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Report</button>
        </div>
      </div>
    </div>
  );
}

function NotificationsCenterModule({ onClear }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Notifications Center</h3>
        <button onClick={onClear} style={{ fontSize: 12, color: '#0D9488', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Mark all as read</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 10, backgroundColor: '#FFF', border: '1px solid rgba(13,148,136,0.2)', fontSize: 13 }}>
          ⚠️ <strong>Fake Bill Alert:</strong> AI blocked a duplicate invoice of ₹ 14,200 from Apex Distributors.
        </div>
        <div style={{ padding: 14, borderRadius: 10, backgroundColor: '#FFF', border: '1px solid rgba(13,148,136,0.2)', fontSize: 13 }}>
          📦 <strong>Low Stock Warning:</strong> Cooking Oil and Sugar are running low. Reorder soon!
        </div>
        <div style={{ padding: 14, borderRadius: 10, backgroundColor: '#FFF', border: '1px solid rgba(13,148,136,0.2)', fontSize: 13 }}>
          ✅ <strong>GST Ready:</strong> GSTR-1 tax summary report for July is ready to file.
        </div>
      </div>
    </div>
  );
}

function EmployeeManagementModule({ empList, setEmpList, initialOpenAdd = false }) {
  const [showAddModal, setShowAddModal] = useState(initialOpenAdd);
  const [editingEmp, setEditingEmp] = useState(null);

  // Form states for Add Employee
  const [name, setName] = useState('');
  const [role, setRole] = useState('Store Operations Manager');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');

  // Form states for Edit Employee & Salary Permission
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
    const newEmp = {
      id: `EMP-00${empList.length + 1}`,
      name,
      role,
      phone: phone.replace(/\D/g, ''),
      salary: formattedSalary,
      status: 'Active',
    };
    const updated = saveEmployeeToDb(newEmp);
    if (setEmpList) setEmpList(updated);
    setName('');
    setPhone('');
    setSalary('');
    setShowAddModal(false);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setEditName(emp.name);
    setEditRole(emp.role);
    setEditPhone(emp.phone);
    setEditSalary(emp.salary.replace(/[^0-9]/g, ''));
    setEditStatus(emp.status || 'Active');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingEmp) return;
    const formattedSalary = editSalary ? `₹ ${Number(editSalary).toLocaleString('en-IN')}` : editingEmp.salary;
    const updatedList = empList.map(e => {
      if (e.id === editingEmp.id) {
        return {
          ...e,
          name: editName,
          role: editRole,
          phone: editPhone.replace(/\D/g, ''),
          salary: formattedSalary,
          status: editStatus,
        };
      }
      return e;
    });
    if (setEmpList) setEmpList(updatedList);
    try {
      localStorage.setItem('finguard_postgres_employees', JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }
    setEditingEmp(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16,
        border: '1px solid rgba(13,148,136,0.2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
            👥 Employee Management ({empList.length} Active Staff Members)
          </h3>
          <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
            Manage staff profiles, assign store roles, update monthly salary, and grant editing permissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 18px', borderRadius: 10,
            backgroundColor: '#0D9488', color: '#FFFFFF',
            border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <Plus size={16} />
          <span>+ Add New Employee</span>
        </button>
      </div>

      {/* Employee List Table with Edit Permission & Salary Action */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(13,148,136,0.2)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F0FDFA', borderBottom: '1px solid rgba(13,148,136,0.15)', color: '#0D9488', textTransform: 'uppercase', fontSize: 11, fontFamily: 'monospace' }}>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Emp ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Staff Name</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Role Title</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Mobile Number</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Monthly Salary</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'right' }}>Owner Action & Salary Edit</th>
              </tr>
            </thead>
            <tbody>
              {empList.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid rgba(13,148,136,0.1)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0D9488' }}>{emp.id}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>{emp.name}</td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>{emp.role}</td>
                  <td style={{ padding: '14px 18px', color: '#0F172A', fontWeight: 600 }}>{emp.phone}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0D9488' }}>{emp.salary}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                      backgroundColor: emp.status === 'Active' ? '#f0fdf4' : '#fee2e2',
                      color: emp.status === 'Active' ? '#16a34a' : '#b91c1c',
                      border: `1px solid ${emp.status === 'Active' ? '#bbf7d0' : '#fecdd3'}`,
                    }}>
                      {emp.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      style={{
                        padding: '6px 12px', borderRadius: 8,
                        backgroundColor: '#F0FDFA', border: '1px solid rgba(13,148,136,0.3)',
                        color: '#0D9488', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Edit Details & Salary</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Employee */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 28, width: 440, maxWidth: '90%', border: '1px solid rgba(13,148,136,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>➕ Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Employee Full Name *</label>
                <input type="text" required placeholder="e.g. Ramesh Verma" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Role Title *</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }}>
                  <option value="Store Operations Manager">Store Operations Manager</option>
                  <option value="Billing Specialist">Billing Specialist</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Chief Accountant">Chief Accountant</option>
                  <option value="Store Assistant">Store Assistant</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Mobile Phone Number *</label>
                <input type="tel" required maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Monthly Salary (₹)</label>
                <input type="text" placeholder="e.g. 35000" value={salary} onChange={e => setSalary(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }} />
              </div>
              <button type="submit" style={{ padding: 12, borderRadius: 10, backgroundColor: '#0D9488', color: '#FFF', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: 8 }}>
                Save Employee to PostgreSQL DB
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee Details & Update Salary */}
      {editingEmp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 28, width: 440, maxWidth: '90%', border: '1px solid rgba(13,148,136,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>✏️ Edit Employee Details & Salary</h3>
              <button onClick={() => setEditingEmp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Employee Name</label>
                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Role Title</label>
                <input type="text" required value={editRole} onChange={e => setEditRole(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Mobile Number</label>
                <input type="tel" required maxLength={10} value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Update Monthly Salary (Numeric ₹)</label>
                <input type="number" required value={editSalary} onChange={e => setEditSalary(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Employment Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)', outline: 'none' }}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" style={{ padding: 12, borderRadius: 10, backgroundColor: '#0D9488', color: '#FFF', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: 8 }}>
                Save Updated Details & Salary
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* SYSTEM USER DATABASE INSPECTOR MODULE */
function UserRolesModule({ dbUsersList = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: 20, borderRadius: 16, border: '1.5px solid #0D9488' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>👑 System Registered Users &amp; Passwords Inspector</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, backgroundColor: '#0D9488', color: '#FFF' }}>
            {dbUsersList.length} Users Stored in PostgreSQL
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#CCFBF1', marginTop: 4 }}>
          Inspect all registered store users, email addresses, mobile numbers, assigned roles, and passwords stored in PostgreSQL DB.
        </p>
      </div>

      <TableCard
        headers={['User ID / Code', 'Company Name', 'Primary Email', 'Password Hash / Plain', 'Mobile Number', 'Assigned Role']}
        rows={dbUsersList.map(u => [
          u.user_id,
          u.company_name,
          u.email,
          u.password_hash,
          u.mobile_number,
          u.role.toUpperCase(),
        ])}
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
  return (
    <div style={{ backgroundColor: '#FFF', padding: 24, borderRadius: 16, border: '1px solid rgba(13,148,136,0.2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800 }}>App &amp; Security Settings</h3>
      <div style={{ fontSize: 13, color: '#475569' }}>
        • Database: PostgreSQL Storage Configured<br />
        • Main Admin Account: <code>admin@finguard.ai</code> / <code>admin123</code><br />
        • Simple English Mode: Enabled (Active)<br />
        • AI Fraud Protection: High Sensitivity
      </div>
    </div>
  );
}

function ProfileModule({ ownerName, companyName, dbUsersList = [] }) {
  return (
    <div style={{ backgroundColor: '#FFF', padding: 24, borderRadius: 16, border: '1px solid rgba(13,148,136,0.2)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontSize: 18, fontWeight: 800 }}>👑 {ownerName}</h3>
      <div style={{ fontSize: 13, color: '#475569' }}>Company: <strong>{companyName}</strong></div>
      <div style={{ fontSize: 13, color: '#475569' }}>Role: Business Owner</div>
      <div style={{ fontSize: 13, color: '#0D9488', fontWeight: 700, marginTop: 8 }}>✓ PostgreSQL Database Connected ({dbUsersList.length} total users managed)</div>
    </div>
  );
}

/* UTILITY HELPERS */
function KpiCard({ title, value, change, positive, icon: Icon }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
      border: '1px solid rgba(13,148,136,0.2)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{title}</span>
        {Icon && <Icon size={18} color="#0D9488" />}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: positive ? '#16a34a' : '#d97706', marginTop: 4 }}>
        {change}
      </div>
    </div>
  );
}

function TableCard({ headers, rows }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(13,148,136,0.2)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#F0FDFA', borderBottom: '1px solid rgba(13,148,136,0.15)', color: '#0D9488', textTransform: 'uppercase', fontSize: 11, fontFamily: 'monospace' }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '12px 16px', fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: rIdx === rows.length - 1 ? 'none' : '1px solid rgba(13,148,136,0.1)' }}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '12px 16px', color: '#0F172A', fontWeight: cIdx === 0 ? 700 : 500 }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
