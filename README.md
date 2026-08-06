# 🚀 Finora — Smart Finance, Smarter Business

<div align="center">

![Finora Banner](https://img.shields.io/badge/Finora-Smart%20Finance%2C%20Smarter%20Business-B4781C?style=for-the-badge&logo=react)

**The All-In-One AI Shop Money Management & Neural OCR Fraud Interceptor Platform**

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express.js%20REST%20API-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![OCR Engine](https://img.shields.io/badge/OCR-Tesseract.js%20Neural%20Engine-FF6F00?style=flat-square&logo=google)](https://tesseract.projectnaptha.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**Finora** is a state-of-the-art financial management and bill verification platform designed for retail store owners, wholesale traders, accountants, and stock managers. By combining **server-side Neural OCR**, **automated duplicate bill detection**, **real-time GST compliance verification**, and **Supabase PostgreSQL database synchronization**, Finora safeguards business profitability 24/7.

---

## ✨ Key Features

### ⚡ 1. Neural OCR & Invoice Photo Scanner
* **Instant Document Breakdown**: Upload vendor bills, receipts, or photos (`PNG`, `JPG`, `PDF`) to extract vendor details, invoice dates, bill numbers, line item descriptions, quantities, unit cost rates, retail MRPs, GST %, and grand totals.
* **Multipart Server-Side Scanning**: Express REST API endpoint (`POST /api/invoices/scan-file`) processes bill images with high-precision Tesseract OCR layout analysis.

### 🛡️ 2. AI Fraud & Duplicate Bill Interceptor
* **Instant Fraud Screening**: Detects duplicate invoice numbers, matching supplier billing totals, and unverified vendor entries before payments are issued.
* **Risk Severity Alerts**: Flags duplicate bills with high-risk alerts logged to the `fraud_alerts` system.

### 📦 3. Live Inventory Auto-Sync (Supabase PostgreSQL)
* **Automated Stock Increment**: Saving vendor bills automatically updates store inventory quantities and updates retail selling MRPs in the Supabase `public.inventory` table.
* **Low-Stock Alerting**: Highlights SKUs falling below minimum alert thresholds.

### ⏱️ 4. Dedicated System Audit Logs
* **Comprehensive Audit Trail**: Dedicated sidebar page tracking all system actions including stock additions, quantity deductions, vendor bill uploads, price changes, and payment entries.
* **Categorized Records**: Filter logs by timestamp, user role, action category, and details.

### 🏛️ 5. Govt GST Compliance & Tax Rates Master
* **Official GST Rates Verification**: Cross-check line item GST percentages against official Govt GST slabs (0%, 5%, 12%, 18%, 28%).
* **PostgreSQL Master Table**: Dynamic insertion and querying of official GST categories (`public.official_gst_rates`).

### 📡 6. Automated Webhook Data Pipeline
* **Base64 Image Payload Dispatch**: Automatically converts uploaded bill photos to base64 Data URIs and POSTs them to configured webhook node endpoints upon upload.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Lucide Icons, Vanilla CSS (Modern Dark/Glassmorphic Palette) |
| **Backend REST API** | Node.js, Express.js, Multer |
| **OCR Processing** | Tesseract.js Neural Engine |
| **Database & Cloud** | Supabase PostgreSQL, `@supabase/supabase-js`, `pg` |
| **Integrations** | Webhook Node Endpoints, Local Storage Fallbacks |

---

## 📁 Repository Structure

```
FinGuard-AI/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # User Login/Signup API
│   │   ├── invoices.js      # Invoice & Neural OCR API Routes
│   │   └── dashboard.js     # Analytics & System Stats
│   ├── db.js                # Core Database Adapter
│   ├── index.js             # Express Server Initialization
│   ├── supabase_schema.sql  # Supabase PostgreSQL Table Schemas
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Components (Navbar, Footer, Hero, Modals)
│   │   ├── pages/           # Application Pages (Dashboard, Upload Invoice, POS)
│   │   ├── services/        # Supabase, Postgres & Express REST API Clients
│   │   └── styles/          # Dark Mode & Modern CSS Token System
│   ├── index.html           # Main HTML Template & Meta Tags
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 2. Backend Installation & Server Startup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start Express REST API server (Runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Installation & Client Startup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Vite Development Server (Runs on http://localhost:3000)
npm run dev
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `frontend` root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WEBHOOK_URL=https://api.agents.snsihub.ai/webhook/2c8af1a7-9f33-4249-b787-a9e239761ca1
VITE_STOCK_WEBHOOK_URL=https://api.agents.snsihub.ai/webhook/e812ce73-c455-4de1-bdb0-dc7b51f0a4ea
```

---

## 🗄️ Database Schema Setup (PostgreSQL / Supabase)

To initialize your database tables in Supabase SQL Editor, execute the SQL schema script provided in [`backend/supabase_schema.sql`](file:///d:/SNS%20-%20cohart%20pp/FinGuard%20AI/backend/supabase_schema.sql):

```sql
-- Inventory Master Table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General Store',
  stock_qty INT DEFAULT 0,
  min_alert_threshold INT DEFAULT 15,
  unit_price NUMERIC DEFAULT 100,
  selling_price NUMERIC DEFAULT 120,
  status TEXT DEFAULT 'Healthy Stock',
  supplier TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- OCR Invoices Table
CREATE TABLE IF NOT EXISTS public.ocr_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  supplier_name TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  subtotal NUMERIC,
  tax_gst NUMERIC,
  grand_total NUMERIC,
  payment_status TEXT DEFAULT 'Paid',
  due_date DATE,
  items JSONB,
  raw_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Finora — Smart Finance, Smarter Business**  
*Built with ❤️ for modern retail stores & small businesses.*

</div>
