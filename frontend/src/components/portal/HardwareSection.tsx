import React from 'react';
import { Cpu, Wifi, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

interface HardwareSectionProps {
  onExploreHardware: () => void;
}

export const HardwareSection: React.FC<HardwareSectionProps> = ({ onExploreHardware }) => {
  return (
    <section className="py-12 md:py-16 bg-white border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-8">
        
        <div className="bg-cream rounded-3xl p-6 md:p-8 border border-cream-border shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800 inline-flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-forest-800" /> Platform Hardware Extension
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-extrabold text-charcoal">
              Optional Stationed Cognitive Care Console
            </h3>
            <p className="text-charcoal-muted text-xs md:text-sm leading-relaxed">
              Smriti-Setu connects seamlessly to an optional stationary hardware gateway (ESP32 console) featuring dedicated physical assist buttons, tactile LED status indicators, and offline event logging for home and facility care nodes.
            </p>
          </div>

          <div className="lg:col-span-4 text-left lg:text-right">
            <button
              onClick={onExploreHardware}
              className="bg-forest-800 hover:bg-forest-900 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2"
            >
              <span>View Telemetry Console</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
