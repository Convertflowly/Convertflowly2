-- =============================================
-- COMPLETE DATABASE SETUP - RUN THIS ONE FILE
-- =============================================
-- This file combines all SQL scripts into one
-- Copy and paste this entire file into Supabase SQL Editor and run it
-- Project: vxtwgdiolgnbwabulasv
-- =============================================

-- =============================================
-- PART 1: AUTHENTICATION & USER PROFILES
-- =============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
CREATE POLICY "Users can delete their own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- PART 2: SUBSCRIPTION & PAYMENT TABLES
-- =============================================

-- Subscription products table (your pricing plans)
CREATE TABLE IF NOT EXISTS subscription_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_period VARCHAR(50) DEFAULT 'monthly',
  features JSONB,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES subscription_products(id) ON DELETE RESTRICT,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders/Payment history table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES subscription_products(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stripe settings table
CREATE TABLE IF NOT EXISTS stripe_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publishable_key VARCHAR(255),
  secret_key VARCHAR(255),
  webhook_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API settings table
CREATE TABLE IF NOT EXISTS api_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(100) NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_products_active ON subscription_products(active);
CREATE INDEX IF NOT EXISTS idx_subscription_products_stripe_product_id ON subscription_products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable Row Level Security
ALTER TABLE subscription_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 3: ROW LEVEL SECURITY POLICIES
-- =============================================

-- Subscription Products Policies
DROP POLICY IF EXISTS "Public can view active products" ON subscription_products;
CREATE POLICY "Public can view active products"
  ON subscription_products FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Service role can manage products" ON subscription_products;
CREATE POLICY "Service role can manage products"
  ON subscription_products FOR ALL
  USING (true);

-- User Subscriptions Policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (true);

-- Orders Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (true);

-- Stripe Settings Policies
DROP POLICY IF EXISTS "Public can view stripe publishable key" ON stripe_settings;
CREATE POLICY "Public can view stripe publishable key"
  ON stripe_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage stripe settings" ON stripe_settings;
CREATE POLICY "Service role can manage stripe settings"
  ON stripe_settings FOR ALL
  USING (true);

-- API Settings Policies
DROP POLICY IF EXISTS "Service role can manage api settings" ON api_settings;
CREATE POLICY "Service role can manage api settings"
  ON api_settings FOR ALL
  USING (true);

-- Admin Users Policies
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;
CREATE POLICY "Service role can manage admin users"
  ON admin_users FOR ALL
  USING (true);

-- =============================================
-- PART 4: HELPER FUNCTIONS
-- =============================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_subscription BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > NOW())
  ) INTO v_has_subscription;
  
  RETURN v_has_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_product_name TEXT;
BEGIN
  SELECT sp.name INTO v_product_name
  FROM user_subscriptions us
  JOIN subscription_products sp ON us.product_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_product_name, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel subscription at period end
CREATE OR REPLACE FUNCTION public.cancel_subscription_at_period_end(p_user_id UUID, p_subscription_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_subscriptions
  SET cancel_at_period_end = true,
      updated_at = NOW()
  WHERE id = p_subscription_id
    AND user_id = p_user_id
    AND status = 'active';
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 5: SAMPLE DATA (Optional)
-- =============================================

-- Insert sample subscription products
INSERT INTO subscription_products (name, description, price, billing_period, features, active) 
VALUES
(
  'Free',
  'Basic features to get started',
  0.00,
  'monthly',
  '["Basic features", "Limited access", "Community support"]'::jsonb,
  true
),
(
  'Pro Monthly',
  'Full access to all premium features',
  4.99,
  'monthly',
  '["Unlimited access", "Premium templates", "AI-powered optimization", "Priority support", "Export in multiple formats"]'::jsonb,
  true
),
(
  'Pro Yearly',
  'Full access with annual billing (save 17%)',
  49.99,
  'yearly',
  '["Unlimited access", "Premium templates", "AI-powered optimization", "Priority support", "Export in multiple formats", "17% discount"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- You should now see these tables in your Supabase project:
-- ✅ user_profiles
-- ✅ subscription_products
-- ✅ user_subscriptions
-- ✅ orders
-- ✅ stripe_settings
-- ✅ api_settings
-- ✅ admin_users
--
-- Next steps:
-- 1. Verify tables in Table Editor
-- 2. Test signup at http://localhost:5173/signup
-- 3. Check user_profiles table for your new user
-- =============================================
