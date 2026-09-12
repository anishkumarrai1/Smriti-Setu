import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Target, 
  Clock, 
  Award, 
  Gamepad2, 
  Brain, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { speakText, stopSpeech } from '../../utils/speech';
import { PatientProfile, GameSession } from '../../types';

export type FormulaKey = 'accuracy' | 'responseTime' | 'cognitiveLevel' | 'gamesPlayed' | 'domainBreakdown';

interface ClinicalFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFormulaKey?: FormulaKey;
  patient: PatientProfile;
  sessions: GameSession[];
  avgAccuracy: number;
  avgResponseTimeSec: string;
  totalGamesPlayed: number;
  currentDifficulty: string;
}

export const ClinicalFormulaModal: React.FC<ClinicalFormulaModalProps> = ({
  isOpen,
  onClose,
  initialFormulaKey = 'accuracy',
  patient,
  sessions,
  avgAccuracy,
  avgResponseTimeSec,
  totalGamesPlayed,
  currentDifficulty,
}) => {
  const [selectedKey, setSelectedKey] = useState<FormulaKey>(initialFormulaKey);
  const [isSpeaking, setIsSpeaking] = useState(false);

  React.useEffect(() => {
    if (isOpen && initialFormulaKey) {
      setSelectedKey(initialFormulaKey);
    }
  }, [isOpen, initialFormulaKey]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text, 'en', () => setIsSpeaking(false));
    }
  };

  const handleClose = () => {
    stopSpeech();
    setIsSpeaking(false);
    onClose();
  };

  // Simple, clean, concise formula definitions
  const simpleFormulas: Record<FormulaKey, {
    title: string;
    icon: React.ReactNode;
    color: string;
    badgeColor: string;
    formulaBox: string;
    meaning: string;
    liveCalculation: string;
    liveResult: string;
    speechText: string;
  }> = {
    accuracy: {
      title: 'Average Accuracy',
      icon: <Target className="w-5 h-5 text-emerald-700" />,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      badgeColor: 'bg-emerald-600',
      formulaBox: 'Accuracy = ( Total Score ÷ Total Games )',
      meaning: 'Add all game scores together and divide by the number of games played.',
      liveCalculation: `Sum of scores ÷ ${totalGamesPlayed} games`,
      liveResult: `${avgAccuracy}% Accuracy`,
      speechText: `Formula for Average Accuracy is: Total Score divided by Total Games. For ${patient.name}, the average accuracy is ${avgAccuracy} percent across ${totalGamesPlayed} games.`,
    },
    responseTime: {
      title: 'Average Response Time',
      icon: <Clock className="w-5 h-5 text-blue-700" />,
      color: 'bg-blue-50 border-blue-300 text-blue-900',
      badgeColor: 'bg-blue-600',
      formulaBox: 'Avg Time = Total Seconds ÷ Total Games',
      meaning: 'Total time taken in all games divided by the total number of games played.',
      liveCalculation: `Total latency seconds ÷ ${totalGamesPlayed} games`,
      liveResult: `${avgResponseTimeSec}s Reaction Time`,
      speechText: `Formula for Average Response Time is: Total Seconds divided by Total Games. For ${patient.name}, the average response speed is ${avgResponseTimeSec} seconds.`,
    },
    cognitiveLevel: {
      title: 'Cognitive Level (Difficulty)',
      icon: <Award className="w-5 h-5 text-amber-700" />,
      color: 'bg-amber-50 border-amber-300 text-amber-900',
      badgeColor: 'bg-amber-600',
      formulaBox: 'Score ≥ 80% ➔ Challenging | 60%–80% ➔ Moderate | < 60% ➔ Gentle',
      meaning: 'The app automatically selects the level based on the patient’s recent average score.',
      liveCalculation: `Patient Score is ${avgAccuracy}%`,
      liveResult: `Level: ${currentDifficulty.toUpperCase()}`,
      speechText: `Cognitive Level formula: If score is 80 percent or higher, level is Challenging. Between 60 and 80 percent, level is Moderate. Below 60 percent, level is Gentle. Current level is ${currentDifficulty}.`,
    },
    gamesPlayed: {
      title: 'Games Played',
      icon: <Gamepad2 className="w-5 h-5 text-purple-700" />,
      color: 'bg-purple-50 border-purple-300 text-purple-900',
      badgeColor: 'bg-purple-600',
      formulaBox: 'Total Games = Count of all completed sessions',
      meaning: 'Counts every finished game across Memory, Photo, Audio, and Routine activities.',
      liveCalculation: `Memory + Face + Sound + Routine sessions`,
      liveResult: `${totalGamesPlayed} Games Completed`,
      speechText: `Total Games Played is simply the count of all completed game sessions. For ${patient.name}, total games played is ${totalGamesPlayed}.`,
    },
    domainBreakdown: {
      title: 'Domain Breakdown',
      icon: <Brain className="w-5 h-5 text-indigo-700" />,
      color: 'bg-indigo-50 border-indigo-300 text-indigo-900',
      badgeColor: 'bg-indigo-600',
      formulaBox: 'Domain Score = ( Sum of Category Scores ÷ Category Games )',
      meaning: 'Calculates the average score for each specific skill (Memory, Face Recognition, Audio).',
      liveCalculation: `Average score calculated for each skill area`,
      liveResult: `Active Multi-Skill Profile`,
      speechText: `Domain Breakdown formula is: Sum of category scores divided by the number of games in that category.`,
    }
  };

  const current = simpleFormulas[selectedKey];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Simple Header */}
        <div className="bg-[#003366] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                How It Is Calculated (Formulas)
              </h3>
              <p className="text-xs text-slate-300">
                Simple formulas for <strong>{patient.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {(Object.keys(simpleFormulas) as FormulaKey[]).map((key) => {
            const item = simpleFormulas[key];
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  stopSpeech();
                  setIsSpeaking(false);
                  setSelectedKey(key);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#003366] shadow-xs border border-slate-300 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Simple Content Card */}
        <div className="p-5 sm:p-6 space-y-4 bg-[#FAFBFD]">
          
          {/* Active Card Title & Speech */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl border ${current.color}`}>
                {current.icon}
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                {current.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => handleSpeak(current.speechText)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                isSpeaking
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#003366]" />}
              <span>{isSpeaking ? 'Stop' : '🔊 Listen'}</span>
            </button>
          </div>

          {/* Simple Formula Highlight Box */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border-2 border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Formula:
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-emerald-300 bg-slate-950 p-3 rounded-xl border border-slate-700 text-center">
              {current.formulaBox}
            </div>
          </div>

          {/* Meaning / Plain Explanation */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">Explanation:</span>
            <p className="leading-relaxed text-slate-600">{current.meaning}</p>
          </div>

          {/* Live Calculation for Selected Patient */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-emerald-900 font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live result for {patient.name}:</span>
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-300 flex items-center justify-between font-mono font-bold">
              <span className="text-slate-600 text-xs">{current.liveCalculation}</span>
              <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                = {current.liveResult}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-[#003366] text-white font-bold text-xs hover:bg-[#002244] transition-all cursor-pointer shadow-xs"
          >
            Got it!
          </button>
        </div>

      </div>
    </div>
  );
};
