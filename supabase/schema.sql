-- =========================================================================
-- BLUEBONNET WHISK — DESI DABBA CATERING & KITCHEN DISPLAY SYSTEM (KDS)
-- Supabase Schema & Realtime Configuration
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Catering Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    is_delivery BOOLEAN DEFAULT FALSE,
    delivery_address TEXT,
    delivery_fee NUMERIC(10,2) DEFAULT 0.00,
    food_subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    fulfillment_date DATE NOT NULL,
    fulfillment_time TEXT NOT NULL,
    dietary_notes TEXT,
    order_type TEXT DEFAULT 'order' CHECK (order_type IN ('order', 'estimate')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('America/Chicago', now())
);

-- 3. Create Calendar Blackouts Table
CREATE TABLE IF NOT EXISTS public.calendar_blackouts (
    id SERIAL PRIMARY KEY,
    closed_date DATE NOT NULL UNIQUE,
    reason TEXT
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_date ON public.orders(fulfillment_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_blackouts_date ON public.calendar_blackouts(closed_date);

-- 5. Row Level Security (RLS) Setup
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_blackouts ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous/authenticated read & insert on orders
CREATE POLICY "Allow public insert on orders"
    ON public.orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow public select on orders"
    ON public.orders
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow update on orders status"
    ON public.orders
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Allow public read on calendar_blackouts
CREATE POLICY "Allow public select on calendar_blackouts"
    ON public.calendar_blackouts
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6. Enable Realtime Replication for Live Kitchen KDS Cards
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 7. Seed Sample Blackout Dates (e.g. Major Holidays)
INSERT INTO public.calendar_blackouts (closed_date, reason)
VALUES 
    ('2026-11-26', 'Thanksgiving Holiday Kitchen Close'),
    ('2026-12-25', 'Christmas Day Kitchen Maintenance'),
    ('2027-01-01', 'New Year Day Kitchen Reset')
ON CONFLICT (closed_date) DO NOTHING;
