import { Shield, Zap, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#140821] via-[#050012] to-[#050012] mt-20 border-t border-white/5">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[#FFB800]/25 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFB800]/20 blur-md rounded-full group-hover:bg-[#FFB800]/30 transition-all"></div>
                <Shield className="relative w-5 h-5 text-[#FFB800]" />
              </div>
              <h3 className="font-semibold bg-gradient-to-r from-[#FFB800] to-[#FFC933] bg-clip-text text-transparent">100% Private</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              All processing happens in your browser. Your files never leave your device.
            </p>
          </div>
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFB800]/20 blur-md rounded-full group-hover:bg-[#FFB800]/30 transition-all"></div>
                <Zap className="relative w-5 h-5 text-[#FFB800]" />
              </div>
              <h3 className="font-semibold bg-gradient-to-r from-[#FFB800] to-[#FFC933] bg-clip-text text-transparent">Lightning Fast</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              No uploads, no waiting. Convert and process files instantly.
            </p>
          </div>
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFB800]/20 blur-md rounded-full group-hover:bg-[#FFB800]/30 transition-all"></div>
                <Lock className="relative w-5 h-5 text-[#FFB800]" />
              </div>
              <h3 className="font-semibold bg-gradient-to-r from-[#FFB800] to-[#FFC933] bg-clip-text text-transparent">Zero Storage</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              We don't store anything. Complete privacy and security guaranteed.
            </p>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2025 <span className="text-white font-medium">ConvertFlowly</span>. All files processed locally in your browser.</p>
        </div>
      </div>
    </footer>
  );
}
