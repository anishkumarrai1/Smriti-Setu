import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const { elderlyMode } = useAccessibilityStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 ${
          elderlyMode ? 'max-w-3xl p-8 md:p-10' : ''
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <h2 className={`font-bold text-slate-900 ${elderlyMode ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:ring-4 focus:ring-brand-500/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
