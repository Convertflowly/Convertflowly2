import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, Star, Globe, Check } from 'lucide-react';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import Footer from './components/Footer';
import ImageConverter from './tools/ImageConverter';
import ImageCompressor from './tools/ImageCompressor';
import ImageMerger from './tools/ImageMerger';
import ImageEditor from './tools/ImageEditor';
import PDFConverter from './tools/PDFConverter';
import PDFMerger from './tools/PDFMerger';
import PDFSigner from './tools/PDFSigner';
import SamplePDFGenerator from './tools/SamplePDFGenerator';
import PlaceholderGenerator from './tools/PlaceholderGenerator';
import FaviconMaker from './tools/FaviconMaker';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Pricing } from './pages/Pricing';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { tools, categories } from './types/tools';
import { supabase } from './lib/supabaseClient';

function App() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

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

  const filteredTools = tools;

  // Pricing Section Component
  const PricingSection = ({ navigate }: { navigate: any }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadProducts = async () => {
        try {
          const { data } = await supabase
            .from('subscription_products')
            .select('*')
            .eq('active', true)
            .order('price', { ascending: true });
          setProducts(data || []);
        } catch (err) {
          console.error('Error loading products:', err);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
    }, []);

    if (loading || products.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-12 sm:py-16 px-1"
      >
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {products.map((product: any) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.15] rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
            >
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

              <div className="mb-6 space-y-3">
                {/* Always show 7-day free trial first */}
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">7-day free trial</span>
                </div>
                
                {product.features && Array.isArray(product.features) && product.features.length > 0 ? (
                  product.features.slice(0, 4).map((feature: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">
                        {typeof feature === 'string' ? feature : feature.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">Unlimited access</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">Premium features</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">Priority support</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">All file formats</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">Advanced tools</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[#FFB800]/40 hover:-translate-y-0.5"
              >
                Try for Free
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012] text-white relative overflow-x-hidden">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-[0.12] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 0 0, rgba(255,184,0,0.18) 0, transparent 55%), radial-gradient(circle at 100% 0, rgba(132,76,255,0.25) 0, transparent 55%)`,
             backgroundSize: 'auto'
           }}>
      </div>
      
      {/* Subtle Glow Effect */}
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#FFB800]/25 rounded-full blur-[160px] pointer-events-none opacity-60"></div>
      
      {/* Navbar */}
      <Navbar onLogoClick={() => {
        setSelectedTool(null);
        navigate('/');
      }} />

      <main className="relative pt-16 sm:pt-20 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-24 mt-8 sm:mt-12"
        >
          {/* Main Heading */}
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-white block">Transform Files with</span>
            <span className="text-[#FFB800] block">Premium Quality</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-sm sm:text-base lg:text-lg text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Convert, compress, and edit images or PDFs instantly. All processing happens securely in your browser—no uploads, no waiting.
          </motion.p>

          {/* Feature Pills */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/5 border border-white/10"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB800]" />
              <span className="text-xs sm:text-sm font-medium text-white">100% Private</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/5 border border-white/10"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB800]" />
              <span className="text-xs sm:text-sm font-medium text-white">Lightning Fast</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/5 border border-white/10"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB800]" />
              <span className="text-xs sm:text-sm font-medium text-white">Premium Quality</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/5 border border-white/10"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB800]" />
              <span className="text-xs sm:text-sm font-medium text-white">Works Offline</span>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate('/signup')}
            className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-black font-bold text-base sm:text-lg rounded-xl transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-[#FFB800]/40 hover:-translate-y-0.5"
            style={{
              boxShadow: '0 20px 60px rgba(255, 184, 0, 0.5), 0 10px 30px rgba(255, 184, 0, 0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: '0 25px 70px rgba(255, 184, 0, 0.6), 0 15px 40px rgba(255, 184, 0, 0.4)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated shimmer/loading effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            <span className="relative z-10">Try for Free</span>
            <motion.div
              className="relative z-10"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Tools Grid */}
        <div id="tools-section" className="space-y-8 sm:space-y-12 pb-12 sm:pb-20">
          {categories.map((category, categoryIndex) => {
            const categoryTools = filteredTools.filter(tool => tool.category === category.id);
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
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: categoryIndex * 0.1 + toolIndex * 0.05, duration: 0.3 }}
                      className="group relative p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.15] transition-all duration-500 text-left backdrop-blur-xl overflow-hidden cursor-default"
                    >
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-[#FFB800]/20 to-[#FFB800]/5 border border-[#FFB800]/30 shadow-lg shadow-[#FFB800]/20">
                            <tool.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFB800]" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-white/40" />
                        </div>
                        <h3 className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{tool.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-2">{tool.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Section */}
        <PricingSection navigate={navigate} />

        {/* Footer Links */}
        <div className="text-center py-6 sm:py-8 space-x-3 sm:space-x-6 text-xs sm:text-sm px-4">
          <button
            onClick={() => navigate('/privacy')}
            className="text-gray-400 hover:text-[#FFB800] transition-colors"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => navigate('/terms')}
            className="text-gray-400 hover:text-[#FFB800] transition-colors"
          >
            Terms of Service
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="text-gray-400 hover:text-[#FFB800] transition-colors"
          >
            Contact
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );

  // Page Layout Component
  const PageLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012] overflow-x-hidden relative">
      {/* Ambient glows like homepage */}
      <div className="fixed inset-0 opacity-[0.12] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 0 0, rgba(255,184,0,0.18) 0, transparent 55%), radial-gradient(circle at 100% 0, rgba(132,76,255,0.25) 0, transparent 55%)`,
             backgroundSize: 'auto'
           }}>
      </div>
      <Navbar onLogoClick={() => navigate('/')} />
      <div className="relative pt-16 sm:pt-20 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/privacy" element={<PageLayout><Privacy /></PageLayout>} />
      <Route path="/terms" element={<PageLayout><Terms /></PageLayout>} />
      <Route path="/contact" element={<PageLayout><Contact /></PageLayout>} />
    </Routes>
  );
}

export default App;
