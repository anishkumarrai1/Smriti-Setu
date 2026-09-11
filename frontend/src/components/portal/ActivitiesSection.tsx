import React from 'react';
import { BrainCircuit, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { ActivityType } from '../../types';

interface ActivitiesSectionProps {
  onStartActivity: (type: ActivityType) => void;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ onStartActivity }) => {
  const activities = [
    {
      id: 'memory_match' as ActivityType,
      name: 'Remember the Picture',
      category: 'Memory',
      difficulty: 'Easy',
      duration: '5 min',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
      description: 'Match familiar North East tea garden and landscape photo pairs.',
    },
    {
      id: 'picture_recognition' as ActivityType,
      name: 'Family Face & Relation Recognition',
      category: 'Recognition',
      difficulty: 'Easy',
      duration: '4 min',
      image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=600&q=80',
      description: 'Upload family photos, recognize relations, and speak answers in regional languages.',
    },
    {
      id: 'sequence_recall' as ActivityType,
      name: 'Color Pattern Recall',
      category: 'Pattern',
      difficulty: 'Adaptive',
      duration: '5 min',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
      description: 'Remember and repeat simple color sequence patterns.',
    },
    {
      id: 'routine_recall' as ActivityType,
      name: 'Remember Your Morning',
      category: 'Daily Recall',
      difficulty: 'Easy',
      duration: '6 min',
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80',
      description: 'Sequence daily morning steps: tea, morning walk, warm breakfast.',
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-white border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cream-border pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800 inline-flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-forest-800" /> Curated Cognitive Suite
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-charcoal mt-1">
              Cognitive Activities & Exercises
            </h2>
            <p className="text-charcoal-muted text-sm md:text-base mt-1">
              Scientifically adapted memory, attention, pattern, and daily recall exercises calibrated for senior citizens.
            </p>
          </div>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              onClick={() => onStartActivity(act.id)}
              className="bg-cream rounded-2xl border border-cream-border overflow-hidden shadow-xs hover:shadow-soft hover:border-forest-600 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={act.image}
                  alt={act.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-forest-900 text-white rounded-md font-extrabold text-[10px] uppercase tracking-wider">
                  {act.category}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-lg text-charcoal group-hover:text-forest-800 transition-colors">
                    {act.name}
                  </h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-forest-800" /> {act.duration} · {act.difficulty}
                  </span>
                  <button className="bg-forest-800 text-white hover:bg-forest-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3 text-gold" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
