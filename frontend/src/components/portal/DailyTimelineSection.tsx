import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Pill,
  Droplet,
  BrainCircuit,
  Heart,
  Utensils,
  Coffee,
  Gamepad2,
  Sparkles,
  Trophy,
  PartyPopper,
  X,
  Volume2,
  Check,
  Bell,
  AlertCircle,
  Plus
} from 'lucide-react';
import { speakText, playAcousticChime } from '../../utils/speech';

interface TimelineItem {
  id: string;
  time: string;
  title: Record<string, string> | string;
  category: 'medicine' | 'food' | 'drink' | 'game' | 'walk';
  notes: Record<string, string> | string;
  appreciation: Record<string, string> | string;
  icon?: string | React.ReactNode;
  badgeBg?: string;
  isCompleted: boolean;
  completedAt?: string;
}

const DEFAULT_SCHEDULE: TimelineItem[] = [
  {
    id: 'item-1',
    time: '07:00 AM',
    title: 'Morning Ginger & Tulsi Tea (Warm Drink)',
    category: 'drink',
    notes: 'Warm herbal tea on the veranda to awaken senses and hydrate.',
    appreciation: 'Wonderful! A warm morning drink refreshes your body and awakens your senses. You are starting the day so well!',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    isCompleted: false,
  },
  {
    id: 'item-2',
    time: '08:00 AM',
    title: 'Morning Blood Pressure & Memory Medicine',
    category: 'medicine',
    notes: 'Prescribed medication with fresh water after waking up.',
    appreciation: 'Fantastic! Taking your morning medication on time protects your health and memory. We are so proud of you!',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    isCompleted: false,
  },
  {
    id: 'item-3',
    time: '08:45 AM',
    title: 'Nutritious Breakfast (Idli / Poha / Warm Porridge)',
    category: 'food',
    notes: 'Fresh, easily digestible breakfast with seasonal fruits.',
    appreciation: 'Superb! A nourishing breakfast gives you sustained energy and vitality for a joyful day ahead.',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    isCompleted: false,
  },
  {
    id: 'item-4',
    time: '10:30 AM',
    title: 'Daily Brain & Face Recognition Game Play',
    category: 'game',
    notes: '10-minute visual recognition & memory game session.',
    appreciation: 'Champion Performance! 🏆 Playing brain exercises sharpens mental acuity and sparks joyful memory recall!',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    isCompleted: false,
  },
  {
    id: 'item-5',
    time: '11:45 AM',
    title: 'Fresh Coconut Water & Hydration Check',
    category: 'drink',
    notes: '1 glass of fresh water or lemonade to stay hydrated.',
    appreciation: 'Excellent! Regular hydration keeps your brain energized, prevents tiredness, and keeps you feeling light and fresh.',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    isCompleted: false,
  },
  {
    id: 'item-6',
    time: '01:15 PM',
    title: 'Warm Lunch Meal (Khichdi & Steamed Veggies)',
    category: 'food',
    notes: 'Comforting afternoon meal followed by a calm relaxation break.',
    appreciation: 'Great job! A wholesome lunch restores your physical strength. Now enjoy a peaceful and restful afternoon!',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    isCompleted: false,
  },
  {
    id: 'item-7',
    time: '04:30 PM',
    title: 'Afternoon Nature Sound Quiz & Music Game',
    category: 'game',
    notes: 'Listen to soothing temple bells, bird songs, and rain.',
    appreciation: 'Bravo! Listening to soothing nature sounds calms the nervous system and boosts auditory memory connections!',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    isCompleted: false,
  },
  {
    id: 'item-8',
    time: '08:30 PM',
    title: 'Night Medicine & Bedtime Golden Milk',
    category: 'medicine',
    notes: 'Bedtime medicine with warm golden turmeric milk for peaceful sleep.',
    appreciation: 'Goodnight and sweet dreams! 🌙 You took such wonderful care of yourself today. Sleep peacefully and wake up refreshed!',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    isCompleted: false,
  },
];

const formatCurrentTime12 = (date: Date = new Date()): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
};

const getItemText = (field: Record<string, string> | string | undefined, defaultText = ''): string => {
  if (!field) return defaultText;
  if (typeof field === 'string') return field;
  return field.en || field.hi || Object.values(field)[0] || defaultText;
};

