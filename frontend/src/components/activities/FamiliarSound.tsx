import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Music,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Mic,
  MicOff,
  Sparkles,
  Heart,
  HelpCircle,
  Play,
  Square,
  RotateCcw,
  Plus,
  AlertCircle,
  X,
  Smile,
  Users,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { speakText } from '../../utils/speech';
import { gameApi } from '../../services/api';
import { GameQuestion } from '../../types';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from 'react-i18next';

interface FamiliarSoundProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

export interface SoundQuestionItem {
  id: string;
  category: 'loved_ones' | 'regional';
  title: string;
  speakerName?: string;
  speakerRelation?: string;
  audioText?: string;
  audioUrl?: string;
  audioBlob?: string; // Base64 or object URL
  options: string[];
  correctOption: number;
  hint: string;
  explanation?: string;
  isCustom?: boolean;
}

const DEFAULT_REGIONAL_PROMPTS: SoundQuestionItem[] = [
  {
    id: 'sq-1',
    category: 'regional',
    title: 'Sound Challenge #1: Listen to the acoustic rain sound and choose the matching ambiance.',
    audioText: 'Pitter patter rainfall sound over lush green bamboo groves in Assam',
    options: ['Lush Rain on Bamboo Leaves', 'Train Horn', 'Busy City Traffic', 'Dog Barking'],
    correctOption: 0,
    hint: 'Think of monsoon raindrops gently tapping on broad bamboo leaves outside the courtyard.',
    explanation: 'Rainfall over bamboo groves is a calming, familiar regional acoustic sound.',
  },
  {
    id: 'sq-2',
    category: 'regional',
    title: 'Sound Challenge #2: Listen to this traditional melodic horn and identify the folk instrument.',
    audioText: 'Melodious festive Pepa horn melody played during Rongali Bihu celebrations in Assam',
    options: ['Assamese Pepa Horn', 'Classical Violin', 'Electric Guitar', 'Grand Piano'],
    correctOption: 0,
    hint: 'This folk instrument is crafted from buffalo horn and played during lively Bihu dances.',
    explanation: 'The Pepa is an indigenous hornpipe made from buffalo horn, played in Bihu celebrations.',
  },
  {
    id: 'sq-3',
    category: 'regional',
    title: 'Sound Challenge #3: Listen to the evening spiritual sounds echoing from the Nilachal hill.',
    audioText: 'Resonating deep brass temple bells and evening Shankha conch shell blown at Kamakhya Temple in Guwahati',
    options: ['Kamakhya Temple Brass Bells & Conch', 'Clock Tower Alarm', 'Automobile Horns', 'Airport Loudspeaker'],
    correctOption: 0,
    hint: 'Sacred evening bells and conch shell echoes heard during temple prayer time.',
    explanation: 'Temple bells and conch shells provide calming, familiar auditory orientation for seniors.',
  },
  {
    id: 'sq-4',
    category: 'regional',
    title: 'Sound Challenge #4: Listen to the morning birds welcoming the sunrise over the valley.',
    audioText: 'Sweet chirping of morning sparrows, mynas, and cuckoos singing over the misty green tea garden bushes',
    options: ['Misty Tea Garden Birdsong', 'Steam Train Engine', 'Construction Hammer', 'Thunderstorm Rumble'],
    correctOption: 0,
    hint: 'Sweet feathered friends greeting the early morning sun over fresh tea bushes.',
    explanation: 'Morning birdsong stimulates auditory orientation and helps patients start their morning routine.',
  },
  {
    id: 'sq-5',
    category: 'regional',
    title: 'Sound Challenge #5: Listen to the energetic rhythm of this festive two-headed folk drum.',
    audioText: 'Vibrant rhythmic beating of the traditional Assamese Dhol drum accompanied by Kanshi bell cymbals',
    options: ['Traditional Bihu Dhol Drum', 'Rock Drumkit', 'Police Siren', 'Telephone Ringing'],
    correctOption: 0,
    hint: 'The double-sided wooden drum that makes everyone want to dance during spring celebrations.',
    explanation: 'The Bihu Dhol produces an unmistakable lively rhythm that sparks fond memories of community festivals.',
  },
];

