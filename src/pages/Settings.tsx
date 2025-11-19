import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Lock, Trash2, Mail, Crown, CreditCard, AlertCircle } from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      console.log('User email loaded:', user.email);
      setEmail(user.email);
    } else {
      console.log('No user email found:', user);
    }
  }, [user]);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_products(name, price, billing_period)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!error && data) {
        setSubscription(data);
      }
    } catch (err) {
      console.log('No active subscription');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id);
      
      if (error) throw error;
      
      setMessage('Subscription cancelled successfully');
      setSubscription(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setMessage('Email updated successfully. Check your new email for confirmation.');
    } catch (err) {
      setError((err as Error).message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError((err as Error).message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Delete user data first (resumes, etc.)
      const { error: dataError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', user?.id);

      if (dataError) throw dataError;

      // Then delete the user account
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '');
      if (authError) throw authError;

      // Sign out and redirect
      await signOut();
      navigate('/login');
    } catch (err) {
      setError((err as Error).message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

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
      
      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Subscription Section */}
          <div className="bg-[#1E1246]/80 backdrop-blur-xl border border-[#FFB800]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-5 h-5 text-[#FFB800]" />
              <h2 className="text-xl font-semibold text-white">Subscription</h2>
            </div>
            
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FFB800] border-t-transparent"></div>
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#FFB800]/10 rounded-lg border border-[#FFB800]/20">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-lg font-bold text-white">
                        {subscription.subscription_products?.name}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      ${subscription.subscription_products?.price}/{subscription.subscription_products?.billing_period}
                    </p>
                    {subscription.current_period_end && (
                      <p className="text-gray-400 text-xs mt-1">
                        Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      Active
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/pricing')}
                    className="flex-1 py-2 px-4 bg-[#FFB800] hover:bg-[#FF9A1F] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Upgrade Plan
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-300 font-medium mb-1">Free Plan</p>
                    <p className="text-gray-400 text-sm">
                      You're currently on the free plan. Upgrade to unlock unlimited features.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full py-2 px-4 bg-[#FFB800] hover:bg-[#FF9A1F] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>

          {/* Email Section */}
          <div className="bg-[#1E1246]/80 backdrop-blur-xl border border-[#FFB800]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-[#FFB800]" />
              <h2 className="text-xl font-semibold text-white">Email Address</h2>
            </div>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB800]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#FFB800] hover:bg-[#FF9A1F] text-white font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-[#1E1246]/80 backdrop-blur-xl border border-[#FFB800]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-[#FFB800]" />
              <h2 className="text-xl font-semibold text-white">Change Password</h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB800]"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB800]"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#FFB800] hover:bg-[#FF9A1F] text-white font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Delete Account Section */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">Delete Account</h2>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