export const DailyTimelineSection: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<TimelineItem[]>(() => {
    try {
      const saved = localStorage.getItem('smriti_daily_timetable');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved timetable in timeline', e);
    }
    return DEFAULT_SCHEDULE;
  });

  const [activeAppreciation, setActiveAppreciation] = useState<TimelineItem | null>(null);
  const [timeOccurAlarmItem, setTimeOccurAlarmItem] = useState<TimelineItem | null>(null);
  const [lastNotifiedMinute, setLastNotifiedMinute] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() => formatCurrentTime12());

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smriti_daily_timetable', JSON.stringify(scheduleItems));
    } catch (e) {
      console.warn('Failed to save timetable', e);
    }
  }, [scheduleItems]);

  // Real-time alarm checking loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nowFormatted = formatCurrentTime12(now);
      setCurrentTimeStr(nowFormatted);

      const minuteKey = `${now.getHours()}:${now.getMinutes()}`;
      if (minuteKey === lastNotifiedMinute) return;

      for (const item of scheduleItems) {
        if (item.isCompleted) continue;
        if (item.time.trim().toUpperCase() === nowFormatted.toUpperCase()) {
          setLastNotifiedMinute(minuteKey);
          triggerAlarmPopup(item);
          break;
        }
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [scheduleItems, lastNotifiedMinute]);

  const triggerAlarmPopup = (item: TimelineItem) => {
    setTimeOccurAlarmItem(item);
    playAcousticChime(659.25, 0.3);
    setTimeout(() => playAcousticChime(880, 0.35), 200);
    const title = getItemText(item.title);
    speakText(`Attention! It is now ${item.time}. It is time for: ${title}.`, 'en');
  };

  const handleToggleDone = (item: TimelineItem) => {
    const isNowDone = !item.isCompleted;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setScheduleItems((prev) =>
      prev.map((t) =>
        t.id === item.id
          ? {
              ...t,
              isCompleted: isNowDone,
              completedAt: isNowDone ? nowTime : undefined,
            }
          : t
      )
    );

    if (timeOccurAlarmItem?.id === item.id) {
      setTimeOccurAlarmItem(null);
    }

    if (isNowDone) {
      playAcousticChime(587.33, 0.25);
      setTimeout(() => playAcousticChime(880, 0.3), 150);
      setActiveAppreciation(item);
      speakText(getItemText(item.appreciation), 'en');
    }
  };

  const doneCount = scheduleItems.filter((i) => i.isCompleted).length;
  const progressPercent = scheduleItems.length > 0 ? Math.round((doneCount / scheduleItems.length) * 100) : 0;

  const renderIcon = (cat: string) => {
    switch (cat) {
      case 'game':
        return <Gamepad2 className="w-5 h-5 text-blue-600" />;
      case 'medicine':
        return <Pill className="w-5 h-5 text-rose-600" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'drink':
        return <Coffee className="w-5 h-5 text-emerald-600" />;
      default:
        return <Clock className="w-5 h-5 text-forest-800" />;
    }
  };

  return (
    <section className="py-14 md:py-20 bg-cream border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800 inline-flex items-center gap-1.5 bg-forest-50 px-3.5 py-1 rounded-full border border-forest-200 shadow-xs">
            <Clock className="w-4 h-4 text-forest-800" /> Daily Care & Routine Time Table
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-charcoal">
            Daily Time Table: Games, Medicine, Meals & Drinks
          </h2>
          <p className="text-charcoal-muted text-sm md:text-base leading-relaxed">
            Click on each daily routine item when completed to record your task and receive a personalized appreciation message.
          </p>
          
          {/* Progress Strip, Live Clock & Top Edit Button */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <div className="inline-flex items-center gap-2 bg-forest-900 text-amber-300 px-4 py-1.5 rounded-full border border-forest-700 shadow-xs text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" /> Live: {currentTimeStr}
            </div>

            <div className="inline-flex items-center gap-3 bg-white px-5 py-1.5 rounded-full border border-ivory-300 shadow-xs">
              <span className="text-xs font-bold text-forest-900">
                Progress: <strong>{doneCount} / {scheduleItems.length} Tasks ({progressPercent}%)</strong>
              </span>
              <div className="w-20 h-2 bg-ivory-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Vertical Timeline Container */}
        <div className="max-w-3xl mx-auto space-y-4 relative before:absolute before:inset-0 before:left-8 md:before:left-32 before:w-0.5 before:bg-cream-border">
          {scheduleItems.map((item) => {
            const title = getItemText(item.title);
            const notes = getItemText(item.notes);

            return (
              <div key={item.id} className="relative flex flex-col md:flex-row items-start gap-4 md:gap-8 group">
                
                {/* Time Label Column */}
                <div className="w-28 text-left md:text-right shrink-0 pt-2">
                  <span className="font-mono font-bold text-sm md:text-base text-forest-800 bg-white/80 px-2 py-0.5 rounded-md border border-ivory-200">
                    {item.time}
                  </span>
                </div>

                {/* Timeline Point Badge */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-xs border-2 transition-all ${
                    item.isCompleted ? 'bg-emerald-600 border-white text-white' : 'bg-white border-forest-800'
                  }`}
                >
                  {item.isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : renderIcon(item.category)}
                </div>

                {/* Schedule Item Content Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex-1 space-y-3 flex flex-col justify-between ${
                    item.isCompleted
                      ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
                      : 'bg-white border-cream-border shadow-xs hover:border-forest-400'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3
                        className={`font-serif font-bold text-base md:text-lg text-charcoal ${
                          item.isCompleted ? 'line-through text-charcoal-500' : ''
                        }`}
                      >
                        {title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${item.badgeBg || 'bg-ivory-100 text-charcoal-700'}`}>
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed font-medium">
                      {notes}
                    </p>
                  </div>

                  {/* Clickable Completion & Test Alert */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ivory-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-charcoal-500">
                        {item.isCompleted ? `✓ Done at ${item.completedAt}` : 'Pending'}
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerAlarmPopup(item)}
                        className="text-[10px] font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300 inline-flex items-center gap-1 cursor-pointer"
                        title="Test scheduled time alarm popup"
                      >
                        <Bell className="w-3 h-3" /> Test Alert
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDone(item)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        item.isCompleted
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-500 hover:to-forest-600 text-white hover:scale-105 shadow-soft'
                      }`}
                    >
                      {item.isCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>🎉 Done & Appreciated!</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>✓ Click When Done</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* ⏰ TIME OCCURRED REAL-TIME ALARM POP-UP */}
      {timeOccurAlarmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border-4 border-amber-400 shadow-[0_20px_70px_rgba(245,158,11,0.5)] space-y-6 text-center relative overflow-hidden animate-scaleUp">
            <button
              type="button"
              onClick={() => setTimeOccurAlarmItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-charcoal-600 hover:bg-ivory-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg border-4 border-white mx-auto animate-bounce">
              <Bell className="w-10 h-10 text-slate-950 fill-slate-950" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-amber-950 bg-amber-300 px-4 py-1 rounded-full border border-amber-400">
                ⏰ Scheduled Time Reminder Alert
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-black text-charcoal-900 mt-2">
                Time For: {getItemText(timeOccurAlarmItem.title)}!
              </h3>
              <p className="text-xs font-bold text-charcoal-500">
                Scheduled at {timeOccurAlarmItem.time}
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 text-left">
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Instructions:
              </p>
              <p className="font-serif font-bold text-sm text-amber-950 mt-1">
                {getItemText(timeOccurAlarmItem.notes)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleToggleDone(timeOccurAlarmItem)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-forest-700 text-white font-extrabold text-sm shadow-soft cursor-pointer hover:scale-105"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Mark as Done & Get Praise 🎉</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 POP-UP APPRECIATION MODAL */}
      {activeAppreciation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border-4 border-amber-300 shadow-2xl space-y-5 text-center relative overflow-hidden animate-scaleUp">
            
            <button
              type="button"
              onClick={() => setActiveAppreciation(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-charcoal-600 hover:bg-ivory-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)] border-4 border-white mx-auto animate-bounce">
              <Trophy className="w-10 h-10 text-slate-950 fill-slate-950" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                ✓ Task Completed Successfully!
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-black text-charcoal-900 mt-2">
                Wonderful Work! 🌟
              </h3>
              <p className="text-xs font-bold text-charcoal-500">
                {activeAppreciation.time} • {getItemText(activeAppreciation.title)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-5 rounded-2xl border-2 border-amber-200 space-y-2">
              <p className="font-serif font-bold text-sm md:text-base text-amber-950 leading-relaxed">
                "{getItemText(activeAppreciation.appreciation)}"
              </p>
              <p className="text-[11px] font-semibold text-amber-800">
                ❤️ Your family & caregivers are so proud of your healthy routine!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => speakText(getItemText(activeAppreciation.appreciation), 'en')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-800" />
                <span>Listen Appreciation Again 🔊</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAppreciation(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-700 hover:to-forest-800 text-white font-extrabold text-xs shadow-soft hover:scale-105 transition-all cursor-pointer"
              >
                <span>Thank You! Keep Going 🌟</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

