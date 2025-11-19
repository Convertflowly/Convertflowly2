import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#1E1246] to-[#140821] rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 shadow-black/50">
        {/* Accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#FFB800]/50 to-transparent" />
        
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#FFB800] to-[#FFC933] bg-clip-text text-transparent">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all group border border-transparent hover:border-[#FFB800]/40"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-[#FFB800] transition-colors" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gradient-to-b from-[#140821] to-[#0a0a0a]">
          {children}
        </div>
      </div>
    </div>
  );
}
