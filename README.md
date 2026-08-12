# 🚀 Finora AI — Smart Finance, Smarter Business

<div align="center">

![Finora Banner](https://img.shields.io/badge/Finora%20AI-Smart%20Finance%2C%20Smarter%20Business-B4781C?style=for-the-badge&logo=react)

**The All-In-One AI Shop Money Management, POS Billing & Neural OCR Fraud Interceptor Platform**

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express.js%20REST%20API-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-NVIDIA_Nemotron_Vision_%2B_Tesseract.js-76B900?style=flat-square&logo=nvidia)](https://build.nvidia.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**Finora AI** (also known as **FinGuard AI**) is an enterprise-grade AI financial management, POS billing, bill verification, and smart inventory platform designed specifically for retail store owners, wholesale traders, accountants, and stock managers.

By combining **NVIDIA Nemotron Vision AI** server-side OCR, **automated duplicate bill detection**, **real-time POS customer checkout**, **Supabase PostgreSQL inventory auto-synchronization**, **role-based employee management**, and **GST compliance verification**, Finora AI safeguards business profitability 24/7.

---

## 📐 System Design & Technical Architecture

For an in-depth technical analysis of all **System Design concepts, data pipelines, RBAC security, API mapping, and database schemas**, refer to:
* 📄 **System Design Guide**: [docs/SYSTEM_DESIGN_CONCEPTS.md](docs/SYSTEM_DESIGN_CONCEPTS.md)
* 🗺️ **Visual Architecture & Customer Flow SVG**: [docs/system_architecture_and_customer_flow.svg](docs/system_architecture_and_customer_flow.svg)

---

## ✨ Key Features

### ⚡ 1. Neural OCR & Vendor Invoice Scanner
* **Multi-Format Document Parsing**: Upload vendor bills, receipts, or photos (`PNG`, `JPG`, `PDF`) to automatically extract vendor name, GSTIN, invoice dates, bill numbers, line items, quantities, cost rates, retail MRPs, GST rates, and total amounts.
* **NVIDIA Nemotron Vision AI & Tesseract.js**: Server-side Express API endpoint (`POST /api/invoices/scan-file`) leverages NVIDIA Nemotron Vision AI (`meta/llama-3.2-11b-vision-instruct`) with Tesseract.js neural OCR fallback for fast, accurate structured extraction.

### 🛡️ 2. AI Fraud & Duplicate Bill Interceptor
* **Automated Fraud Screening**: Flags duplicate invoice numbers, matching supplier billing totals, and unverified vendor entries before payouts are released.
* **Risk Severity & Alert System**: Automatically logs duplicate bill attempts and anomaly scores to the central `fraud_alerts` system.

### 💻 3. Point of Sale (POS) Billing Engine
* **Instant Customer Billing**: High-speed cashier checkout interface supporting SKU search, item quantity adjustments, and custom discount calculations.
* **Stock Deduction & Digital Receipts**: Direct real-time inventory deduction upon checkout with instant printable digital invoice generation for customers.

### 📦 4. Live Inventory Auto-Sync (Supabase PostgreSQL)
* **Automated Stock Increment**: Saving vendor invoices automatically updates inventory levels, updates vendor pricing, and adjusts retail MRPs in `public.inventory`.
* **Low-Stock Threshold Alerts**: Visual indicators and automated alerts whenever product quantities fall below minimum stock safety limits.

### 🤖 5. AI Financial Assistant & Smart Advisory
* **Interactive Financial Co-Pilot**: Integrated natural language Q&A co-pilot (`AiAssistantModule`) providing real-time store performance analytics, profit margin checks, expense trends, and financial guidance.

### 👥 6. Multi-Role & Employee RBAC System
* **Role-Based Access Control**: Tailored permission views for **Business Owner**, **Accountant**, **Cashier / Store Manager**, and **Stock Manager**.
* **Staff & Payroll Management**: Manage employee directories, roles, monthly salary records, and payout status.

### ⏱️ 7. Dedicated Audit Logs & Financial Analytics
* **System-Wide Audit Trail**: Tracks all user actions including stock adjustments, vendor uploads, bill creations, price updates, and employee payout changes.
* **Financial Reports**: Comprehensive breakdowns of income, expenditures, payment breakdown (UPI, Cash, Card), and category analytics.

### 🏛️ 8. Govt GST Compliance Verification
* **GST Rate Validation**: Cross-checks invoice line-item GST percentages against official Indian Govt GST tax slabs (0%, 5%, 12%, 18%, 28%).
* **PostgreSQL Master Table**: Dynamic insertion and querying via `public.official_gst_rates`.

### 📡 9. Webhook Pipeline Integration
* **Base64 Photo Dispatch**: Converts uploaded invoices to base64 Data URIs and POSTs to configured webhook nodes for external processing and notifications.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Lucide React Icons, React Router DOM v6, Vanilla CSS (Modern Dark/Glassmorphism Palette) |
| **Backend REST API** | Node.js, Express.js, Multer (File Uploads), CORS, dotenv |
| **AI & OCR Engines** | NVIDIA Nemotron Vision AI (`meta/llama-3.2-11b-vision-instruct`), Tesseract.js Neural Engine |
| **Database & Cloud** | Supabase PostgreSQL, `@supabase/supabase-js`, `pg` (PostgreSQL Client) |
| **Monorepo Automation**| Concurrently (`npm run start:all`) |
| **Integrations** | Webhook Node Endpoints, Web Storage Fallbacks |

---

## 📁 Repository Structure

```
FinGuard-AI/
├── backend/
│   ├── routes/
│   │   ├── ai.js                # AI Financial Assistant REST Routes
│   │   ├── auth.js              # User Login & Signup Authentication
│   │   ├── customer_bills.js    # Customer POS Billing & Sales Receipts
│   │   ├── dashboard.js         # Financial Dashboard Stats & Analytics
│   │   ├── employees.js         # Staff Management & Payroll
│   │   ├── expenses.js          # Expense Tracking & Categorization
│   │   ├── inventory.js         # Inventory Auto-Sync & Stock Management
│   │   ├── invoices.js          # OCR Scanner & Invoice Processing
│   │   ├── payments.js          # Payment Settlement API
│   │   ├── reports.js           # Comprehensive Business Analytics
│   │   ├── settings.js          # Store Settings & GST Slab Configurations
│   │   ├── transactions.js      # Financial Ledger Transactions
│   │   └── vendors.js           # Vendor Profiles & Supplier Management
│   ├── middleware/              # Authentication & Role Authorization Middleware
│   ├── db.js                    # Dual Supabase & PostgreSQL Adapter
│   ├── index.js                 # Express REST Server Entry Point
│   ├── schema.sql               # PostgreSQL Relational DDL Schema
│   ├── supabase_schema.sql      # Complete Supabase PostgreSQL DDL Script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI Components (Navbar, Hero, Modals)
│   │   │   └── dashboard/       # Specialized Dashboard Modules (POS, AI Assistant, Inventory)
│   │   ├── pages/               # Application Views (Dashboard, Upload Invoice, POS, Auth)
│   │   ├── services/            # REST API Clients & Supabase Integration
│   │   ├── styles/              # Design Token Utility Classes & Stylesheets
│   │   ├── App.jsx              # React Router Navigation & App Shell
│   │   └── main.jsx             # React DOM Mounting Point
│   ├── index.html               # Main HTML Document & Font Imports
│   └── package.json
│
├── docs/                        # Project Documentation & Architecture Guides
├── hld/                         # High Level Design Documents & Presentations
├── package.json                 # Monorepo Orchestration Scripts (`start:all`)
└── README.md                    # Project Documentation
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Supabase Project**: (Optional for full backend persistence)

### 2. Single-Command Monorepo Startup (Recommended)
You can launch both the **Express Backend Server** and **Vite Frontend Client** simultaneously from the project root:

```bash
# Clone the repository
git clone https://github.com/yukesh4349/FinGuard-AI.git
cd FinGuard-AI

# Install root & workspace dependencies
npm install
npm --prefix backend install
npm --prefix frontend install

# Run Frontend & Backend concurrently
npm run start:all
```
* **Frontend UI**: Launches at `http://localhost:3000` (or `http://localhost:5173`)
* **Backend API**: Launches at `http://localhost:5000`

---

### 3. Manual Step-by-Step Setup

#### Backend REST API Startup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Client Startup
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables Setup

### Frontend `.env` (`frontend/.env`)
Create a `.env` file in the `frontend` root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WEBHOOK_URL=https://api.agents.snsihub.ai/webhook/2c8af1a7-9f33-4249-b787-a9e239761ca1
VITE_STOCK_WEBHOOK_URL=https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea
```

### Backend `.env` (`backend/.env`)
Create a `.env` file in the `backend` root directory:

```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NVIDIA_AI_KEY=your_nvidia_ai_api_key
```

---

## 🗄️ Database Schema Setup (Supabase PostgreSQL)

Execute the complete SQL setup script located in [backend/supabase_schema.sql](backend/supabase_schema.sql) in your Supabase SQL Editor:

```sql
-- Inventory Master Table
CREATE TABLE public.inventory (
    id                   VARCHAR(100) PRIMARY KEY,
    user_id              VARCHAR(100) NOT NULL,
    name                 VARCHAR(255) NOT NULL,
    category             VARCHAR(100) DEFAULT 'General Store',
    stock_qty            INT          DEFAULT 0,
    min_alert_threshold  INT          DEFAULT 15,
    unit_price           VARCHAR(50)  DEFAULT '₹ 0',
    cost_price           VARCHAR(50)  DEFAULT '₹ 0',
    selling_price        VARCHAR(50)  DEFAULT '₹ 0',
    gst_rate             VARCHAR(20)  DEFAULT '5%',
    status               VARCHAR(50)  DEFAULT 'Healthy Stock',
    supplier_name        VARCHAR(255),
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OCR Invoices Table
CREATE TABLE public.invoices (
    id                  VARCHAR(100) PRIMARY KEY,
    user_id             VARCHAR(100) NOT NULL,
    supplier_name       VARCHAR(255) NOT NULL,
    invoice_number      VARCHAR(100) NOT NULL,
    date                VARCHAR(50),
    amount              VARCHAR(50)  NOT NULL,
    tax_amount          VARCHAR(50)  DEFAULT '₹ 0',
    status              VARCHAR(50)  DEFAULT 'Pending Verification',
    items               JSONB        DEFAULT '[]'::jsonb,
    is_duplicate        BOOLEAN      DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Audit Logs
CREATE TABLE public.activity_logs (
    id          VARCHAR(100) PRIMARY KEY,
    user_id     VARCHAR(100) NOT NULL,
    user_role   VARCHAR(50)  DEFAULT 'owner',
    action      VARCHAR(255) NOT NULL,
    details     TEXT,
    category    VARCHAR(100) DEFAULT 'General',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Finora AI — Smart Finance, Smarter Business**  
*Built with ❤️ for modern retail stores & small businesses.*

</div>
