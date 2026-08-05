# FinSight AI — Decoupled Node.js Express REST API & Supabase Backend

## Overview
This folder contains the decoupled backend REST API server for **FinSight AI**.

- **Tech Stack**: Node.js, Express.js, Supabase Cloud PostgreSQL DB (`@supabase/supabase-js`, `pg`), CORS.
- **Port**: `5000` (http://localhost:5000)

## API Endpoints Available
- `GET /api/health` — Health check & status
- `POST /api/auth/login` — User authentication & credential verification
- `GET /api/dashboard/stats` — Live financial metrics (Sales, Expenses, Profit, Pending Bills)
- `GET /api/invoices` — List saved supplier invoices
- `POST /api/invoices` — Upload & save OCR extracted vendor bill
- `GET /api/inventory` — Store stock & inventory list
- `POST /api/inventory` — Add or update stock items
- `GET /api/vendors` — Active supplier & vendor profiles
- `GET /api/employees` — Store staff & attendance ledger
- `POST /api/ai/query` — AI Assistant query engine

## How to Run Backend Independently
```bash
cd backend
npm install
npm start
```
