-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================
-- This file adds sample subscription plans
-- You can customize these to match your pricing

-- Insert sample subscription products
INSERT INTO subscription_products (name, description, price, billing_period, features, active) VALUES
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
);

-- Note: After creating products in Stripe dashboard,
-- update the stripe_product_id and stripe_price_id columns:
-- 
-- UPDATE subscription_products 
-- SET stripe_product_id = 'prod_xxxxx',
--     stripe_price_id = 'price_xxxxx'
-- WHERE name = 'Pro Monthly';

COMMENT ON TABLE subscription_products IS 'Run this after setting up Stripe products';
