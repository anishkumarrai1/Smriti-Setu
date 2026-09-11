import React, { useState } from 'react';
import { Heart, Volume2, Sparkles, MapPin, Calendar, User } from 'lucide-react';
import { VoiceButton } from '../common/VoiceButton';

export const MemoryJourneySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Family' | 'Career' | 'School' | 'Events'>('All');

  const memoryItems = [
    {
      id: 'm1',
      title: 'Rongali Bihu Courtyard Gathering',
      year: '1984',
      person: 'Ananya & Family',
      location: 'Guwahati, Assam',
      category: 'Family',
      story: 'Gathering with the family under the courtyard neem tree during Rongali Bihu. We listened to dhol beats and shared fresh pitha.',
      image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'm2',
      title: 'Morning Mist at Dibrugarh Tea Estate',
      year: '1976',
      person: 'Colleague Suresh Barua',
      location: 'Dibrugarh, Assam',
      category: 'Career',
      story: 'Beginning my career in the lush green tea gardens of Dibrugarh. Early morning mist over the tea bushes and hot tea.',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'm3',
      title: 'Graduation Day at Cotton College',
      year: '1972',
      person: 'Classmates & Professor Saikia',
      location: 'Panbazar, Guwahati',
      category: 'School',
      story: 'Receiving degree diploma at Cotton College hall. Walking along Panbazar road with close friends celebrating over tea.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'm4',
      title: 'Sunset Ferry Ride across Brahmaputra',
      year: '1992',
      person: 'Ananya Borthakur',
      location: 'North Guwahati',
      category: 'Events',
      story: 'Crossing the mighty Brahmaputra river during golden hour. Calm waters, cool evening breeze, and distant temple bells.',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const filtered = activeCategory === 'All'
    ? memoryItems
    : memoryItems.filter((m) => m.category === activeCategory);

  return (
    <section className="py-14 md:py-20 bg-cream border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cream-border pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-terracotta inline-flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-terracotta" /> Reminiscence & Storytelling
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-charcoal mt-1">
              My Memories — A Journey Worth Revisiting
            </h2>
            <p className="text-charcoal-muted text-sm md:text-base mt-1">
              Personalized photo timeline and familiar stories designed to strengthen emotional connection and memory recall.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Family', 'Career', 'School', 'Events'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-forest-800 text-white font-extrabold shadow-xs'
                    : 'bg-white text-charcoal border border-cream-border hover:bg-cream-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((mem) => (
            <div
              key={mem.id}
              className="bg-white rounded-2xl border border-cream-border overflow-hidden shadow-xs hover:shadow-soft hover:border-forest-400 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={mem.image}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-forest-900 text-white rounded-md font-extrabold text-[10px] uppercase tracking-wider">
                  {mem.year} · {mem.category}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-charcoal leading-snug">
                    {mem.title}
                  </h3>

                  <div className="space-y-1 text-xs text-charcoal-muted font-medium">
                    <p className="flex items-center gap-1.5 text-charcoal font-bold">
                      <User className="w-3.5 h-3.5 text-forest-800 shrink-0" />
                      <span>{mem.person}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span>{mem.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-3 pt-1">
                    {mem.story}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <VoiceButton textToSpeak={mem.story} label="Listen to Story" size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