const DEFAULT_LOVED_ONES_PROMPTS: SoundQuestionItem[] = [
  {
    id: 'lo-1',
    category: 'loved_ones',
    title: "Loved One's Voice #1: Listen carefully to this loving morning message.",
    speakerName: 'Ananya',
    speakerRelation: 'Granddaughter',
    audioText: 'Deuta! Good morning! Remember how we made sweet coconut pitha together last Bihu? I love you so much and cannot wait to visit you this Sunday!',
    options: ['Ananya (Granddaughter)', 'Priya (Daughter)', 'Meera (Sister)', 'Sunita (Neighbor)'],
    correctOption: 0,
    hint: 'Your beloved 10-year-old granddaughter who loves making sesame and coconut pitha with you.',
    explanation: 'Ananya always loves spending Bihu holidays with you in the kitchen.',
  },
  {
    id: 'lo-2',
    category: 'loved_ones',
    title: "Loved One's Voice #2: Listen to this caring check-in call.",
    speakerName: 'Rahul',
    speakerRelation: 'Eldest Son',
    audioText: 'Deuta, good morning! I am calling from my office in Guwahati. Have you had your morning ginger tea and your gentle courtyard walk?',
    options: ['Rahul (Eldest Son)', 'Bikash (Nephew)', 'Dr. Barua (Family Physician)', 'Arun (Driver)'],
    correctOption: 0,
    hint: 'Your eldest son who works as an engineer in Guwahati and calls you every morning before tea.',
    explanation: 'Rahul calls daily without fail to ensure you are well and relaxed.',
  },
  {
    id: 'lo-3',
    category: 'loved_ones',
    title: "Loved One's Voice #3: Listen to this cherished nostalgic greeting.",
    speakerName: 'Pratima',
    speakerRelation: 'Wife',
    audioText: 'Ranjit, listen to the gentle rain outside our courtyard veranda. Come sit with me, I have prepared your favorite warm cardamom tea.',
    options: ['Pratima (Wife)', 'Aunt Bina', 'Nirmala (Sister-in-law)', 'Kavita (Cousin)'],
    correctOption: 0,
    hint: 'Your lifelong companion who always brewed your favorite afternoon cardamom ginger tea.',
    explanation: 'Pratima shared peaceful rain-watching moments on the veranda with you.',
  },
  {
    id: 'lo-4',
    category: 'loved_ones',
    title: "Loved One's Voice #4: Listen to this joyful, enthusiastic story.",
    speakerName: 'Kabir',
    speakerRelation: 'Grandson',
    audioText: 'Dadu! Guess what? I won first prize in the school art competition today with my watercolor painting of the Brahmaputra riverboat!',
    options: ['Kabir (Grandson)', 'Rohan (School Friend)', 'Aarav (Neighbor)', 'Dev (Nephew)'],
    correctOption: 0,
    hint: 'Your grandson who loves painting watercolor riverboats and showing you his artwork.',
    explanation: 'Kabir loves to sit on your lap and paint pictures of boats on the river.',
  },
];

const LOCAL_STORAGE_CUSTOM_SOUNDS = 'smriti_setu_custom_loved_ones_sounds';

