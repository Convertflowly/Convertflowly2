import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, ShoppingCart, DollarSign, Settings, Edit2, Crown, UserCog, X, Key } from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabaseClient';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [userCount, setUserCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stripeKeys, setStripeKeys] = useState({ publishable: '', secret: '' });
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', billing_period: 'monthly', currency: 'USD' });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<Map<string, any>>(new Map());
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({ email: '', full_name: '', subscription_product_id: '' });

  // Check if user is admin (hardcoded for oskar@kingadmin.com)
  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    const token = localStorage.getItem('adminToken');
    if (email === 'oskar@kingadmin.com' && token) {
      setAdminEmail(email);
      setIsAdmin(true);
    } else if (email && token) {
      alert('Access denied. Only oskar@kingadmin.com can access this page.');
      navigate('/admin/login');
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      // Load users from user_profiles table using admin client
      console.log('Loading user profiles...');
      
      const { data: profiles, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading profiles:', error);
        setAllUsers([]);
        setUserCount(0);
      } else if (profiles) {
        console.log('Successfully loaded profiles:', profiles.length);
        setAllUsers(profiles);
        setUserCount(profiles.length);
        
        // Load subscriptions for all users
        const { data: subscriptions } = await supabaseAdmin
          .from('user_subscriptions')
          .select('*, subscription_products(name, price, billing_period)')
          .eq('status', 'active');
        
        const subMap = new Map();
        subscriptions?.forEach(sub => {
          subMap.set(sub.user_id, sub);
        });
        setUserSubscriptions(subMap);
      } else {
        setAllUsers([]);
        setUserCount(0);
      }

      // Load revenue
      const { data: orders } = await supabaseAdmin.from('orders').select('amount');
      const revenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
      setTotalRevenue(revenue);

      // Load products - show all for admin
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('subscription_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productsError) {
        console.error('Products error:', productsError);
      }
      setProducts(productsData || []);

      // Load stripe settings
      try {
        const { data: stripeData } = await supabaseAdmin.from('stripe_settings').select('*').single();
        if (stripeData) {
          setStripeKeys({ publishable: stripeData.publishable_key || '', secret: stripeData.secret_key || '' });
        }
      } catch (err) {
        console.warn('Stripe settings not found');
      }

      // Load OpenAI API key
      try {
        const { data: apiData, error: apiError } = await supabaseAdmin
          .from('api_settings')
          .select('*')
          .maybeSingle();
        
        if (apiError) {
          console.error('Error loading API settings:', apiError);
        } else if (apiData) {
          console.log('Loaded OpenAI key:', apiData.openai_api_key ? 'Present' : 'Missing');
          setOpenaiKey(apiData.openai_api_key || '');
        } else {
          console.log('No API settings found in database');
        }
      } catch (err) {
        console.error('Exception loading API settings:', err);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  const handleEditUser = (user: any) => {
    const subscription = userSubscriptions.get(user.id);
    setEditingUser(user);
    setEditUserForm({
      email: user.email || '',
      full_name: user.full_name || user.display_name || '',
      subscription_product_id: subscription?.product_id || '',
    });
    setShowEditUser(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      // Update profile
      await supabaseAdmin
        .from('user_profiles')
        .update({
          email: editUserForm.email,
          full_name: editUserForm.full_name,
        })
        .eq('id', editingUser.id);
      
      // Handle subscription assignment
      if (editUserForm.subscription_product_id) {
        // Check if user already has a subscription
        const existingSub = userSubscriptions.get(editingUser.id);
        
        if (existingSub) {
          // Update existing subscription
          await supabase
            .from('user_subscriptions')
            .update({
              product_id: editUserForm.subscription_product_id,
              status: 'active',
            })
            .eq('id', existingSub.id);
        } else {
          // Create new subscription
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: editingUser.id,
              product_id: editUserForm.subscription_product_id,
              status: 'active',
              current_period_start: new Date(),
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            });
        }
      } else if (userSubscriptions.has(editingUser.id)) {
        // Remove subscription if product_id is empty
        const existingSub = userSubscriptions.get(editingUser.id);
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', existingSub.id);
      }
      
      alert('User updated successfully');
      setShowEditUser(false);
      setEditingUser(null);
      await loadData();
    } catch (error) {
      alert('Error updating user: ' + (error as any)?.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      // Call edge function to delete user (requires service role on server)
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );
      
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      
      alert('User deleted successfully');
      await loadData();
    } catch (error) {
      alert('Error deleting user: ' + (error as any)?.message);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      billing_period: product.billing_period,
      currency: 'USD',
    });
    setShowProductForm(true);
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) {
      alert('Please fill in name and price');
      return;
    }
    
    try {
      let stripeProductId = null;
      let stripePriceId = null;

      // Create/update in Stripe first
      try {
        // Get the current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-stripe-product`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              action: editingProduct ? 'update' : 'create',
              name: productForm.name,
              description: productForm.description,
              price: parseFloat(productForm.price),
              billing_period: productForm.billing_period,
              stripeProductId: editingProduct?.stripe_product_id,
              stripePriceId: editingProduct?.stripe_price_id,
            }),
          }
        );
        
        console.log('Stripe API Response Status:', response.status);

        const stripeResult = await response.json();
        console.log('Stripe API Result:', stripeResult);
        
        if (stripeResult.error) {
          console.error('Stripe error:', stripeResult.error);
          throw new Error(stripeResult.error);
        } else {
          stripeProductId = stripeResult.stripeProductId;
          stripePriceId = stripeResult.stripePriceId;
          console.log('✅ Stripe product created:', { stripeProductId, stripePriceId });
        }
      } catch (stripeError) {
        console.error('Stripe integration failed:', stripeError);
        alert('Error: ' + (stripeError as any).message + '\n\nMake sure you have:\n1. Added Stripe keys in Settings tab\n2. Edge Functions are deployed');
        return; // Stop here, don't create product without Stripe
      }

      // Then update database
      if (editingProduct) {
        const { error } = await supabaseAdmin
          .from('subscription_products')
          .update({
            name: productForm.name,
            price: parseFloat(productForm.price),
            description: productForm.description,
            billing_period: productForm.billing_period,
            stripe_product_id: stripeProductId,
            stripe_price_id: stripePriceId,
          })
          .eq('id', editingProduct.id);
        
        if (error) {
          console.error('Update error:', error);
          alert('Error: ' + error.message);
          return;
        }
        
        alert('Product updated successfully!');
      } else {
        const { error } = await supabaseAdmin.from('subscription_products').insert({
          name: productForm.name,
          price: parseFloat(productForm.price),
          description: productForm.description,
          billing_period: productForm.billing_period,
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
          active: true,
        });
        
        if (error) {
          console.error('Insert error:', error);
          alert('Error: ' + error.message);
          return;
        }
        
        alert('Product created successfully' + (stripePriceId ? ' with Stripe!' : '!'));
      }
      
      setProductForm({ name: '', price: '', description: '', billing_period: 'monthly', currency: 'USD' });
      setShowProductForm(false);
      setEditingProduct(null);
      await loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as any)?.message);
    }
  };

  const handleDeleteProduct = async (id: string, stripeProductId?: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      // Delete from database
      const { error } = await supabaseAdmin
        .from('subscription_products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete error:', error);
        alert('Error: ' + error.message);
        return;
      }
      
      alert('Product deleted successfully');
      loadData();
    } catch (error) {
      alert('Error: ' + (error as any)?.message);
    }
  };

  const handleSaveStripeKeys = async () => {
    if (!stripeKeys.publishable || !stripeKeys.secret) {
      alert('Please fill in both keys');
      return;
    }
    try {
      // Check if settings already exist
      const { data: existing, error: selectError } = await supabaseAdmin
        .from('stripe_settings')
        .select('*')
        .single();
      
      if (existing && !selectError) {
        // Update existing record
        await supabaseAdmin.from('stripe_settings').update({
          publishable_key: stripeKeys.publishable,
          secret_key: stripeKeys.secret,
        }).eq('id', existing.id);
      } else {
        // Insert new record
        await supabaseAdmin.from('stripe_settings').insert({
          publishable_key: stripeKeys.publishable,
          secret_key: stripeKeys.secret,
        });
      }
      alert('Stripe keys saved');
    } catch (error) {
      alert('Error: ' + (error as any)?.message);
    }
  };



  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFB800] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012]">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-[#FFB800]/20 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Logged in as: {adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div className="bg-slate-900/30 border-b border-[#FFB800]/20 px-6 py-3 flex gap-4">
        {['overview', 'users', 'products', 'stripe'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === t
                ? 'bg-[#FFB800] text-black font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-[#FFB800]/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">{userCount}</p>
                </div>
                <Users className="w-8 h-8 text-[#FFB800]" />
              </div>
            </div>
            <div className="bg-slate-900/50 border border-[#FFB800]/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-[#FFB800]" />
              </div>
            </div>
            <div className="bg-slate-900/50 border border-[#FFB800]/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Products</p>
                  <p className="text-3xl font-bold text-white mt-2">{products.length}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-[#FFB800]" />
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            {showEditUser && editingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-900 border border-[#FFB800]/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-[#FFB800]" />
                      Edit User
                    </h3>
                    <button
                      onClick={() => {
                        setShowEditUser(false);
                        setEditingUser(null);
                      }}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={editUserForm.email}
                        onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editUserForm.full_name}
                        onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Assign Subscription Plan</label>
                      <select
                        value={editUserForm.subscription_product_id}
                        onChange={(e) => setEditUserForm({ ...editUserForm, subscription_product_id: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                      >
                        <option value="">No Subscription (Free)</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.billing_period === 'lifetime' ? `$${product.price} (Lifetime)` : `$${product.price}/${product.billing_period}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveUser}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setShowEditUser(false);
                          setEditingUser(null);
                        }}
                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-slate-900/50 border border-[#FFB800]/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-[#FFB800]/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Subscription</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Created</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.length > 0 ? (
                      allUsers.map((user: any) => {
                        const subscription = userSubscriptions.get(user.id);
                        const isPaid = !!subscription;
                        
                        return (
                          <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                            <td className="px-6 py-4">
                              {isPaid ? (
                                <div className="flex items-center gap-2">
                                  <Crown className="w-5 h-5 text-yellow-400" />
                                  <span className="text-yellow-400 text-sm font-semibold">Paid</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-sm">Free</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-300">{user.email || 'No email'}</td>
                            <td className="px-6 py-4 text-slate-300">
                              {user.full_name || user.display_name || user.email?.split('@')[0] || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm">
                              {subscription ? (
                                <div>
                                  <div className="text-[#FFB800] font-medium">
                                    {subscription.subscription_products?.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {subscription.subscription_products?.billing_period === 'lifetime' 
                                      ? `$${subscription.subscription_products?.price} (Lifetime)` 
                                      : `$${subscription.subscription_products?.price}/${subscription.subscription_products?.billing_period}`}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-500">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-sm">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="border-b border-slate-800">
                        <td colSpan={6} className="px-6 py-4 text-slate-400 text-center">
                          No users found. Users will appear here after they sign up.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div>
            {!showProductForm ? (
              <button
                onClick={() => setShowProductForm(true)}
                className="mb-4 px-4 py-2 bg-[#FFB800] hover:bg-[#FF9A1F] text-black rounded-lg font-semibold transition-colors"
              >
                + Add Product
              </button>
            ) : (
              <div className="mb-6 bg-slate-900/50 border border-[#FFB800]/20 rounded-lg p-6 max-w-md">
                <h3 className="text-white font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                      placeholder="e.g., Pro Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Price (USD)</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                      placeholder="9.99"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                      placeholder="Product description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Billing Period</label>
                    <select
                      value={productForm.billing_period}
                      onChange={(e) => setProductForm({ ...productForm, billing_period: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="lifetime">Lifetime (One-time payment)</option>
                    </select>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-sm text-blue-300">
                      ℹ️ Stripe product and price will be created automatically when you save this product
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddProduct}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                        setProductForm({ name: '', price: '', description: '', billing_period: 'monthly', currency: 'USD' });
                      }}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-slate-900/50 border border-[#FFB800]/20 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">{product.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {product.billing_period === 'lifetime' ? `USD $${product.price} (Lifetime)` : `USD $${product.price}/${product.billing_period}`}
                    </p>
                    {product.description && <p className="text-slate-500 text-xs mt-1">{product.description}</p>}
                    <p className="text-xs mt-2">
                      <span className="text-slate-500">Stripe Price ID: </span>
                      <span className={product.stripe_price_id ? "text-green-400" : "text-yellow-400"}>
                        {product.stripe_price_id || 'Not configured'}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.stripe_product_id)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'stripe' && (
          <div className="bg-slate-900/50 border border-[#FFB800]/20 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#FFB800]" />
              Stripe Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Publishable Key</label>
                <input
                  type="password"
                  value={stripeKeys.publishable}
                  onChange={(e) => setStripeKeys({ ...stripeKeys, publishable: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                  placeholder="pk_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Secret Key</label>
                <input
                  type="password"
                  value={stripeKeys.secret}
                  onChange={(e) => setStripeKeys({ ...stripeKeys, secret: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-[#FFB800]/20 rounded-lg text-white focus:outline-none focus:border-[#FFB800]"
                  placeholder="sk_live_..."
                />
              </div>
              <button
                onClick={handleSaveStripeKeys}
                className="w-full px-4 py-2 bg-[#FFB800] hover:bg-[#FF9A1F] text-black rounded-lg font-semibold transition-colors"
              >
                Save Stripe Keys
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
