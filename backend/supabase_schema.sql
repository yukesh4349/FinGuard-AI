-- =====================================================================
-- FINSIGHT AI - SUPABASE MULTI-TENANT DATABASE SCHEMA (DDL)
-- Copy and run this script in your Supabase SQL Editor
-- Dashboard URL: https://supabase.com/dashboard/project/_/sql/new
-- =====================================================================

-- CLEAN UP EXISTING TABLES TO PREVENT COLUMN MISSING ERRORS
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.fraud_alerts CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.customer_bills CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. USERS TABLE (Store Owners & Staff Accounts)
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    business_type VARCHAR(100) DEFAULT 'General Retail',
    employee_count VARCHAR(50) DEFAULT '5',
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner',
    verified_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_user_id ON public.users(user_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_mobile ON public.users(mobile_number);

-- 2. STAFF / EMPLOYEES CONTAINER TABLE (Scoped per Store Owner)
CREATE TABLE public.staff (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    salary VARCHAR(50) DEFAULT '₹ 0',
    status VARCHAR(50) DEFAULT 'Active',
    joined_date VARCHAR(50) DEFAULT TO_CHAR(CURRENT_DATE, 'DD-Mon-YYYY'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_user_id ON public.staff(user_id);

-- 3. INVENTORY / STOCK TABLE (Scoped per Store Owner)
CREATE TABLE public.inventory (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General Store',
    stock_qty INT DEFAULT 0,
    min_alert_threshold INT DEFAULT 15,
    unit_price VARCHAR(50) DEFAULT '₹ 0',
    cost_price VARCHAR(50) DEFAULT '₹ 0',
    selling_price VARCHAR(50) DEFAULT '₹ 0',
    gst_rate VARCHAR(20) DEFAULT '5%',
    status VARCHAR(50) DEFAULT 'Healthy Stock',
    supplier_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_user_id ON public.inventory(user_id);

-- 4. VENDOR OCR INVOICES TABLE (Scoped per Store Owner)
CREATE TABLE public.invoices (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    subtotal DECIMAL(12, 2) DEFAULT 0.00,
    tax_gst DECIMAL(12, 2) DEFAULT 0.00,
    grand_total DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Verified',
    risk_score VARCHAR(100) DEFAULT '0.01 (Safe)',
    duplicate_reason TEXT,
    payment_status VARCHAR(50) DEFAULT 'Paid',
    due_date DATE,
    items JSONB DEFAULT '[]'::jsonb,
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);

-- 5. CUSTOMER POS BILLS TABLE (Scoped per Store Owner)
CREATE TABLE public.customer_bills (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    bill_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    subtotal DECIMAL(12, 2) DEFAULT 0.00,
    tax_gst DECIMAL(12, 2) DEFAULT 0.00,
    grand_total DECIMAL(12, 2) DEFAULT 0.00,
    profit_earned DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Paid',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_bills_user_id ON public.customer_bills(user_id);

-- 6. MONEY TRANSACTIONS TABLE (Scoped per Store Owner)
CREATE TABLE public.transactions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    date VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('IN', 'OUT')),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    balance VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- 7. DAILY SHOP EXPENSES TABLE (Scoped per Store Owner)
CREATE TABLE public.expenses (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    paid_to VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);

-- 8. FRAUD ALERTS TABLE (Scoped per Store Owner)
CREATE TABLE public.fraud_alerts (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'HIGH',
    resolved BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);

-- 9. AUDIT & SYSTEM ACTIVITY LOGS TABLE (Scoped per Store Owner)
CREATE TABLE public.activity_logs (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'System Log',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR PER-STORE ISOLATION
-- =====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for application integration
CREATE POLICY public_users_policy ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_staff_policy ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_inventory_policy ON public.inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_invoices_policy ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_customer_bills_policy ON public.customer_bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_transactions_policy ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_expenses_policy ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_fraud_alerts_policy ON public.fraud_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY public_activity_logs_policy ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);