export const FamiliarSound: React.FC<FamiliarSoundProps> = ({ onComplete, onBack }) => {
  const [activeTab, setActiveTab] = useState<'loved_ones' | 'regional'>('loved_ones');
  const [lovedOnesQuestions, setLovedOnesQuestions] = useState<SoundQuestionItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_SOUNDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...DEFAULT_LOVED_ONES_PROMPTS, ...parsed];
        }
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_LOVED_ONES_PROMPTS;
  });
  const [regionalQuestions, setRegionalQuestions] = useState<SoundQuestionItem[]>(DEFAULT_REGIONAL_PROMPTS);

  // Active quiz state
  const currentList = activeTab === 'loved_ones' ? lovedOnesQuestions : regionalQuestions;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctGreetingPopup, setCorrectGreetingPopup] = useState<boolean>(false);
  const [wrongWarningPopup, setWrongWarningPopup] = useState<boolean>(false);
  const [wrongMessage, setWrongMessage] = useState<string>('');
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  // Upload & Record Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadRelation, setUploadRelation] = useState('');
  const [uploadAudioText, setUploadAudioText] = useState('');
  const [uploadHint, setUploadHint] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctChoiceIdx, setCorrectChoiceIdx] = useState(0);
  const [uploadedAudioData, setUploadedAudioData] = useState<string | null>(null);
  const [uploadedAudioFileName, setUploadedAudioFileName] = useState<string>('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // HTML Audio element for recorded / uploaded files
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load backend questions if available
  useEffect(() => {
    const loadRegionalFromBackend = async () => {
      try {
        const data = await gameApi.getQuestions('familiar_sound');
        if (Array.isArray(data) && data.length > 0) {
          const mapped: SoundQuestionItem[] = data.map((d, idx) => ({
            id: `backend-${idx}`,
            category: 'regional',
            title: d.question,
            audioText: d.audioText || d.question,
            options: d.options,
            correctOption: d.correctOption,
            hint: d.explanation || 'Listen carefully to the acoustic regional cadence.',
            explanation: d.explanation,
          }));
          setRegionalQuestions(mapped);
        }
      } catch (err) {
        console.warn('Using default regional questions', err);
      }
    };
    loadRegionalFromBackend();
  }, []);

  // Play gentle synthesizer chime
  const playTone = (freq: number, duration = 0.4, type: OscillatorType = 'sine', gainVal = 0.2) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration + 0.05);
    } catch {
      // Graceful fallback
    }
  };

  const playSuccessChime = () => {
    // Joyful melodic ascending chord: C5, E5, G5, C6
    const notes = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 120 },
      { freq: 783.99, delay: 240 },
      { freq: 1046.5, delay: 380 },
    ];
    notes.forEach((n) => setTimeout(() => playTone(n.freq, 0.5, 'sine', 0.16), n.delay));
  };

  const playGentleWarningChime = () => {
    // Soft two-tone calming chime
    playTone(280, 0.35, 'sine', 0.12);
    setTimeout(() => playTone(240, 0.4, 'sine', 0.1), 150);
  };

  const currentSound = currentList[currentIdx] || currentList[0];

  // Play current sound
  const handlePlayCurrentAudio = () => {
    if (isPlayingAudio) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    if (currentSound.audioBlob || currentSound.audioUrl) {
      // Play custom audio recording / file
      const src = currentSound.audioBlob || currentSound.audioUrl;
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }
      audioElementRef.current.src = src!;
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
      audioElementRef.current.onerror = () => {
        setIsPlayingAudio(false);
        if (currentSound.audioText) speakText(currentSound.audioText, 'en');
      };
      audioElementRef.current.play().catch(() => {
        setIsPlayingAudio(false);
        if (currentSound.audioText) speakText(currentSound.audioText, 'en');
      });
    } else if (currentSound.audioText) {
      // Use speech synthesis with realistic cadence
      speakText(currentSound.audioText, 'en');
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 4000);
    }
  };

  // Paddle Option Selection
  const handleSelectOption = (idx: number) => {
    if (selectedOpt !== null || correctGreetingPopup || wrongWarningPopup) return;

    setSelectedOpt(idx);
    setTotalAttempts((prev) => prev + 1);

    const isCorrect = idx === currentSound.correctOption;

    if (isCorrect) {
      // Correct guess: Kindhearted greetings & sound
      playSuccessChime();
      setScore((prev) => prev + 1);
      setCorrectGreetingPopup(true);

      setTimeout(() => {
        setCorrectGreetingPopup(false);
        setShowHint(false);
        setSelectedOpt(null);

        if (currentIdx + 1 < currentList.length) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          const elapsed = Date.now() - startTime;
          const finalScore = score + 1;
          const accuracy = Math.round((finalScore / currentList.length) * 100);
          setIsFinished(true);
          onComplete(accuracy, totalAttempts + 1, elapsed);
        }
      }, 2200);
    } else {
      // Wrong guess: Gentle warning popup
      playGentleWarningChime();
      setWrongWarningPopup(true);
      setWrongMessage(
        activeTab === 'loved_ones'
          ? "Gentle reminder: That was a different loved one. Take your time, take a deep breath, and tap 'Show Gentle Hint' below or listen again! 🌸"
          : "Gentle reminder: That wasn't quite right. Take a breath, listen to the regional sound again, and try another paddle! 🌸"
      );

      setTimeout(() => {
        setWrongWarningPopup(false);
        setSelectedOpt(null);
      }, 2000);
    }
  };

  // Handle Audio File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedAudioData(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Direct Microphone Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedAudioData(reader.result as string);
          setUploadedAudioFileName(`Voice_Recording_${new Date().toLocaleTimeString()}.webm`);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is required to record voice. Please allow microphone permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  // Save new Loved One Sound Question
  const handleSaveCustomLovedOneSound = () => {
    if (!uploadName.trim()) {
      alert("Please enter your loved one's name.");
      return;
    }

    const o1 = opt1.trim() || `${uploadName} (${uploadRelation || 'Family'})`;
    const o2 = opt2.trim() || 'Priya (Daughter)';
    const o3 = opt3.trim() || 'Rahul (Son)';
    const o4 = opt4.trim() || 'Ananya (Granddaughter)';

    const newQuestion: SoundQuestionItem = {
      id: `custom-lo-${Date.now()}`,
      category: 'loved_ones',
      title: `Loved One's Voice: Listen carefully to ${uploadName}'s voice.`,
      speakerName: uploadName,
      speakerRelation: uploadRelation || 'Loved One',
      audioText: uploadAudioText.trim() || `Voice message from ${uploadName}: Hello, we love you so much!`,
      audioBlob: uploadedAudioData || undefined,
      options: [o1, o2, o3, o4],
      correctOption: correctChoiceIdx,
      hint: uploadHint.trim() || `Think of ${uploadName}, your ${uploadRelation || 'loving family member'}.`,
      explanation: `That was ${uploadName}'s authentic voice recorded with love!`,
      isCustom: true,
    };

    const updated = [newQuestion, ...lovedOnesQuestions];
    setLovedOnesQuestions(updated);

    try {
      const customOnly = updated.filter((q) => q.isCustom);
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_SOUNDS, JSON.stringify(customOnly));
    } catch {
      // Storage error
    }

    // Reset Form
    setShowUploadModal(false);
    setUploadName('');
    setUploadRelation('');
    setUploadAudioText('');
    setUploadHint('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
    setUploadedAudioData(null);
    setUploadedAudioFileName('');
    setActiveTab('loved_ones');
    setCurrentIdx(0);
    setSelectedOpt(null);
    setShowHint(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-md">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl font-bold">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shadow-sm">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <span>Familiar Sound & Audio Quiz</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Listen to beloved voices and familiar regional sounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="rounded-2xl font-bold bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Upload Loved One's Voice
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200 gap-1.5">
        <button
          onClick={() => {
            setActiveTab('loved_ones');
            setCurrentIdx(0);
            setSelectedOpt(null);
            setShowHint(false);
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'loved_ones'
              ? 'bg-white text-rose-700 shadow-md border border-rose-100 scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'loved_ones' ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>❤️ Loved Ones & Family Voices</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
            {lovedOnesQuestions.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('regional');
            setCurrentIdx(0);
            setSelectedOpt(null);
            setShowHint(false);
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'regional'
              ? 'bg-white text-emerald-800 shadow-md border border-emerald-100 scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Music className="w-4 h-4 text-emerald-600" />
          <span>🌿 Regional & Nature Ambiance</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {regionalQuestions.length}
          </span>
        </button>
      </div>

      {/* Main Sound Quiz Card */}
      {!isFinished && currentSound && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
          
          {/* Top Progress & Category Pill */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 flex items-center gap-1.5">
                {currentSound.category === 'loved_ones' ? '❤️ Family Voice' : '🌿 Regional Sound'}
              </span>
              {currentSound.isCustom && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  Custom Uploaded ✨
                </span>
              )}
            </div>
            <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Sound {currentIdx + 1} of {currentList.length}
            </span>
          </div>

          {/* Audio Visualizer & Big Play Button */}
          <div className="text-center space-y-4 py-2">
            <div className="relative inline-block">
              {/* Outer Pulsing Glow */}
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
                  isPlayingAudio
                    ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-2xl shadow-rose-500/40 scale-105 animate-pulse'
                    : 'bg-gradient-to-tr from-rose-100 via-amber-50 to-rose-200 text-rose-700 shadow-lg'
                }`}
              >
                {isPlayingAudio ? (
                  <Volume2 className="w-14 h-14 animate-bounce" />
                ) : (
                  <Music className="w-14 h-14" />
                )}
              </div>

              {/* Sound Wave Animation Bars */}
              {isPlayingAudio && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[40, 70, 100, 60, 90, 45, 80, 50, 95, 65].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="max-w-xl mx-auto space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {currentSound.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Tap the button below to listen to the audio voice clip, then select who is speaking!
              </p>
            </div>

            {/* Listen Button */}
            <div className="pt-2">
              <button
                onClick={handlePlayCurrentAudio}
                className={`px-8 py-4 rounded-2xl font-black text-base shadow-xl flex items-center gap-3 mx-auto transition-all transform active:scale-95 cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-rose-500/30 hover:scale-105'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-5 h-5 fill-current" />
                    <span>Stop Audio Playing</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>
                      {selectedOpt !== null ? '🔁 Re-listen to Voice' : '▶️ Listen to Voice / Sound'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Glowing Neon Style Paddle Clickable Buttons (Red, Green, Blue, Yellow) */}
          <div className="space-y-3 pt-2 max-w-xl mx-auto">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
              Choose the Matching Person or Sound:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentSound.options.map((opt, i) => {
                const isSelected = selectedOpt === i;
                const isCorrect = i === currentSound.correctOption;

                // 4 Glowing Neon Color Themes: Red, Green, Blue, Yellow
                const NEON_THEMES = [
                  {
                    name: 'Ruby Red',
                    badge: '🔴 A',
                    gradient: 'from-rose-500 via-red-600 to-rose-700',
                    border: 'border-rose-400/80',
                    neonGlow: 'shadow-[0_0_24px_rgba(244,63,94,0.55)] hover:shadow-[0_0_36px_rgba(244,63,94,0.95)] ring-2 ring-rose-400/50',
                    badgeBg: 'bg-rose-950/40 border border-rose-300 text-white shadow-[0_0_10px_rgba(244,63,94,0.8)]',
                  },
                  {
                    name: 'Emerald Green',
                    badge: '🟢 B',
                    gradient: 'from-emerald-500 via-green-600 to-teal-700',
                    border: 'border-emerald-400/80',
                    neonGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.55)] hover:shadow-[0_0_36px_rgba(16,185,129,0.95)] ring-2 ring-emerald-400/50',
                    badgeBg: 'bg-emerald-950/40 border border-emerald-300 text-white shadow-[0_0_10px_rgba(16,185,129,0.8)]',
                  },
                  {
                    name: 'Brahmaputra Blue',
                    badge: '🔵 C',
                    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
                    border: 'border-sky-400/80',
                    neonGlow: 'shadow-[0_0_24px_rgba(14,165,233,0.55)] hover:shadow-[0_0_36px_rgba(14,165,233,0.95)] ring-2 ring-sky-400/50',
                    badgeBg: 'bg-blue-950/40 border border-cyan-300 text-white shadow-[0_0_10px_rgba(14,165,233,0.8)]',
                  },
                  {
                    name: 'Assam Gold / Yellow',
                    badge: '🟡 D',
                    gradient: 'from-amber-400 via-amber-500 to-yellow-500',
                    border: 'border-amber-300/80',
                    neonGlow: 'shadow-[0_0_24px_rgba(245,158,11,0.55)] hover:shadow-[0_0_36px_rgba(245,158,11,0.95)] ring-2 ring-amber-300/50',
                    badgeBg: 'bg-amber-950/40 border border-yellow-200 text-white shadow-[0_0_10px_rgba(245,158,11,0.8)]',
                  },
                ];

                const theme = NEON_THEMES[i % NEON_THEMES.length];

                let dynamicClasses = `bg-gradient-to-br ${theme.gradient} ${theme.border} ${theme.neonGlow} text-white hover:scale-[1.03] hover:brightness-110`;

                if (selectedOpt !== null) {
                  if (isCorrect) {
                    dynamicClasses =
                      'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 border-4 border-white text-white font-black shadow-[0_0_40px_rgba(16,185,129,1)] scale-[1.05] z-10 brightness-125';
                  } else if (isSelected) {
                    dynamicClasses =
                      'bg-gradient-to-r from-rose-600 via-red-700 to-rose-800 border-4 border-rose-300 text-white font-black shadow-[0_0_35px_rgba(244,63,94,0.9)] animate-shake';
                  } else {
                    dynamicClasses = 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-40 grayscale';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={selectedOpt !== null}
                    className={`relative w-full p-4 sm:p-5 rounded-3xl text-left font-black text-base sm:text-lg transition-all duration-200 select-none cursor-pointer flex items-center gap-3.5 border-3 active:scale-95 ${dynamicClasses}`}
                  >
                    {/* Glowing Paddle Badge */}
                    <span
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 transition-transform ${
                        selectedOpt !== null && isCorrect
                          ? 'bg-white text-emerald-800 scale-110'
                          : theme.badgeBg
                      }`}
                    >
                      {theme.badge}
                    </span>

                    {/* Option Text */}
                    <span className="flex-1 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {opt}
                    </span>

                    {/* Status Check Icon */}
                    {selectedOpt !== null && isCorrect && (
                      <CheckCircle2 className="w-7 h-7 text-white shrink-0 filter drop-shadow-md animate-scaleIn" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gentle Hint Button & Expandable Hint Card */}
          <div className="pt-2 text-center space-y-3 max-w-lg mx-auto">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs sm:text-sm font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>💡 Show Gentle Hint</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm font-bold shadow-md animate-fadeIn flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-amber-900">Gentle Clue:</p>
                  <p className="text-amber-800/90 font-medium mt-0.5">{currentSound.hint}</p>
                </div>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-amber-700 hover:text-amber-900 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Gentle Greetings Celebration Modal on Correct Answer */}
          {correctGreetingPopup && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-scaleIn space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                Heartwarming! You recognized them! 🌸✨
              </h4>
              <p className="text-slate-600 font-semibold text-sm sm:text-base max-w-md">
                {currentSound.explanation ||
                  `Wonderful memory recall! You recognized ${currentSound.speakerName || 'the sound'} right away.`}
              </p>
              <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                Progress: Sound {currentIdx + 1} of {currentList.length} Complete
              </span>
            </div>
          )}

          {/* Gentle Warning Popup on Wrong Guess */}
          {wrongWarningPopup && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-center font-bold text-xs sm:text-sm animate-bounce flex items-center justify-center gap-2 shadow-lg">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{wrongMessage}</span>
            </div>
          )}

        </div>
      )}

      {/* Completion Summary Card */}
      {isFinished && (
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-300 text-center space-y-6 p-8 sm:p-10 rounded-3xl shadow-2xl animate-scaleIn">
          <div className="w-20 h-20 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-500/30 animate-bounce">
            <Heart className="w-10 h-10 fill-current" />
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              Wonderful Listening, Ranjit ji! 🌸
            </h3>
            <p className="text-slate-700 font-semibold text-base sm:text-lg max-w-md mx-auto mt-2">
              You recognized {score} out of {currentList.length} audio voice memories with great warmth and clarity.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentIdx(0);
                setSelectedOpt(null);
                setScore(0);
                setShowHint(false);
              }}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Listen Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition-all shadow-sm"
            >
              Return to Activities
            </button>
          </div>
        </div>
      )}

      {/* Upload Loved One Voice Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleIn my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">Upload Loved One's Voice</h4>
                  <p className="text-xs text-slate-500">Add an audio clip or record a family message</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* Name & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Loved One's Name *
                  </label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. Ananya, Rahul"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={uploadRelation}
                    onChange={(e) => setUploadRelation(e.target.value)}
                    placeholder="e.g. Granddaughter, Son"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Audio Input: File Upload or Mic Recording */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-slate-800">
                  Audio Source (File or Microphone)
                </label>

                <div className="flex flex-wrap gap-2">
                  {/* File Upload Button */}
                  <label className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{uploadedAudioFileName ? 'Change Audio File' : 'Upload MP3 / Audio'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Mic Recording Button */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30'
                        : 'bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>Stop Recording ({recordingSeconds}s)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-rose-600" />
                        <span>Record Voice Note</span>
                      </>
                    )}
                  </button>
                </div>

                {uploadedAudioFileName && (
                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Audio Attached: {uploadedAudioFileName}
                  </p>
                )}
              </div>

              {/* Spoken Text / Label */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  What did they say? (Speech synthesis backup)
                </label>
                <textarea
                  rows={2}
                  value={uploadAudioText}
                  onChange={(e) => setUploadAudioText(e.target.value)}
                  placeholder="e.g. Good morning Grandpa! I love you so much and made sweet pitha today!"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* 4 Paddle MCQ Choices */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700">
                  4 Paddle MCQ Choices (Click radio to set correct answer)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: opt1, setVal: setOpt1, idx: 0, defaultTxt: uploadName ? `${uploadName} (${uploadRelation || 'Family'})` : 'Loved One 1' },
                    { val: opt2, setVal: setOpt2, idx: 1, defaultTxt: 'Priya (Daughter)' },
                    { val: opt3, setVal: setOpt3, idx: 2, defaultTxt: 'Rahul (Son)' },
                    { val: opt4, setVal: setOpt4, idx: 3, defaultTxt: 'Ananya (Granddaughter)' },
                  ].map((field) => (
                    <div
                      key={field.idx}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        correctChoiceIdx === field.idx
                          ? 'border-emerald-500 bg-emerald-50/70'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctChoice"
                        checked={correctChoiceIdx === field.idx}
                        onChange={() => setCorrectChoiceIdx(field.idx)}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={field.val}
                        onChange={(e) => field.setVal(e.target.value)}
                        placeholder={field.defaultTxt}
                        className="w-full bg-transparent font-medium text-xs focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gentle Hint */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Gentle Memory Hint
                </label>
                <input
                  type="text"
                  value={uploadHint}
                  onChange={(e) => setUploadHint(e.target.value)}
                  placeholder="e.g. Your favorite grandchild who loves painting riverboats"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(false)}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCustomLovedOneSound}
                className="rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
              >
                Save & Add to Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamiliarSound;
