import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../providers/AuthProvider';
import { Settings, CreditCard, LogOut, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import ImageConverter from '../tools/ImageConverter';
import ImageCompressor from '../tools/ImageCompressor';
import ImageMerger from '../tools/ImageMerger';
import ImageEditor from '../tools/ImageEditor';
import PDFConverter from '../tools/PDFConverter';
import PDFMerger from '../tools/PDFMerger';
import PDFSigner from '../tools/PDFSigner';
import SamplePDFGenerator from '../tools/SamplePDFGenerator';
import PlaceholderGenerator from '../tools/PlaceholderGenerator';
import FaviconMaker from '../tools/FaviconMaker';
import { tools, categories } from '../types/tools';

interface Subscription {
  id: string;
  status: string;
  product_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  subscription_products?: {
    name?: string;
    price?: number;
    billing_period?: string;
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [activating, setActivating] = useState<boolean>(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(null);

  const renderTool = (toolId: string) => {
    switch (toolId) {
      case 'jpg-to-png': return <ImageConverter fromFormat="jpeg" toFormat="png" />;
      case 'png-to-jpg': return <ImageConverter fromFormat="png" toFormat="jpeg" />;
      case 'jpg-to-webp': return <ImageConverter fromFormat="jpeg" toFormat="webp" />;
      case 'png-to-webp': return <ImageConverter fromFormat="png" toFormat="webp" />;
      case 'webp-to-jpg': return <ImageConverter fromFormat="webp" toFormat="jpeg" />;
      case 'webp-to-png': return <ImageConverter fromFormat="webp" toFormat="png" />;
      case 'jpg-to-avif': return <ImageConverter fromFormat="jpeg" toFormat="avif" />;
      case 'png-to-avif': return <ImageConverter fromFormat="png" toFormat="avif" />;
      case 'jpg-to-bmp': return <ImageConverter fromFormat="jpeg" toFormat="bmp" />;
      case 'png-to-bmp': return <ImageConverter fromFormat="png" toFormat="bmp" />;
      case 'webp-to-bmp': return <ImageConverter fromFormat="webp" toFormat="bmp" />;
      case 'compress-jpg': return <ImageCompressor format="jpeg" />;
      case 'compress-png': return <ImageCompressor format="png" />;
      case 'compress-webp': return <ImageCompressor format="webp" />;
      case 'merge-jpg': return <ImageMerger format="jpeg" />;
      case 'merge-png': return <ImageMerger format="png" />;
      case 'merge-webp': return <ImageMerger format="webp" />;
      case 'jpg-to-pdf': return <PDFConverter fromFormat="jpg" />;
      case 'png-to-pdf': return <PDFConverter fromFormat="png" />;
      case 'webp-to-pdf': return <PDFConverter fromFormat="webp" />;
      case 'txt-to-pdf': return <PDFConverter fromFormat="txt" />;
      case 'merge-pdf': return <PDFMerger />;
      case 'sign-pdf': return <PDFSigner />;
      case 'sample-pdf': return <SamplePDFGenerator />;
      case 'resize': return <ImageEditor mode="resize" />;
      case 'rotate': return <ImageEditor mode="rotate" />;
      case 'flip': return <ImageEditor mode="flip" />;
      case 'grayscale': return <ImageEditor mode="grayscale" />;
      case 'saturation': return <ImageEditor mode="saturation" />;
      case 'hue': return <ImageEditor mode="hue" />;
      case 'placeholder': return <PlaceholderGenerator />;
      case 'favicon': return <FaviconMaker />;
      default: return null;
    }
  };

  useEffect(() => {
    if (authLoading) return; // wait for auth to initialize
    if (!user) return; // ProtectedRoute will handle redirect

    // Check for payment success and create subscription
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('payment') === 'success' && sessionId) {
      console.log('✅ Payment completed! Creating subscription...');
      setActivating(true);
      verifyAndCreateSubscription(sessionId).finally(() => {
        setActivating(false);
      });
      // Remove query params
      window.history.replaceState({}, '', '/dashboard');
    } else {
      loadSubscription();
    }
  }, [user, authLoading, navigate]);

  const checkStripePayments = async () => {
    try {
      console.log('🔍 Checking Stripe for payments...');
      // Call sync function to check if user has any payments in Stripe
      const { data, error } = await supabase.functions.invoke('sync-stripe-subscriptions', {
        body: { userId: user?.id }
      });

      console.log('Stripe sync response:', { data, error });

      if (error) {
        console.error('❌ Could not sync Stripe payments:', error);
      } else if (data?.synced) {
        console.log('✅ Stripe payments synced:', data);
        return true; // Indicate sync happened
      } else {
        console.log('ℹ️ No Stripe payments found:', data?.message);
      }
    } catch (error) {
      console.error('❌ Stripe sync check failed:', error);
    }
    return false;
  };

  const verifyAndCreateSubscription = async (sessionId: string) => {
    setPageLoading(true);
    try {
      // Call Edge Function to verify payment and create subscription
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId, userId: user?.id }
      });

      if (error) {
        console.error('Error creating subscription:', error);
        alert('Payment successful but subscription setup failed. Please contact support.');
      } else {
        console.log('✅ Subscription created successfully!');
        // Reload subscription data
        await loadSubscription();
        setActivationMessage('Your subscription is now active!');
        setTimeout(() => setActivationMessage(null), 4000);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Payment successful but subscription setup failed. Please contact support.');
    } finally {
      setPageLoading(false);
    }
  };

  const loadSubscription = async () => {
    if (!user) return;

    try {
      // First, check Stripe for any payments we might have missed
      const synced = await checkStripePayments();
      
      // If we synced something, wait a moment for DB to update
      if (synced) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const { data, error: subErr } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_products(name, price, billing_period)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subErr) {
        console.warn('Subscription query warning:', subErr.message);
      }
      setSubscription(data || null);
      
      console.log('Subscription data:', data);

      // Check trial status
      if (!data) {
        // No active subscription, check trial period (14 days from signup)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('created_at')
          .eq('id', user.id)
          .single();

        console.log('User profile:', profile);

        if (profile) {
          const signupDate = new Date(profile.created_at);
          const now = new Date();
          const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // TRIAL FEATURE LAUNCH DATE: Only apply to users who signed up after this date
          const TRIAL_LAUNCH_DATE = new Date('2025-11-19'); // Set to deployment date
          const userSignupDate = new Date(profile.created_at);
          
          // Only show trial system for new users (signed up after launch date)
          if (userSignupDate >= TRIAL_LAUNCH_DATE) {
            const TRIAL_DAYS = 7; // Change to 0 for testing, 7 for production
            const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysSinceSignup);
            
            console.log('Days since signup:', daysSinceSignup);
            console.log('Trial days left:', trialDaysLeft);
            console.log('Trial expired:', trialDaysLeft === 0);
            
            setDaysLeft(trialDaysLeft);
            setTrialExpired(trialDaysLeft === 0);
          } else {
            // Existing users: keep full access, no trial restrictions
            console.log('Existing user (signed up before trial launch) - full access granted');
            setDaysLeft(999); // High number = no trial banner
            setTrialExpired(false); // Not expired = tools unlocked
          }
        }
      } else {
        console.log('User has active subscription - no trial banner');
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
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
      <header className="relative bg-slate-900/50 backdrop-blur-xl border-b border-[#FFB800]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFB800] hover:bg-[#FF9A1F] text-black rounded-lg transition-colors font-semibold"
              >
                <CreditCard className="w-5 h-5" />
                Upgrade
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-[#FFB800] transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors border border-white/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
        {/* Activation / Subscription banners */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          {activating && (
            <div className="mt-2 p-3 rounded-lg border border-[#FFB800]/30 bg-[#FFB800]/10 text-[#FFB800] text-sm">
              Activating your subscription… this usually takes a moment.
            </div>
          )}
          {activationMessage && (
            <div className="mt-2 p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm">
              {activationMessage}
            </div>
          )}
          {subscription && (
            <div className="mt-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm flex flex-wrap items-center gap-2">
              <span className="font-semibold">Premium Active</span>
              {subscription.subscription_products?.name && (
                <>
                  <span>•</span>
                  <span>{subscription.subscription_products?.name}</span>
                </>
              )}
              {typeof subscription.subscription_products?.price === 'number' && subscription.subscription_products?.billing_period && (
                <>
                  <span>•</span>
                  <span>${subscription.subscription_products?.price}/{subscription.subscription_products?.billing_period}</span>
                </>
              )}
              {subscription.current_period_end && (
                <>
                  <span>•</span>
                  <span>Renews on {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-400">
            {user?.email}
          </p>
        </div>

        {/* Trial Banner */}
        {!subscription && (
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-6 rounded-xl border-2 ${
                trialExpired
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-[#FFB800]/10 border-[#FFB800]/30'
              }`}
            >
            {trialExpired ? (
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  🔒 Free Trial Expired
                </h3>
                <p className="text-gray-300 mb-4">
                  Your 14-day free trial has ended. Upgrade now to continue using all tools!
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-6 py-3 bg-[#FFB800] hover:bg-[#FF9A1F] text-black font-semibold rounded-lg transition-all"
                >
                  Upgrade Now
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#FFB800] mb-2">
                  ✨ Free Trial Active
                </h3>
                <p className="text-gray-300 mb-2">
                  You have <span className="text-[#FFB800] font-bold">{daysLeft} days</span> left in your free trial
                </p>
                <p className="text-gray-400 text-sm">
                  Upgrade anytime to continue using all premium tools after your trial
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Tools Grid */}
        <div className="space-y-8 sm:space-y-12">
          {categories.map((category, categoryIndex) => {
            const categoryTools = tools.filter(tool => tool.category === category.id);
            if (categoryTools.length === 0) return null;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1, duration: 0.6 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-1">
                  <category.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFB800]" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{category.name}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {categoryTools.map((tool, toolIndex) => (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: trialExpired && !subscription ? 1 : 1.03, y: trialExpired && !subscription ? 0 : -8 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ delay: categoryIndex * 0.1 + toolIndex * 0.05, duration: 0.3 }}
                      onClick={() => {
                        if (trialExpired && !subscription) {
                          navigate('/pricing');
                        } else {
                          setSelectedTool(tool.id);
                        }
                      }}
                      className={`group relative p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.15] transition-all duration-500 text-left backdrop-blur-xl overflow-hidden ${
                        trialExpired && !subscription
                          ? 'opacity-50 cursor-not-allowed hover:border-red-500/50'
                          : 'hover:border-[#FFB800]/50 cursor-pointer'
                      }`}
                    >
                      {/* Lock overlay for expired trial */}
                      {trialExpired && !subscription && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 rounded-2xl">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-500/20 flex items-center justify-center">
                              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <p className="text-white text-sm font-semibold">Trial Expired</p>
                          </div>
                        </div>
                      )}

                      {/* Shine effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <motion.div 
                            className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-[#FFB800]/20 to-[#FFB800]/5 border border-[#FFB800]/30 shadow-lg shadow-[#FFB800]/20"
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <tool.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFB800]" />
                          </motion.div>
                          <motion.div
                            animate={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#FFB800] transition-colors duration-300" />
                          </motion.div>
                        </div>
                        <h3 className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base group-hover:text-[#FFB800] transition-colors duration-300">{tool.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-2">{tool.description}</p>
                      </div>
                      
                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FFB800] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Tool Modal */}
      <AnimatePresence>
        {selectedTool && (
          <Modal
            isOpen={!!selectedTool}
            onClose={() => setSelectedTool(null)}
            title={tools.find(t => t.id === selectedTool)?.name || ''}
          >
            {renderTool(selectedTool)}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
