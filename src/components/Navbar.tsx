import { Layers, Shield, Lock, Zap, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onLogoClick?: () => void;
}

const badges = [
  { icon: Shield, text: '100% Private' },
  { icon: Lock, text: 'Encrypted' },
  { icon: Zap, text: 'Instant' },
];

export default function Navbar({ onLogoClick }: NavbarProps) {
  const [currentBadge, setCurrentBadge] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBadge((prev) => (prev + 1) % badges.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const Badge = badges[currentBadge];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1E1246]/95 to-[#140821]/95 border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFB800]/25 blur-lg rounded-full"></div>
                <Layers className="relative w-5 h-5 sm:w-6 sm:h-6 text-[#FFB800]" strokeWidth={2.5} />
              </div>
              <span className="text-base sm:text-xl font-semibold text-white tracking-wide">ConvertFlowly</span>
              <span className="hidden xs:inline-block px-2 py-0.5 text-[9px] font-bold text-[#FFB800] bg-gradient-to-r from-[#FFB800]/15 to-[#FF9A1F]/10 border border-[#FFB800]/30 rounded uppercase tracking-wider">PREMIUM</span>
            </div>
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            {!isAuthPage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:text-[#FFB800] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-black bg-[#FFB800] hover:bg-[#FF9A1F] rounded-lg transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
