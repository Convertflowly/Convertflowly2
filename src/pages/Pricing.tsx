import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../providers/AuthProvider';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  billing_period: string;
  features: any[];
  active: boolean;
  stripe_price_id?: string;
}

export function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState<string>('');

  useEffect(() => {
    loadProducts();
    loadStripeSettings();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_products')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error loading products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStripeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_settings')
        .select('publishable_key')
        .single();

      if (error) {
        console.error('Error loading Stripe settings:', error);
      } else if (data?.publishable_key) {
        setStripePublishableKey(data.publishable_key);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubscribe = async (product: Product) => {
    if (!user) {
      alert('Please log in to subscribe');
      navigate('/login');
      return;
    }

    // Check if product has Stripe integration
    if (!product.stripe_price_id) {
      alert('This product is not properly configured with Stripe. Please contact the administrator.');
      return;
    }

    // Check if Stripe is configured
    if (!stripePublishableKey) {
      alert('Payment system is not configured. Please contact support.');
      return;
    }

    setSubscribing(product.id);
    try {
      // Initialize Stripe
      const stripe = await loadStripe(stripePublishableKey);
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Call backend to create checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            priceId: product.stripe_price_id,
            userId: user.id,
            customerEmail: user.email,
            // Pass the base origin so the Edge Function crafts correct success/cancel URLs
            frontendUrl: window.location.origin,
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      console.log('Checkout session response:', data);

      if (data.sessionUrl) {
        console.log('Redirecting to Stripe checkout URL:', data.sessionUrl);
        window.location.href = data.sessionUrl;
      } else if (data.sessionId) {
        // Fallback to old method if URL not provided
        console.log('Redirecting to Stripe checkout with session:', data.sessionId);
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (result.error) {
          throw new Error(result.error.message);
        }
      } else {
        throw new Error('No session ID or URL returned from server');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout: ' + (error as any).message + '\n\nPlease make sure:\n1. Stripe keys are configured in admin panel\n2. Product has valid Stripe Price ID\n3. Edge Functions are deployed');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFB800] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-[0.12] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 0 0, rgba(255,184,0,0.18) 0, transparent 55%), radial-gradient(circle at 100% 0, rgba(132,76,255,0.25) 0, transparent 55%)`,
             backgroundSize: 'auto'
           }}>
      </div>
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#FFB800]/25 rounded-full blur-[160px] pointer-events-none opacity-60"></div>
      
      {/* Header */}
      <div className="relative border-b border-[#FFB800]/20 px-6 py-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-[#FFB800] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-gray-400 text-lg">
            Choose the perfect plan to unlock more features
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="relative bg-[#1E1246]/80 backdrop-blur-xl border border-[#FFB800]/20 rounded-xl p-8 hover:border-[#FFB800]/50 transition-all hover:shadow-lg hover:shadow-[#FFB800]/10"
              >
                {/* Product Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-400 text-sm">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${product.price}
                    </span>
                    <span className="text-gray-400">
                      /{product.billing_period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8 space-y-3">
                  {/* Always show 7-day free trial first */}
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">7-day free trial</span>
                  </div>
                  
                  {product.features && Array.isArray(product.features) && product.features.length > 0 ? (
                    product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          {typeof feature === 'string' ? feature : feature.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Unlimited access</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Premium features</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Priority support</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">All file formats</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Advanced tools</span>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(product)}
                  disabled={subscribing === product.id}
                  className="w-full py-3 px-4 bg-[#FFB800] hover:bg-[#FF9A1F] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {subscribing === product.id ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Go Pro Now'
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No plans available at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
