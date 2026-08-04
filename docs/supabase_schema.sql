-- Supabase Database Schema for FinGuard AI
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/npvceqmyxddcfegpwauf/sql/new

CREATE TABLE IF NOT EXISTS public.ocr_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_date TEXT,
    subtotal TEXT,
    tax_gst TEXT,
    grand_total TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    raw_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.ocr_invoices ENABLE ROW LEVEL SECURITY;

-- Drop Policies if they already exist to avoid Error 42710
DROP POLICY IF EXISTS "Allow public insert to ocr_invoices" ON public.ocr_invoices;
DROP POLICY IF EXISTS "Allow public select from ocr_invoices" ON public.ocr_invoices;

-- Re-create Policies for Public Insert and Select
CREATE POLICY "Allow public insert to ocr_invoices" ON public.ocr_invoices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select from ocr_invoices" ON public.ocr_invoices
    FOR SELECT USING (true);
