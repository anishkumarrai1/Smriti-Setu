import React, { useState } from 'react';
import { 
  Clock, 
  ArrowRight, 
  Sparkles,
  User,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { VoiceButton } from '../../components/common/VoiceButton';
import { PatientSwitcherModal } from '../../components/common/PatientSwitcherModal';
import { ActivityType } from '../../types';

interface PatientDashboardProps {
  onStartActivity: (type: ActivityType) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onStartActivity }) => {
  const { selectedPatient, patients } = useAuthStore();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const patientName = selectedPatient?.name || 'Ranjit Borthakur';
  const greetingMessage = `Good morning, ${patientName}. Welcome to your cognitive memory activities. Choose a game below to begin today's guided session.`;

  const baseUrl = (import.meta as any).env?.BASE_URL || '/';

  const cognitiveGames = [
    {
      id: 'memory_match' as ActivityType,
      title: 'Visual Memory Match',
      category: 'Visual Memory',
      duration: '5 mins',
      difficulty: 'Adaptive',
      image: `${baseUrl}card_memory_match.jpg`,
      description: 'Match pairs of familiar pictures, sunflowers, and scenic river cards.',
      badgeColor: 'bg-[#004085]',
    },
    {
      id: 'picture_recognition' as ActivityType,
      title: 'Family & Face Recognition',
      category: 'Family Memories',
      duration: '4 mins',
      difficulty: 'Easy',
      image: `${baseUrl}card_face_recognition.jpg`,
      description: 'Identify cherished family members (Grandfather, Grandmother, Son, Daughter-in-law, Granddaughter).',
      badgeColor: 'bg-emerald-700',
    },
    {
      id: 'sequence_recall' as ActivityType,
      title: 'Find the Same Images',
      category: 'Pattern Identification',
      duration: '3 mins',
      difficulty: 'Level 1-3',
      image: `${baseUrl}card_find_same_images.jpg`,
      description: 'Find and match identical roses, sunflowers, houses, butterflies, trees, and apples.',
      badgeColor: 'bg-purple-700',
    },
    {
      id: 'familiar_sound' as ActivityType,
      title: 'Familiar Sound & Audio Quiz',
      category: 'Auditory Recall',
      duration: '4 mins',
      difficulty: 'Audio Guided',
      image: `${baseUrl}card_familiar_sound.jpg`,
      description: 'Listen to beloved voices and family laughs to choose the right person.',
      badgeColor: 'bg-blue-700',
    },
    {
      id: 'photo_puzzle' as ActivityType,
      title: 'Personalized Photo Puzzle',
      category: 'Photo Jigsaw',
      duration: '5 mins',
      difficulty: 'Gentle 2×2 / 3×3',
      image: `${baseUrl}card_photo_puzzle.jpg`,
      description: 'Drag and drop jigsaw pieces to reconstruct cherished family photographs.',
      badgeColor: 'bg-rose-700',
    },
  ];

  return (
    <div className="space-y-8 py-2">
      
      {/* 1. Patient Hero Greeting Photography Frame */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-300 bg-slate-950 text-white min-h-[260px] md:min-h-[290px] flex items-end">
        {/* Background Image: North East Scenic Hill Landscape */}
        <img
          src={`${((import.meta as any).env?.BASE_URL || '/')}ne_landscape_hero.png`}
          alt="North East Scenic Hill Landscape"
          className="absolute inset-0 w-full h-full object-cover opacity-60 object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

        <div className="relative z-10 p-6 sm:p-8 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-0.5 bg-amber-400 text-slate-950 font-black text-xs rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Senior Patient Care Node
            </span>
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="px-3 py-0.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-md backdrop-blur-xs flex items-center gap-1 border border-white/30 transition-all cursor-pointer"
              title="Switch patient or add new patient"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span>Switch Patient ({patients.length} available)</span>
              <RefreshCw className="w-3 h-3 ml-0.5 text-amber-300" />
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
            Good morning, {patientName}.
          </h1>
          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
            Welcome to your cognitive memory activities. Choose a game below to begin today's guided session.
          </p>

          <div className="pt-1">
            <VoiceButton 
              textToSpeak={greetingMessage}
              label="Listen to Audio Guide" 
            />
          </div>
        </div>
      </div>

      {/* 2. Cognitive AI Gaming Modules Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#003366]">
              Interactive Cognitive Care
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-0.5">
              5 Core Memory & Recall Games
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cognitiveGames.map((act) => (
            <div
              key={act.id}
              onClick={() => onStartActivity(act.id)}
              className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs hover:shadow-md hover:border-[#003366] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={act.image}
                  alt={act.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-white rounded font-extrabold text-[10px] uppercase shadow-xs ${act.badgeColor}`}>
                  {act.category}
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-900/80 text-amber-300 font-bold text-[10px] rounded border border-slate-700">
                  {act.difficulty}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-[#003366] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {act.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#003366]" /> {act.duration}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartActivity(act.id);
                    }}
                    className="px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
                  >
                    <span>Start Game</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Switcher Modal */}
      <PatientSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

    </div>
  );
};
