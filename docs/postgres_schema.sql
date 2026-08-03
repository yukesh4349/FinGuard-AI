-- ============================================================
-- FINGUARD AI - POSTGRESQL DATABASE SCHEMA
-- Database: finguard_db
-- Description: Stores user login credentials, company info,
-- invoices, employees, suppliers, and cashflow history.
-- ============================================================

-- Create Users Table (User ID, Password Hash, Mobile, Role)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    company_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    salary NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    joined_date DATE DEFAULT CURRENT_DATE
);

-- Create Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    pending_bills_amount NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active'
);

-- Create Invoices Table (Billing & Supplier Invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('customer', 'supplier')),
    party_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Cashflow Logs Table
CREATE TABLE IF NOT EXISTS cashflow_logs (
    id SERIAL PRIMARY KEY,
    transaction_ref VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('IN', 'OUT')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Demo Owner Account in PostgreSQL
INSERT INTO users (user_id, company_name, mobile_number, email, password_hash, role)
VALUES ('OWNER-METRO-8492', 'Metro Superstore Ltd', '9876543210', 'owner@metrosuperstore.com', 'FG-8924-XK9', 'owner')
ON CONFLICT (user_id) DO NOTHING;
