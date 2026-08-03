import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, CreditCard, Receipt, Package, TrendingUp,
  Users, ShoppingBag, ArrowLeftRight, ShieldAlert, FileCheck, Bot,
  BarChart3, Bell, UserCheck, Shield, Clock, Folder, Cpu,
  Settings, User, Search, Filter, Plus, Download, Upload, CheckCircle2,
  AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight,
  Send, Sparkles, LogOut, Copy, Check, Eye, Trash2, Edit3, Lock, MessageSquare, X, Database, Phone
} from 'lucide-react';
import { getStoredEmployees, saveEmployeeToDb, getStoredUsers } from '../services/postgresDb';

// 21 Simple English Modules List
const modulesList = [
  { id: 'overview', title: '1. Dashboard Overview', icon: LayoutDashboard, category: 'Main Dashboard' },
  { id: 'invoices', title: '2. Bills & Invoices', icon: FileText, category: 'Money & Billing' },
  { id: 'payments', title: '3. Payments & Receipts', icon: CreditCard, category: 'Money & Billing' },
  { id: 'expenses', title: '4. Daily Shop Expenses', icon: Receipt, category: 'Money & Billing' },
  { id: 'inventory', title: '5. Stock & Inventory', icon: Package, category: 'Store Operations' },
  { id: 'sales', title: '6. Total Sales History', icon: TrendingUp, category: 'Store Operations' },
  { id: 'vendors', title: '7. Suppliers & Vendors', icon: Users, category: 'Store Operations' },
  { id: 'purchases', title: '8. Buying Orders', icon: ShoppingBag, category: 'Store Operations' },
  { id: 'transactions', title: '9. Money Transactions', icon: ArrowLeftRight, category: 'Money & Billing' },
  { id: 'fraud', title: '10. Fraud & Fake Bill Warnings', icon: ShieldAlert, category: 'AI Security' },
  { id: 'compliance', title: '11. GST & Tax Compliance', icon: FileCheck, category: 'Taxes' },
  { id: 'ai_advisor', title: '12. AI Business Helper', icon: Bot, category: 'AI Security' },
  { id: 'reports', title: '13. Simple Business Reports', icon: BarChart3, category: 'Reports' },
  { id: 'notifications', title: '14. Notifications Alert', icon: Bell, category: 'Main Dashboard' },
  { id: 'employees', title: '15. Employee Details', icon: UserCheck, category: 'Team & Staff' },
  { id: 'user_roles', title: '16. Staff Access & User DB', icon: Shield, category: 'Team & Staff' },
  { id: 'audit_logs', title: '17. Activity History Logs', icon: Clock, category: 'Reports' },
  { id: 'documents', title: '18. Bill Files & Documents', icon: Folder, category: 'Store Operations' },
  { id: 'integrations', title: '19. App Connections', icon: Cpu, category: 'Settings' },
  { id: 'settings', title: '20. App Settings', icon: Settings, category: 'Settings' },
  { id: 'profile', title: '21. Owner Account Profile', icon: User, category: 'Settings' },
];

