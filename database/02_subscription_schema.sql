-- =============================================
-- SUBSCRIPTION & PAYMENT TABLES
-- =============================================
-- This file sets up all tables related to subscriptions,
-- payments, and Stripe integration

-- Subscription products table (your pricing plans)
CREATE TABLE subscription_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_period VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'yearly', 'lifetime'
  features JSONB, -- Store features as JSON array
  stripe_product_id VARCHAR(255), -- Stripe product ID
  stripe_price_id VARCHAR(255), -- Stripe price ID
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES subscription_products(id),
  stripe_subscription_id VARCHAR(255), -- Stripe subscription ID
  stripe_customer_id VARCHAR(255), -- Stripe customer ID
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'paused'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders/Payment history table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES subscription_products(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'pending', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stripe settings table (for admin configuration)
CREATE TABLE stripe_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publishable_key VARCHAR(255),
  secret_key VARCHAR(255),
  webhook_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API settings table (for OpenAI and other API keys)
CREATE TABLE api_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'openai', 'sendgrid', etc.
  key_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table (optional - for multiple admins)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_subscription_products_active ON subscription_products(active);
CREATE INDEX idx_subscription_products_stripe_product_id ON subscription_products(stripe_product_id);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);

-- Enable Row Level Security
ALTER TABLE subscription_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE subscription_products IS 'Available subscription plans and pricing';
COMMENT ON TABLE user_subscriptions IS 'User subscription data linked to Stripe';
COMMENT ON TABLE orders IS 'Payment transaction history';
COMMENT ON TABLE stripe_settings IS 'Stripe API configuration (admin only)';
COMMENT ON TABLE api_settings IS 'Third-party API keys configuration';
COMMENT ON TABLE admin_users IS 'Admin panel users (optional)';
