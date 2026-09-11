import React from 'react';
import { Flame, Brain, Award, Zap, ChevronRight } from 'lucide-react';

interface CognitiveStreakWidgetProps {
  onOpenAppAuth?: () => void;
}

export const CognitiveStreakWidget: React.FC<CognitiveStreakWidgetProps> = ({ onOpenAppAuth }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-4 border border-sky-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      
      {/* Left Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-extrabold shadow-md shrink-0">
          <Brain className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-white">NER Daily Cognitive Pulse</h4>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
              AI Active
            </span>
          </div>
          <p className="text-xs text-sky-200 font-medium">
            Daily memory exercises keep neural pathways active & healthy.
          </p>
        </div>
      </div>

      {/* Right Stats */}
      <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-around sm:justify-end">
        <div className="text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Streak</span>
          <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm">
            <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
            <span>5 Days</span>
          </div>
        </div>

        <div className="text-center border-l border-slate-800 pl-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Retention Score</span>
          <div className="flex items-center gap-1 text-sky-400 font-extrabold text-sm">
            <Zap className="w-4 h-4" />
            <span>850 pts</span>
          </div>
        </div>

        {onOpenAppAuth && (
          <button
            onClick={onOpenAppAuth}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all shadow-md ml-2 shrink-0"
          >
            Track Progress <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
