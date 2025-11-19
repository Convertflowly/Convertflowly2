import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

  // Hardcoded admin credentials
if (email === 'oskar@kingadmin.com' && password === 'HelloPlease10!') {
  localStorage.setItem('adminToken', 'admin_' + Date.now());
  localStorage.setItem('adminEmail', email);
  navigate('/admin/dashboard');
} else {
  setError('Invalid admin credentials');
}  
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012] px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-[0.12] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 0 0, rgba(255,184,0,0.18) 0, transparent 55%), radial-gradient(circle at 100% 0, rgba(132,76,255,0.25) 0, transparent 55%)`,
             backgroundSize: 'auto'
           }}>
      </div>
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#FFB800]/25 rounded-full blur-[160px] pointer-events-none opacity-60"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#1E1246]/80 backdrop-blur-xl rounded-2xl border border-[#FFB800]/20 p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-[#FFB800] rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Admin Panel
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-violet-500/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="admin@admin.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-violet-500/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] hover:from-[#FF9A1F] hover:to-[#FFB800] text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login to Admin Panel'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Admin credentials required to access
          </p>
        </div>
      </div>
    </div>
  );
}
