import React from 'react';
import { UserCheck, Activity, Heart, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface CaregiverSectionProps {
  onExploreCaregiver: () => void;
}

export const CaregiverSection: React.FC<CaregiverSectionProps> = ({ onExploreCaregiver }) => {
  return (
    <section className="py-14 md:py-20 bg-cream border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Caregiver Copy & Highlights */}
        <div className="lg:col-span-7 space-y-6">
          
          <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800 inline-flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-forest-800" /> Family Caregiver Portal
          </span>

          <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-charcoal leading-tight">
            Stay connected without being overwhelmed.
          </h2>

          <p className="text-charcoal-muted text-base leading-relaxed">
            Caregivers can review daily activity progress, manage medicine reminders, curate family memory garden albums, and view clinical insights from any location.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-cream-border shadow-xs">
              <Activity className="w-5 h-5 text-forest-800 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-charcoal text-sm">Daily Engagement Tracking</h4>
                <p className="text-xs text-charcoal-muted">View completed cognitive sessions, accuracy trends, and response time metrics.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-cream-border shadow-xs">
              <Heart className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-charcoal text-sm">Memory Garden Curation</h4>
                <p className="text-xs text-charcoal-muted">Upload family photographs, add story notes, and set voice prompt tags.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onExploreCaregiver}
              className="bg-forest-800 hover:bg-forest-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-soft transition-all inline-flex items-center gap-2"
            >
              <span>Explore Caregiver Support</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </button>
          </div>

        </div>

        {/* Right Column: Caregiver Summary Card Frame with Real Photo */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-cream-border shadow-banner space-y-4">
          
          {/* Real Caregiver Photograph Frame */}
          <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80"
              alt="Indian Family Caregiver assisting elderly dementia patient"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 text-white">
              <span className="text-[11px] font-bold text-amber-300">
                Family Memory Garden & Daily Reminders Support
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-forest-800">
              Caregiver Insight Summary
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Patient: Ranjit Borthakur (Assam)
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-medium text-charcoal">
            <div className="p-2.5 bg-cream rounded-xl border border-cream-border flex items-center justify-between">
              <span>Today's Cognitive Sessions</span>
              <strong className="text-forest-800 font-extrabold">2 of 2 Completed</strong>
            </div>

            <div className="p-2.5 bg-cream rounded-xl border border-cream-border flex items-center justify-between">
              <span>Weekly Memory Recall Trend</span>
              <strong className="text-forest-800 font-extrabold">88% (Stable Progress)</strong>
            </div>

            <div className="p-2.5 bg-cream rounded-xl border border-cream-border flex items-center justify-between">
              <span>Geriatric Medicine Schedule</span>
              <strong className="text-emerald-700 font-extrabold">08:00 AM Verified</strong>
            </div>
          </div>

          <p className="text-[11px] text-charcoal-muted italic pt-1 border-t border-slate-100">
            "AI-assisted cognitive observations & daily care tracking."
          </p>
        </div>

      </div>
    </section>
  );
};
