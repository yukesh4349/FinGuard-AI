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
-- 10. OFFICIAL GOVT GST RATES MASTER TABLE
CREATE TABLE IF NOT EXISTS public.official_gst_rates (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    example TEXT,
    rate NUMERIC NOT NULL,
    display VARCHAR(50) NOT NULL
);

ALTER TABLE public.official_gst_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_official_gst_rates_policy ON public.official_gst_rates FOR ALL USING (true) WITH CHECK (true);

-- SEED OFFICIAL GOVT GST RATES MASTER DATA (200 PRODUCTS ACROSS GROCERY, TEXTILES, HARDWARE & PHARMACY)
INSERT INTO public.official_gst_rates (category, example, rate, display) VALUES
('Rice (unbranded)', 'Unbranded raw/steamed rice', 0, '0% (Exempted)'),
('Branded Rice', 'Packaged branded basmati/rice', 5, '5% GST'),
('Wheat', 'Whole wheat grains', 0, '0% (Exempted)'),
('Wheat Flour (Atta)', 'Packaged wheat flour / Atta', 5, '5% GST'),
('Maida', 'Refined wheat flour', 5, '5% GST'),
('Rava (Sooji)', 'Semolina / Sooji / Rava', 5, '5% GST'),
('Besan', 'Gram flour', 5, '5% GST'),
('Toor Dal', 'Unbranded pulses / Toor dal', 0, '0% (Exempted)'),
('Urad Dal', 'Unbranded Urad dal', 0, '0% (Exempted)'),
('Moong Dal', 'Unbranded Moong dal', 0, '0% (Exempted)'),
('Chana Dal', 'Unbranded Chana dal', 0, '0% (Exempted)'),
('Masoor Dal', 'Unbranded Masoor dal', 0, '0% (Exempted)'),
('Sugar', 'Refined white/brown sugar', 5, '5% GST'),
('Jaggery', 'Natural jaggery / Gur', 5, '5% GST'),
('Salt', 'Common iodized salt', 0, '0% (Exempted)'),
('Tea Powder', 'Packaged tea leaves / dust', 5, '5% GST'),
('Coffee Powder', 'Coffee beans & instant powder', 5, '5% GST'),
('Milk', 'Fresh liquid milk', 0, '0% (Exempted)'),
('Curd', 'Fresh plain curd / Dahi', 0, '0% (Exempted)'),
('Butter', 'Dairy butter / Salted butter', 12, '12% GST'),
('Cheese', 'Processed cheese / Processed slices', 12, '12% GST'),
('Paneer', 'Fresh cottage cheese / Paneer', 5, '5% GST'),
('Ghee', 'Pure cow/buffalo ghee', 12, '12% GST'),
('Cooking Oil', 'Edible cooking oil', 5, '5% GST'),
('Mustard Oil', 'Kachi ghani mustard oil', 5, '5% GST'),
('Sunflower Oil', 'Refined sunflower oil', 5, '5% GST'),
('Coconut Oil (edible)', 'Pure edible coconut oil', 5, '5% GST'),
('Pickle', 'Bottled mango/lemon pickles', 12, '12% GST'),
('Jam', 'Fruit jams & preserves', 12, '12% GST'),
('Honey', 'Natural processed honey', 5, '5% GST'),
('Biscuit', 'Sweet & salted biscuits', 18, '18% GST'),
('Chocolate', 'Milk & dark chocolates', 18, '18% GST'),
('Soft Drinks', 'Carbonated aerated beverages', 28, '28% GST'),
('Mineral Water', 'Packaged drinking water', 18, '18% GST'),
('Fruit Juice', 'Packaged fruit drinks & juice', 12, '12% GST'),
('Noodles', 'Instant noodles & ramen', 18, '18% GST'),
('Pasta', 'Dry durum wheat pasta', 18, '18% GST'),
('Corn Flakes', 'Breakfast corn cereals', 18, '18% GST'),
('Oats', 'Rolled & instant breakfast oats', 5, '5% GST'),
('Spices', 'Whole spices (Cumin, Mustard)', 5, '5% GST'),
('Turmeric Powder', 'Ground turmeric / Haldi', 5, '5% GST'),
('Chilli Powder', 'Ground red chilli powder', 5, '5% GST'),
('Coriander Powder', 'Ground coriander / Dhaniya', 5, '5% GST'),
('Dry Fruits', 'Cashews, Almonds, Raisins', 12, '12% GST'),
('Ice Cream', 'Dairy ice creams & frozen desserts', 18, '18% GST'),
('Bakery Cake', 'Fresh cakes & pastries', 18, '18% GST'),
('Bread', 'Fresh sliced loaf bread', 0, '0% (Exempted)'),
('Eggs', 'Fresh poultry farm eggs', 0, '0% (Exempted)'),
('Fresh Vegetables', 'Fresh market vegetables', 0, '0% (Exempted)'),
('Fresh Fruits', 'Fresh seasonal fruits', 0, '0% (Exempted)'),
('Cotton Shirt', 'Men/Women cotton shirts', 5, '5% GST'),
('T-Shirt', 'Casual polo & round neck t-shirts', 5, '5% GST'),
('Jeans', 'Denim jeans pants', 12, '12% GST'),
('Trousers', 'Formal & casual trousers', 12, '12% GST'),
('Shorts', 'Cotton shorts & Bermudas', 5, '5% GST'),
('Skirt', 'Women skirts', 5, '5% GST'),
('Kurti', 'Ethnic kurtis & tops', 5, '5% GST'),
('Saree', 'Traditional sarees', 5, '5% GST'),
('Silk Saree', 'Pure silk sarees', 5, '5% GST'),
('Cotton Saree', 'Handloom cotton sarees', 5, '5% GST'),
('Salwar Suit', 'Readymade salwar suit set', 5, '5% GST'),
('Leggings', 'Cotton elastic leggings', 5, '5% GST'),
('Dupatta', 'Cotton & silk dupattas', 5, '5% GST'),
('Shawl', 'Woolen & pashmina shawls', 5, '5% GST'),
('Sweater', 'Knitted winter sweaters', 12, '12% GST'),
('Jacket', 'Winter & casual jackets', 12, '12% GST'),
('Coat', 'Overcoats & formal coats', 12, '12% GST'),
('Blazer', 'Formal suiting blazers', 12, '12% GST'),
('School Uniform', 'School dresses & shirts', 5, '5% GST'),
('Socks', 'Cotton socks', 5, '5% GST'),
('Gloves', 'Winter gloves', 5, '5% GST'),
('Cap', 'Sports & casual caps', 5, '5% GST'),
('Hat', 'Sun hats & felt hats', 5, '5% GST'),
('Handkerchief', 'Cotton handkerchiefs', 5, '5% GST'),
('Bedsheet', 'Cotton double bedsheet', 12, '12% GST'),
('Pillow Cover', 'Pillow cases & covers', 12, '12% GST'),
('Curtain', 'Door & window curtains', 12, '12% GST'),
('Blanket', 'Fleece & mink blankets', 12, '12% GST'),
('Quilt', 'Cotton quilts & comforters', 12, '12% GST'),
('Mattress Cover', 'Protective mattress covers', 12, '12% GST'),
('Towel', 'Bath & hand cotton towels', 12, '12% GST'),
('Bath Robe', 'Terry towel bathrobe', 12, '12% GST'),
('Track Pant', 'Sports track pants', 12, '12% GST'),
('Sports Jersey', 'Team jerseys & athletic tops', 12, '12% GST'),
('Sports Shorts', 'Athletic shorts', 12, '12% GST'),
('Baby Dress', 'Infant clothing & dresses', 5, '5% GST'),
('Baby Blanket', 'Soft baby wrappers & blankets', 12, '12% GST'),
('Raincoat', 'Waterproof rain jackets & suits', 18, '18% GST'),
('Leather Jacket', 'Genuine leather jackets', 18, '18% GST'),
('Belt', 'Leather & synthetic waist belts', 18, '18% GST'),
('Wallet', 'Leather pocket wallets', 18, '18% GST'),
('Tie', 'Formal neckties', 12, '12% GST'),
('Scarf', 'Fashion scarves', 5, '5% GST'),
('Innerwear', 'Men/Women innerwear garments', 5, '5% GST'),
('Bra', 'Lingerie & brassieres', 5, '5% GST'),
('Night Dress', 'Night suits & nightwear', 5, '5% GST'),
('Pajama', 'Cotton pajamas', 5, '5% GST'),
('Hoodie', 'Fleece hoodies & sweatshirts', 12, '12% GST'),
('Denim Jacket', 'Denim outerwear jackets', 12, '12% GST'),
('Fabric Roll', 'Textile fabric rolls & unstitched material', 5, '5% GST'),
('Hammer', 'Claw & ball peen hammers', 18, '18% GST'),
('Screwdriver', 'Manual & insulated screwdrivers', 18, '18% GST'),
('Spanner', 'Ring & open spanner sets', 18, '18% GST'),
('Drill Machine', 'Electric impact drills', 18, '18% GST'),
('Electric Saw', 'Circular & jig saws', 18, '18% GST'),
('Nails', 'Steel & iron construction nails', 18, '18% GST'),
('Screws', 'Wood & drywall screws', 18, '18% GST'),
('Bolts', 'Hexagonal steel bolts', 18, '18% GST'),
('Nuts', 'Steel nuts & fasteners', 18, '18% GST'),
('Washers', 'Flat & spring washers', 18, '18% GST'),
('PVC Pipe', 'Plumbing PVC pipes', 18, '18% GST'),
('GI Pipe', 'Galvanized iron pipes', 18, '18% GST'),
('Water Tap', 'Brass & chrome water taps', 18, '18% GST'),
('Valve', 'Gate & ball valves', 18, '18% GST'),
('Door Lock', 'Mortise & padlocks', 18, '18% GST'),
('Door Handle', 'Stainless steel door handles', 18, '18% GST'),
('Hinges', 'Cabinet & door hinges', 18, '18% GST'),
('Paint', 'Emulsion & enamel paints', 18, '18% GST'),
('Paint Brush', 'Wall painting brushes', 18, '18% GST'),
('Roller Brush', 'Paint roller brushes', 18, '18% GST'),
('Cement', 'OPC & PPC cement bags', 28, '28% GST'),
('White Cement', 'White cement & wall putty', 28, '28% GST'),
('Tiles', 'Vitrified & ceramic floor tiles', 28, '28% GST'),
('Granite Slab', 'Polished granite slabs', 28, '28% GST'),
('Marble', 'Natural marble stone', 28, '28% GST'),
('PVC Wire', 'Insulated copper electric wires', 18, '18% GST'),
('Electrical Switch', 'Modular electrical switches', 18, '18% GST'),
('Socket', '5-pin & 15-pin power sockets', 18, '18% GST'),
('LED Bulb', 'Energy-saving LED bulbs', 12, '12% GST'),
('Tube Light', 'LED battens & tube lights', 12, '12% GST'),
('Ceiling Fan', 'High-speed ceiling fans', 18, '18% GST'),
('Exhaust Fan', 'Kitchen & bathroom exhaust fans', 18, '18% GST'),
('Water Pump', 'Monoblock water pumps', 18, '18% GST'),
('Electric Motor', 'Single & 3-phase electric motors', 18, '18% GST'),
('Welding Rod', 'Arc welding electrodes', 18, '18% GST'),
('Grinder Machine', 'Handheld angle grinders', 18, '18% GST'),
('Measuring Tape', 'Steel measuring tapes', 18, '18% GST'),
('Spirit Level', 'Aluminum spirit levels', 18, '18% GST'),
('Ladder', 'Aluminum folding ladders', 18, '18% GST'),
('Chain', 'Steel link chains', 18, '18% GST'),
('Rope', 'Nylon & PP ropes', 12, '12% GST'),
('PVC Adhesive', 'Pipe jointing solvent cement', 18, '18% GST'),
('Silicone Sealant', 'Waterproof silicone sealants', 18, '18% GST'),
('Safety Helmet', 'Construction safety helmets', 18, '18% GST'),
('Safety Gloves', 'Industrial safety hand gloves', 18, '18% GST'),
('PVC Tank', 'Water storage tanks', 18, '18% GST'),
('Water Filter Housing', 'RO & UV water filter housings', 18, '18% GST'),
('Pliers', 'Combination & nose pliers', 18, '18% GST'),
('Chisel', 'Wood & masonry chisels', 18, '18% GST'),
('Angle Grinder', 'Power angle grinding machines', 18, '18% GST'),
('Paracetamol', 'Fever & pain relief tablets', 12, '12% GST'),
('Ibuprofen', 'Anti-inflammatory tablets', 12, '12% GST'),
('Amoxicillin', 'Antibiotic capsules', 12, '12% GST'),
('Azithromycin', 'Antibiotic tablets', 12, '12% GST'),
('Cetirizine', 'Anti-allergy tablets', 12, '12% GST'),
('ORS Packet', 'Oral rehydration salts', 5, '5% GST'),
('Vitamin Tablets', 'Vitamin B-Complex & C tablets', 12, '12% GST'),
('Calcium Tablets', 'Calcium + D3 supplements', 12, '12% GST'),
('Iron Tablets', 'Folic acid & iron tablets', 12, '12% GST'),
('Multivitamin Syrup', 'Health multivitamin syrups', 12, '12% GST'),
('Cough Syrup', 'Expectorant cough syrups', 12, '12% GST'),
('Antacid', 'Acidity relief liquids & tablets', 12, '12% GST'),
('Insulin', 'Diabetic insulin injections', 5, '5% GST'),
('Glucose Powder', 'Instant energy glucose drink', 5, '5% GST'),
('Baby Formula', 'Infant milk powder formula', 5, '5% GST'),
('Adult Diaper', 'Incontinence adult diapers', 12, '12% GST'),
('Surgical Gloves', 'Sterile latex examination gloves', 12, '12% GST'),
('Face Mask', '3-Ply & N95 protective masks', 5, '5% GST'),
('Hand Sanitizer', 'Alcohol-based hand rubs', 18, '18% GST'),
('Cotton Roll', 'Absorbent medical cotton', 5, '5% GST'),
('Bandage', 'Sterile gauze bandages', 12, '12% GST'),
('Crepe Bandage', 'Elastic crepe support bandages', 12, '12% GST'),
('Surgical Tape', 'Medical adhesive tape', 12, '12% GST'),
('Thermometer', 'Digital & mercury thermometers', 12, '12% GST'),
('BP Monitor', 'Digital blood pressure monitors', 12, '12% GST'),
('Glucometer', 'Blood glucose testing meters', 12, '12% GST'),
('Glucose Test Strip', 'Blood sugar test strips', 12, '12% GST'),
('Nebulizer', 'Compressor nebulizer machines', 12, '12% GST'),
('Wheelchair', 'Folding patient wheelchairs', 5, '5% GST'),
('Walking Stick', 'Orthopedic walking sticks', 5, '5% GST'),
('Hearing Aid', 'Digital acoustic hearing aids', 5, '5% GST'),
('Adult Syringe', 'Hypodermic medical needles', 12, '12% GST'),
('Disposable Syringe', 'Single-use plastic syringes', 12, '12% GST'),
('IV Set', 'Intravenous infusion drip sets', 12, '12% GST'),
('Saline Bottle', 'Normal saline & Dextrose IV fluid', 5, '5% GST'),
('Antiseptic Solution', 'Chlorhexidine & Dettol liquid', 12, '12% GST'),
('Antifungal Cream', 'Skin fungal infection creams', 12, '12% GST'),
('Antibiotic Ointment', 'Topical wound healing creams', 12, '12% GST'),
('Eye Drops', 'Antibiotic & lubricating eye drops', 12, '12% GST'),
('Ear Drops', 'Wax removal & ear pain drops', 12, '12% GST'),
('Nasal Spray', 'Decongestant nasal sprays', 12, '12% GST'),
('Pregnancy Test Kit', 'HCG home test cassettes', 12, '12% GST'),
('Surgical Blade', 'Scalpel blades for surgery', 12, '12% GST'),
('Disposable Razor (medical)', 'Surgical skin prep razors', 18, '18% GST'),
('Alcohol Swab', 'Pre-injection antiseptic wipes', 12, '12% GST'),
('Medical PPE Kit', 'Full body protection suit sets', 12, '12% GST'),
('Stethoscope', 'Medical diagnostic stethoscopes', 12, '12% GST'),
('Pulse Oximeter', 'Fingertip blood oxygen monitors', 12, '12% GST'),
('Digital Weighing Scale', 'Medical body weight scales', 18, '18% GST'),
('First Aid Kit', 'Emergency medical response box', 12, '12% GST');


