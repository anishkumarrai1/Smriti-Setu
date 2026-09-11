import React from 'react';
import { Lock, ShieldCheck, UserCheck, WifiOff } from 'lucide-react';

export const TrustPrivacySection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-cream border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800">
            Privacy & Trust Architecture
          </span>
          <h3 className="text-2xl font-serif font-extrabold text-charcoal">
            Restrained, Patient-First Security
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium text-charcoal">
          
          <div className="bg-white p-4 rounded-xl border border-cream-border space-y-1.5 shadow-xs">
            <Lock className="w-4 h-4 text-forest-800" />
            <h4 className="font-bold text-charcoal text-sm">Secure Account Access</h4>
            <p className="text-charcoal-muted">Role-based access control for patients, family caregivers, and clinicians.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-cream-border space-y-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-forest-800" />
            <h4 className="font-bold text-charcoal text-sm">Patient Privacy Control</h4>
            <p className="text-charcoal-muted">Family photo garden and memory logs remain private to authorized care circles.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-cream-border space-y-1.5 shadow-xs">
            <UserCheck className="w-4 h-4 text-forest-800" />
            <h4 className="font-bold text-charcoal text-sm">Role-Based Insights</h4>
            <p className="text-charcoal-muted">Simplified patient views, actionable caregiver dashboards, and detailed clinician metrics.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-cream-border space-y-1.5 shadow-xs">
            <WifiOff className="w-4 h-4 text-forest-800" />
            <h4 className="font-bold text-charcoal text-sm">Offline Queue Sync</h4>
            <p className="text-charcoal-muted">Local data storage ensures activity continuity during intermittent connectivity.</p>
          </div>

        </div>

      </div>
    </section>
  );
};
