import React from 'react';
import { Compass, Globe, WifiOff, Volume2, ShieldCheck, Heart } from 'lucide-react';

export const NERSection: React.FC = () => {
  return (
    <section className="py-14 md:py-20 bg-white border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-terracotta inline-flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-terracotta" /> Regional Adaptation
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-charcoal">
            Designed for communities across the North Eastern Region
          </h2>
          <p className="text-charcoal-muted text-sm md:text-base leading-relaxed">
            Tailored specifically for Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura — combining culturally familiar themes with resilient offline accessibility.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-cream p-6 rounded-2xl border border-cream-border space-y-3">
            <div className="p-3 bg-forest-800 text-white rounded-xl w-fit">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">Regional Languages</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Full interface localization and voice support in English, Hindi, Assamese (অসমীয়া), and Bengali (বাংলা).
            </p>
          </div>

          <div className="bg-cream p-6 rounded-2xl border border-cream-border space-y-3">
            <div className="p-3 bg-terracotta text-white rounded-xl w-fit">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">Cultural Content</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Activity themes and photo prompt cards inspired by NER festivals, tea gardens, rivers, and regional heritage.
            </p>
          </div>

          <div className="bg-cream p-6 rounded-2xl border border-cream-border space-y-3">
            <div className="p-3 bg-gold-dark text-white rounded-xl w-fit">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">Voice Assistance</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Calm text-to-speech audio prompts (`🔊 Listen`) supporting older adults with limited literacy or eyesight.
            </p>
          </div>

          <div className="bg-cream p-6 rounded-2xl border border-cream-border space-y-3">
            <div className="p-3 bg-forest-800 text-white rounded-xl w-fit">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">Offline Sync</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Local queue architecture ensures activities function smoothly in remote areas without constant internet.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