export default function BusinessOwnerDashboard({
  companyName = 'Metro Superstore Ltd',
  ownerName = 'Business Owner',
  onLogout,
  onOpenUploadPage,
  onOpenBillingPage,
}) {
  const [activeModule, setActiveModule] = useState('overview');
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
      backgroundColor: '#FAF8F3', color: '#1A1610',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ── FIXED LEFT SIDEBAR NAVIGATION (PERFECT FIXED LAYOUT) ──────── */}
      <aside style={{
        width: 280, backgroundColor: '#FFFFFF',
        borderRight: '1px solid rgba(201,185,154,0.4)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', flexShrink: 0, zIndex: 50,
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(201,185,154,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: '#1A1610',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1610' }}>FinGuard AI</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8A7558', fontFamily: 'monospace' }}>OWNER DASHBOARD</div>
            </div>
          </div>
        </div>

        {/* Module Search Filter */}
        <div style={{ padding: '14px 16px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.4)',
            borderRadius: 10, padding: '8px 12px',
          }}>
            <Search size={14} color="#8A7558" />
            <input
              type="text"
              placeholder="Search 21 Modules..."
              value={moduleSearch}
              onChange={e => setModuleSearch(e.target.value)}
              style={{
                border: 'none', backgroundColor: 'transparent', outline: 'none',
                width: '100%', fontSize: 12, color: '#1A1610', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* 21 Navigation Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {filteredModules.map((m) => {
            const Icon = m.icon;
            const active = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 10, marginBottom: 3,
                  backgroundColor: active ? '#1A1610' : 'transparent',
                  color: active ? '#FFFFFF' : '#1A1610',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 700 : 600,
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#FAF8F3'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={16} color={active ? '#FFFFFF' : '#8A7558'} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.title}
                </span>
                {m.id === 'fraud' && (
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, backgroundColor: '#ef4444', color: '#FFF', fontWeight: 800 }}>
                    1 ALERT
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div style={{
          padding: 16, borderTop: '1px solid rgba(201,185,154,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 17, backgroundColor: '#A88660',
              color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14, flexShrink: 0,
            }}>
              👑
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1610', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ownerName || 'Business Owner'}
              </div>
              <div style={{ fontSize: 10, color: '#6E6455', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
          borderBottom: '1px solid rgba(201,185,154,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1610' }}>
              {modulesList.find(m => m.id === activeModule)?.title}
            </h2>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, backgroundColor: 'rgba(92,112,94,0.12)', color: '#5C705E', fontWeight: 700 }}>
              POSTGRESQL DB CONNECTED
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Quick AI Trigger */}
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 99,
                backgroundColor: aiPanelOpen ? '#1A1610' : '#FAF8F3',
                border: '1px solid rgba(201,185,154,0.5)',
                color: aiPanelOpen ? '#FFFFFF' : '#1A1610',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Sparkles size={14} color={aiPanelOpen ? '#FFFFFF' : '#8A7558'} />
              <span>AI Chat Assistant</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveModule('notifications')}
              style={{
                position: 'relative', width: 38, height: 38, borderRadius: 10,
                backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#1A1610',
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
              onNavigate={setActiveModule}
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
          {activeModule === 'inventory' && <InventoryManagementModule />}
          {activeModule === 'sales' && <SalesManagementModule />}
          {activeModule === 'vendors' && <VendorManagementModule />}
          {activeModule === 'purchases' && <PurchaseManagementModule />}
          {activeModule === 'transactions' && <TransactionsModule />}
          {activeModule === 'fraud' && <FraudDetectionModule />}
          {activeModule === 'compliance' && <ComplianceModule />}
          {activeModule === 'ai_advisor' && <AiAdvisorModule aiMessages={aiMessages} onSend={handleSendAiMessage} inputQuery={inputQuery} setInputQuery={setInputQuery} />}
          {activeModule === 'reports' && <ReportsModule onOpenReport={() => setShowReportModal(true)} />}
          {activeModule === 'notifications' && <NotificationsCenterModule onClear={() => setNotificationCount(0)} />}
          {activeModule === 'employees' && <EmployeeManagementModule empList={empList} onOpenAddEmp={() => setShowAddEmpModal(true)} />}
          {activeModule === 'user_roles' && <UserRolesModule dbUsersList={dbUsersList} />}
          {activeModule === 'audit_logs' && <AuditLogsModule />}
          {activeModule === 'documents' && <DocumentsModule />}
          {activeModule === 'integrations' && <IntegrationsModule />}
          {activeModule === 'settings' && <SettingsModule />}
          {activeModule === 'profile' && <ProfileModule ownerName={ownerName} companyName={companyName} dbUsersList={dbUsersList} />}
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
            borderRadius: 20, border: '1.5px solid rgba(201,185,154,0.6)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            marginBottom: 12, animation: 'fadeInUp 0.25s ease',
          }}>
            <div style={{
              padding: '14px 18px', backgroundColor: '#1A1610', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#A88660', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>FinGuard AI Assistant</div>
                  <div style={{ fontSize: 10, color: '#C9B99A' }}>Always active for {companyName}</div>
                </div>
              </div>
              <button
                onClick={() => setAiPanelOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: '#FAF8F3' }}>
              {aiMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: m.sender === 'user' ? '#1A1610' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#1A1610',
                    borderRadius: 14, padding: '10px 14px', maxWidth: '85%',
                    fontSize: 12, lineHeight: 1.5,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    border: m.sender === 'ai' ? '1px solid rgba(201,185,154,0.4)' : 'none',
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendAiMessage} style={{ padding: 10, backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(201,185,154,0.3)', display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ask about sales, GST, stock..."
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8,
                  border: '1px solid rgba(201,185,154,0.4)', backgroundColor: '#FAF8F3',
                  fontSize: 12, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '9px 12px', borderRadius: 8, backgroundColor: '#1A1610',
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
            backgroundColor: '#1A1610', color: '#FFFFFF',
            border: '2px solid #C9B99A',
            boxShadow: '0 10px 25px rgba(26,22,16,0.3)',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800,
            transition: 'all 0.22s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={22} color="#C9B99A" />
          <span>FinGuard AI Chatbot</span>
          <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' }} />
        </button>
      </div>

      {/* MODALS */}
      {showAddEmpModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28,
            width: 440, maxWidth: '90%', border: '1px solid rgba(201,185,154,0.4)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1610' }}>➕ Add New Employee</h3>
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(201,185,154,0.5)', outline: 'none', fontSize: 13 }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(201,185,154,0.5)', outline: 'none', fontSize: 13 }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(201,185,154,0.5)', outline: 'none', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Monthly Salary (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 35000"
                  value={empSalary}
                  onChange={e => setEmpSalary(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(201,185,154,0.5)', outline: 'none', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddEmpModal(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid rgba(201,185,154,0.5)', backgroundColor: '#FAF8F3', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', backgroundColor: '#1A1610', color: '#FFF', cursor: 'pointer', fontWeight: 700 }}>Save to DB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, width: 440, maxWidth: '90%', border: '1px solid rgba(201,185,154,0.4)', textAlign: 'center' }}>
            <BarChart3 size={40} color="#8A7558" style={{ marginBottom: 10 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1610', marginBottom: 6 }}>📊 Business Report Generator</h3>
            <p style={{ fontSize: 13, color: '#6E6455', marginBottom: 20 }}>Generate instant profit &amp; loss, sales, stock, and tax summary report in simple English.</p>
            <button
              onClick={() => {
                setReportGenerated(true);
                setTimeout(() => {
                  alert("Full Business Summary PDF report downloaded to your device!");
                  setShowReportModal(false);
                  setReportGenerated(false);
                }, 1000);
              }}
              style={{ width: '100%', padding: 12, borderRadius: 8, backgroundColor: '#1A1610', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
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
   1. OVERVIEW MODULE (RESTRUCTURED & BANNER REMOVED ENTIRELY)
   ═════════════════════════════════════════════════════════════════════ */
function OverviewModule({ companyName, onNavigate, empList, dbUsersList, onOpenAddEmp, onOpenUpload, onOpenCreateInvoice, onOpenReport }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── TOP SECTION: GRAPHS FIRST ────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1610' }}>📊 Business Performance Graphs</h3>
            <p style={{ fontSize: 12, color: '#6E6455', marginTop: 2 }}>Easy to understand visual charts for profit, revenue, and pending works</p>
          </div>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, backgroundColor: '#1A1610', color: '#FFF', fontWeight: 700 }}>
            LIVE STORE STATS
          </span>
        </div>

        {/* 4 Interactive Easy Visual Graphs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6E6455', fontWeight: 700 }}>Profit &amp; Loss Graph</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>+₹ 19,15,300</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>▲ +18.8% Net Profit</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[40, 55, 70, 60, 85, 95].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#16a34a', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Month ${i+1}: ${val}% profit`} />
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6E6455', fontWeight: 700 }}>Revenue (Money Earned)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1610', marginTop: 4 }}>₹ 48,29,500</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>▲ +12.4% Sales Growth</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[50, 65, 80, 75, 90, 100].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#1A1610', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Revenue: ${val}%`} />
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6E6455', fontWeight: 700 }}>Pending Bills &amp; Works</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', marginTop: 4 }}>₹ 3,45,000</div>
              <div style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginTop: 2 }}>⌛ 6 Supplier Bills Pending</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[80, 60, 45, 30, 50, 40].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#d97706', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Pending: ${val}%`} />
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6E6455', fontWeight: 700 }}>Sales vs Expenses</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1610', marginTop: 4 }}>₹ 29,14,200</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>▼ -3.1% Expenses Cut</div>
            </div>
            <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 14 }}>
              {[35, 45, 30, 50, 40, 30].map((val, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: '#C9B99A', height: `${val}%`, borderRadius: '3px 3px 0 0' }} title={`Expense: ${val}%`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION: LEFT BUTTONS & DETAILS | RIGHT FRAUD ALERTS CHAT HISTORY ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid rgba(201,185,154,0.4)' }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1A1610', marginBottom: 14 }}>⚡ Quick Action Buttons</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={onOpenUpload} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#1A1610', color: '#FFFFFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={16} color="#C9B99A" />
                <span>Upload Invoice (Supplier)</span>
              </button>

              <button onClick={onOpenCreateInvoice} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#FAF8F3', color: '#1A1610', border: '1.5px solid rgba(201,185,154,0.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="#8A7558" />
                <span>Create Customer Bill</span>
              </button>

              <button onClick={onOpenAddEmp} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#FAF8F3', color: '#1A1610', border: '1.5px solid rgba(201,185,154,0.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={16} color="#5C705E" />
                <span>➕ Add New Employee</span>
              </button>

              <button onClick={onOpenReport} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#A88660', color: '#FFFFFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="#FFFFFF" />
                <span>📊 Report Generator</span>
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(201,185,154,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={18} color="#8A7558" />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1A1610' }}>📦 Shop Stock Details</h4>
              </div>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: 99 }}>
                3 Low Stock Items
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
              <div style={{ backgroundColor: '#FAF8F3', padding: 10, borderRadius: 8, border: '1px solid rgba(201,185,154,0.3)' }}>
                <div style={{ color: '#6E6455', fontSize: 11 }}>Cooking Oil</div>
                <div style={{ fontWeight: 800, color: '#ef4444', marginTop: 2 }}>12 Packs Left</div>
              </div>
              <div style={{ backgroundColor: '#FAF8F3', padding: 10, borderRadius: 8, border: '1px solid rgba(201,185,154,0.3)' }}>
                <div style={{ color: '#6E6455', fontSize: 11 }}>Rice Bags (25kg)</div>
                <div style={{ fontWeight: 800, color: '#ef4444', marginTop: 2 }}>8 Bags Left</div>
              </div>
              <div style={{ backgroundColor: '#FAF8F3', padding: 10, borderRadius: 8, border: '1px solid rgba(201,185,154,0.3)' }}>
                <div style={{ color: '#6E6455', fontSize: 11 }}>Refined Sugar</div>
                <div style={{ fontWeight: 800, color: '#ef4444', marginTop: 2 }}>15 kg Left</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, border: '1px solid rgba(201,185,154,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Users size={16} color="#8A7558" />
                <span style={{ fontSize: 13, fontWeight: 800 }}>Suppliers (6 Active)</span>
              </div>
              <div style={{ fontSize: 11, color: '#6E6455', lineHeight: 1.5 }}>
                • Apex Wholesale Distributors<br />
                • Global FMCG Supplies<br />
                • National Logistics Corp
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, border: '1px solid rgba(201,185,154,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Receipt size={16} color="#d97706" />
                <span style={{ fontSize: 13, fontWeight: 800 }}>Remaining Unpaid Bills</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>₹ 3,45,000</div>
              <div style={{ fontSize: 11, color: '#6E6455', marginTop: 2 }}>Due in next 7 to 15 days</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(201,185,154,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={18} color="#5C705E" />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1A1610' }}>👥 Employees ({empList.length} Staff Members)</h4>
              </div>
              <button onClick={onOpenAddEmp} style={{ fontSize: 11, color: '#1A1610', fontWeight: 700, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.5)', padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>
                + Add Staff
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {empList.slice(0, 4).map((emp, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, backgroundColor: '#FAF8F3', fontSize: 12 }}>
                  <div>
                    <strong style={{ color: '#1A1610' }}>{emp.name}</strong>
                    <span style={{ color: '#6E6455', marginLeft: 8 }}>({emp.role})</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#5C705E' }}>{emp.salary}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: FRAUD ALERTS AS CHAT HISTORY */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(201,185,154,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} color="#ef4444" />
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1A1610' }}>🛡️ Fraud Alerts Chat History</h4>
                <div style={{ fontSize: 11, color: '#6E6455' }}>Real-time AI Security &amp; Fake Bill Chat Feed</div>
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
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, border: '1px solid rgba(201,185,154,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1610' }}>📜 Cashflow History (Money In vs Money Out)</h3>
            <p style={{ fontSize: 12, color: '#6E6455', marginTop: 2 }}>Complete history of every rupee entering and leaving your store account</p>
          </div>
          <button style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
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
          <button onClick={onOpenUpload} style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Upload size={14} /> Scan Supplier Invoice
          </button>
          <button onClick={onOpenCreateInvoice} style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#1A1610', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
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
        <button style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#1A1610', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
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
        <button style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#1A1610', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(201,185,154,0.4)', overflow: 'hidden' }}>
      <div style={{ padding: 16, backgroundColor: '#1A1610', color: '#FFF', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Bot size={22} color="#C9B99A" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>24/7 FinGuard AI Business Helper</div>
          <div style={{ fontSize: 11, color: '#C9B99A' }}>Ask questions in simple English about your store finance</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: '#FAF8F3' }}>
        {aiMessages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: m.sender === 'user' ? '#1A1610' : '#FFFFFF', color: m.sender === 'user' ? '#FFF' : '#1A1610', padding: '12px 16px', borderRadius: 14, maxWidth: '75%', fontSize: 13, border: m.sender === 'ai' ? '1px solid rgba(201,185,154,0.4)' : 'none' }}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={onSend} style={{ padding: 14, borderTop: '1px solid rgba(201,185,154,0.3)', display: 'flex', gap: 10, backgroundColor: '#FFF' }}>
        <input type="text" placeholder="Type your question in simple English..." value={inputQuery} onChange={e => setInputQuery(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid rgba(201,185,154,0.4)', outline: 'none', fontSize: 13 }} />
        <button type="submit" style={{ padding: '12px 20px', borderRadius: 8, backgroundColor: '#1A1610', color: '#FFF', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Send</button>
      </form>
    </div>
  );
}

function ReportsModule({ onOpenReport }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Simple Business Reports Generator</h3>
        <button onClick={onOpenReport} style={{ padding: '10px 16px', borderRadius: 8, backgroundColor: '#1A1610', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          📊 Generate Full Report PDF
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 14, border: '1px solid rgba(201,185,154,0.4)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800 }}>Profit &amp; Loss Statement</h4>
          <p style={{ fontSize: 12, color: '#6E6455', marginTop: 4 }}>Monthly profit breakdown, margins &amp; expenses.</p>
          <button onClick={onOpenReport} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Report</button>
        </div>
        <div style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 14, border: '1px solid rgba(201,185,154,0.4)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800 }}>GST Tax Audit Report</h4>
          <p style={{ fontSize: 12, color: '#6E6455', marginTop: 4 }}>GSTR-1, GSTR-3B tax calculations ready for CA.</p>
          <button onClick={onOpenReport} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Report</button>
        </div>
        <div style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 14, border: '1px solid rgba(201,185,154,0.4)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800 }}>Stock Valuation Report</h4>
          <p style={{ fontSize: 12, color: '#6E6455', marginTop: 4 }}>Total value of all products currently in store.</p>
          <button onClick={onOpenReport} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, backgroundColor: '#FAF8F3', border: '1px solid rgba(201,185,154,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Report</button>
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
        <button onClick={onClear} style={{ fontSize: 12, color: '#6E5D44', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Mark all as read</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 10, backgroundColor: '#FFF', border: '1px solid rgba(201,185,154,0.4)', fontSize: 13 }}>
          ⚠️ <strong>Fake Bill Alert:</strong> AI blocked a duplicate invoice of ₹ 14,200 from Apex Distributors.
        </div>
        <div style={{ padding: 14, borderRadius: 10, backgroundColor: '#FFF', border: '1px solid rgba(201,185,154,0.4)', fontSize: 13 }}>
          📦 <strong>Low Stock Warning:</strong> Cooking Oil and Sugar are running low. Reorder soon!
        </div>
        <div style={{ padding: 14, borderRadius: 10, backgroundColor: '#FFF', border: '1px solid rgba(201,185,154,0.4)', fontSize: 13 }}>
          ✅ <strong>GST Ready:</strong> GSTR-1 tax summary report for July is ready to file.
        </div>
      </div>
    </div>
  );
}

function EmployeeManagementModule({ empList, onOpenAddEmp }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Employee &amp; Staff Details ({empList.length} Members)</h3>
        <button onClick={onOpenAddEmp} style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#1A1610', color: '#FFF', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          ➕ Add New Employee
        </button>
      </div>
      <TableCard
        headers={['Emp ID', 'Staff Name', 'Role Title', 'Mobile Number', 'Salary', 'Status']}
        rows={empList.map(e => [e.id, e.name, e.role, e.phone, e.salary, e.status])}
      />
    </div>
  );
}

/* SYSTEM USER DATABASE INSPECTOR MODULE (AVAILABLE VIA TAB) */
function UserRolesModule({ dbUsersList = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ backgroundColor: '#1A1610', color: '#FFFFFF', padding: 20, borderRadius: 16, border: '1.5px solid #C9B99A' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>👑 System Registered Users &amp; Passwords Inspector</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, backgroundColor: '#A88660', color: '#FFF' }}>
            {dbUsersList.length} Users Stored in PostgreSQL
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#C9B99A', marginTop: 4 }}>
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
    <div style={{ backgroundColor: '#FFF', padding: 24, borderRadius: 16, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800 }}>App &amp; Security Settings</h3>
      <div style={{ fontSize: 13, color: '#6E6455' }}>
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
    <div style={{ backgroundColor: '#FFF', padding: 24, borderRadius: 16, border: '1px solid rgba(201,185,154,0.4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ fontSize: 18, fontWeight: 800 }}>👑 {ownerName}</h3>
      <div style={{ fontSize: 13, color: '#6E6455' }}>Company: <strong>{companyName}</strong></div>
      <div style={{ fontSize: 13, color: '#6E6455' }}>Role: Business Owner</div>
      <div style={{ fontSize: 13, color: '#5C705E', fontWeight: 700, marginTop: 8 }}>✓ PostgreSQL Database Connected ({dbUsersList.length} total users managed)</div>
    </div>
  );
}

/* UTILITY HELPERS */
function KpiCard({ title, value, change, positive, icon: Icon }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
      border: '1px solid rgba(201,185,154,0.4)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6E6455' }}>{title}</span>
        {Icon && <Icon size={18} color="#8A7558" />}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1610', marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: positive ? '#16a34a' : '#d97706', marginTop: 4 }}>
        {change}
      </div>
    </div>
  );
}

function TableCard({ headers, rows }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(201,185,154,0.4)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '1px solid rgba(201,185,154,0.3)', color: '#8A7558', textTransform: 'uppercase', fontSize: 11, fontFamily: 'monospace' }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '12px 16px', fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: rIdx === rows.length - 1 ? 'none' : '1px solid rgba(201,185,154,0.2)' }}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '12px 16px', color: '#1A1610', fontWeight: cIdx === 0 ? 700 : 500 }}>
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
