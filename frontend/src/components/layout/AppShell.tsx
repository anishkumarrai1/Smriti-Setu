import React, { useState } from 'react';
import { AccessibilityToolbar } from '../common/AccessibilityToolbar';
import { OfflineBanner } from './OfflineBanner';
import { Header } from './Header';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface AppShellProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onSignOut?: () => void;
  children: (activeTab: string, setActiveTab: (tab: string) => void) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab: controlledTab,
  setActiveTab: controlledSetTab,
  onSignOut,
  children,
}) => {
  const [internalTab, setInternalTab] = useState('home');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = controlledSetTab !== undefined ? controlledSetTab : setInternalTab;
  const { reducedMotion } = useAccessibilityStore();

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all bg-slate-50 text-slate-900 ${
        reducedMotion ? 'motion-reduce' : ''
      }`}
    >
      <AccessibilityToolbar />
      <OfflineBanner />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={onSignOut} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-8">
        {children(activeTab, setActiveTab)}
      </main>

      <footer className="bg-[#002244] text-slate-200 py-6 border-t-2 border-[#001428] text-xs font-sans">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-serif font-bold text-white tracking-wide">SMRITI-SETU</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">National Cognitive Health & Memory Assistance Framework</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Ministry of Health & Family Welfare, Government of India
          </p>
        </div>
      </footer>
    </div>
  );
};

