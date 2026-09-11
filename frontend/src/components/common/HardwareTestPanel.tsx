import React, { useState } from 'react';
import { Wifi, WifiOff, Activity, Keyboard, X, Terminal, RefreshCw } from 'lucide-react';
import { useHardwareSocketStore } from '../../stores/useHardwareSocketStore';
import { useHardwareControls } from '../../hooks/useHardwareControls';
import { LogicalButton, LogicalButtonAction } from '../../services/hardwareInputAdapter';

interface ButtonStats {
  count: number;
  lastReceived: string | null;
}

export const HardwareTestPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useHardwareSocketStore();

  const [buttonStats, setButtonStats] = useState<Record<LogicalButton, ButtonStats>>({
    RED: { count: 0, lastReceived: null },
    GREEN: { count: 0, lastReceived: null },
    BLUE: { count: 0, lastReceived: null },
    YELLOW: { count: 0, lastReceived: null },
  });

  const [eventHistory, setEventHistory] = useState<LogicalButtonAction[]>([]);

  // Subscribe to normalized hardware input adapter
  const { lastAction, triggerDevButton } = useHardwareControls({
    onButtonPress: (button, action) => {
      const timeStr = new Date(action.timestamp).toLocaleTimeString();
      
      setButtonStats((prev) => ({
        ...prev,
        [button]: {
          count: prev[button].count + 1,
          lastReceived: timeStr,
        },
      }));

      setEventHistory((prev) => [action, ...prev.slice(0, 19)]);
    },
  });

  const clearStats = () => {
    setButtonStats({
      RED: { count: 0, lastReceived: null },
      GREEN: { count: 0, lastReceived: null },
      BLUE: { count: 0, lastReceived: null },
      YELLOW: { count: 0, lastReceived: null },
    });
    setEventHistory([]);
  };

  // Development overlay launcher button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-mono font-bold transition-all hover:scale-105"
        title="Open Dev Hardware Test Panel"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
        <Terminal className="w-4 h-4 text-purple-400" />
        <span>Hardware Tester</span>
        {lastAction && (
          <span className="ml-1 px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-700">
            {lastAction.button}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-lg bg-slate-950/95 backdrop-blur-md text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-sm tracking-wide text-white">ESP32 Hardware Test Panel</h3>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-mono">
            DEV ONLY
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isConnected
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border-rose-800 text-rose-300'
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-5 max-h-[500px] overflow-y-auto">
        
        {/* Last Event Monitor Box */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-purple-300">
              <Activity className="w-3.5 h-3.5" /> Last Event Received
            </span>
            {lastAction && <span>{new Date(lastAction.timestamp).toLocaleTimeString()}</span>}
          </div>

          {lastAction ? (
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Type</span>
                <span className="font-bold text-white">BUTTON_PRESS</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Logical Button</span>
                <span className="font-extrabold text-amber-400 text-sm">{lastAction.button}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Input Source</span>
                <span className="font-semibold text-slate-300 uppercase">{lastAction.source}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Device ID</span>
                <span className="font-semibold text-slate-300">{lastAction.deviceId || 'ESP32-NER-GW-001'}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">
              No hardware event received yet. Press keys 1, 2, 3, 4 or click buttons below to test.
            </p>
          )}
        </div>

        {/* Button State Metrics (4 Buttons Grid) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Logical Button Metrics
            </span>
            <button
              onClick={clearStats}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Clear Stats
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* RED BUTTON */}
            <button
              onClick={() => triggerDevButton('RED')}
              className="p-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-rose-400 text-xs tracking-wider">RED</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 text-[10px] font-mono font-bold">
                  {buttonStats.RED.count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                {buttonStats.RED.lastReceived ? buttonStats.RED.lastReceived : 'Never'}
              </p>
            </button>

            {/* GREEN BUTTON */}
            <button
              onClick={() => triggerDevButton('GREEN')}
              className="p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-emerald-400 text-xs tracking-wider">GREEN</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 text-[10px] font-mono font-bold">
                  {buttonStats.GREEN.count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                {buttonStats.GREEN.lastReceived ? buttonStats.GREEN.lastReceived : 'Never'}
              </p>
            </button>

            {/* BLUE BUTTON */}
            <button
              onClick={() => triggerDevButton('BLUE')}
              className="p-3 rounded-2xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-sky-400 text-xs tracking-wider">BLUE</span>
                <span className="px-1.5 py-0.5 rounded bg-sky-900 text-sky-200 text-[10px] font-mono font-bold">
                  {buttonStats.BLUE.count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                {buttonStats.BLUE.lastReceived ? buttonStats.BLUE.lastReceived : 'Never'}
              </p>
            </button>

            {/* YELLOW BUTTON */}
            <button
              onClick={() => triggerDevButton('YELLOW')}
              className="p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/60 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-amber-400 text-xs tracking-wider">YELLOW</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-900 text-amber-200 text-[10px] font-mono font-bold">
                  {buttonStats.YELLOW.count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono line-clamp-1">
                {buttonStats.YELLOW.lastReceived ? buttonStats.YELLOW.lastReceived : 'Never'}
              </p>
            </button>
          </div>
        </div>

        {/* Keyboard Test Guide Reference Box */}
        <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span>Keyboard Simulation Mapping</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-white border border-slate-700">1</span>
              <span className="block text-[10px] text-rose-400 font-bold mt-1">RED</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-white border border-slate-700">2</span>
              <span className="block text-[10px] text-emerald-400 font-bold mt-1">GREEN</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-white border border-slate-700">3</span>
              <span className="block text-[10px] text-sky-400 font-bold mt-1">BLUE</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-white border border-slate-700">4</span>
              <span className="block text-[10px] text-amber-400 font-bold mt-1">YELLOW</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HardwareTestPanel;
