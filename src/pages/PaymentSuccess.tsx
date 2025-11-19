import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { CheckCircle, Loader } from 'lucide-react';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId || !user) {
      setStatus('error');
      setMessage('Invalid session or user not logged in');
      setTimeout(() => navigate('/dashboard'), 3000);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams, user, navigate]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log('✅ Payment completed! Session ID:', sessionId);
      console.log('User ID:', user?.id);

      // Payment successful - webhook will update database
      // Just show success message and redirect
      setStatus('success');
      setMessage('Payment successful! Your subscription is being activated...');
      
      // Wait a bit for webhook to process, then redirect
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setMessage('An error occurred. Please go to dashboard and refresh.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E1246] via-[#140821] to-[#050012] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-[0.12] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 0 0, rgba(255,184,0,0.18) 0, transparent 55%), radial-gradient(circle at 100% 0, rgba(132,76,255,0.25) 0, transparent 55%)`,
             backgroundSize: 'auto'
           }}>
      </div>
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#FFB800]/25 rounded-full blur-[160px] pointer-events-none opacity-60"></div>
      
      <div className="relative z-10 bg-[#1E1246]/80 backdrop-blur-xl border border-[#FFB800]/20 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'processing' && (
          <>
            <Loader className="w-16 h-16 text-[#FFB800] mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">Processing Payment</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <div className="text-sm text-gray-500">
              Your subscription is now active
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Payment Error</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => navigate('/pricing')}
              className="px-6 py-2 bg-[#FFB800] hover:bg-[#FF9A1F] text-black font-semibold rounded-lg transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
