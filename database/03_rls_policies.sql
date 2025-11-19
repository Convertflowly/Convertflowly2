-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================
-- This file sets up all security policies for the tables

-- =============================================
-- SUBSCRIPTION PRODUCTS POLICIES
-- =============================================

-- Allow public read access to active products
CREATE POLICY "Public can view active products"
  ON subscription_products FOR SELECT
  USING (active = true);

-- Admin can manage all products (requires service role key)
CREATE POLICY "Service role can manage products"
  ON subscription_products FOR ALL
  USING (true);

-- =============================================
-- USER SUBSCRIPTIONS POLICIES
-- =============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users cannot modify subscriptions directly (handled by Stripe webhooks)
-- Only service role can insert/update/delete subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (true);

-- =============================================
-- ORDERS POLICIES
-- =============================================

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update orders
CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (true);

-- =============================================
-- STRIPE SETTINGS POLICIES
-- =============================================

-- Only service role can access stripe settings
CREATE POLICY "Service role can manage stripe settings"
  ON stripe_settings FOR ALL
  USING (true);

-- =============================================
-- API SETTINGS POLICIES
-- =============================================

-- Only service role can access API settings
CREATE POLICY "Service role can manage api settings"
  ON api_settings FOR ALL
  USING (true);

-- =============================================
-- ADMIN USERS POLICIES
-- =============================================

-- Only service role can manage admin users
CREATE POLICY "Service role can manage admin users"
  ON admin_users FOR ALL
  USING (true);

-- =============================================
-- HELPER FUNCTIONS
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

COMMENT ON FUNCTION has_active_subscription IS 'Check if user has an active subscription';
COMMENT ON FUNCTION get_user_subscription_tier IS 'Get user subscription product name or "free"';
COMMENT ON FUNCTION cancel_subscription_at_period_end IS 'Mark subscription for cancellation at period end';
