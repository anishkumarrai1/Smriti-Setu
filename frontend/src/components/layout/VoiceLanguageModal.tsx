import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Languages,
  X,
  Play,
  Check,
  Sparkles,
  Sliders,
  RotateCcw,
  Globe,
} from 'lucide-react';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import {
  speakText,
  stopSpeech,
  getAvailableVoices,
  setPreferredVoice,
  getPreferredVoice,
  setPreferredRate,
  getPreferredRate,
  VoiceOption,
} from '../../utils/speech';

interface VoiceLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceLanguageModal: React.FC<VoiceLanguageModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, availableLanguages, setLanguage } = useLanguageStore();
  const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(getPreferredVoice());
  const [speechRate, setSpeechRateState] = useState<number>(getPreferredRate());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const filteredLanguages = React.useMemo(() => {
    if (!selectedStateFilter || selectedStateFilter === 'All States') {
      return availableLanguages;
    }
    return availableLanguages.filter((l) => l.state === selectedStateFilter);
  }, [availableLanguages, selectedStateFilter]);

  useEffect(() => {
    const updateVoices = () => {
      const v = getAvailableVoices();
      setVoices(v);
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const currentLangObj =
    availableLanguages.find((l) => l.code === currentLanguage) || availableLanguages[0];

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    const targetLang = availableLanguages.find((l) => l.code === langCode);
    if (targetLang) {
      speakText(targetLang.sampleVoiceText, langCode);
    }
  };

  const handleVoiceChange = (uri: string) => {
    const val = uri === 'auto' ? null : uri;
    setSelectedVoiceURIState(val);
    setPreferredVoice(val);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRateState(rate);
    setPreferredRate(rate);
  };

  const handleTestSpeech = () => {
    setIsSpeaking(true);
    speakText(currentLangObj.sampleVoiceText, currentLanguage);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20 shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Voice & Multilingual Settings
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Choose interface language and AI voice speech assistance (NER Region)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* 1. Language Selection */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                1. Select Interface Language:
              </label>
              <span className="text-[#003366] font-bold text-xs bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 self-start sm:self-auto">
                Active: {currentLangObj.nativeLabel} ({currentLangObj.state})
              </span>
            </div>

            {/* State Filter Pills */}
            <div className="flex flex-wrap gap-1 pb-2 border-b border-slate-100">
              {['All States', 'Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'].map((st) => {
                const isSelected = (selectedStateFilter === st) || (st === 'All States' && !selectedStateFilter);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStateFilter(st === 'All States' ? null : st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#003366] text-white shadow-2xs font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {filteredLanguages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-2 rounded-lg border text-left transition-all relative cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50 border-[#003366] shadow-2xs ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{lang.nativeLabel}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#003366] shrink-0" />}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 truncate">{lang.label}</p>
                    <span className="inline-block text-[9px] font-bold text-[#003366] bg-blue-100/60 px-1.5 py-0.2 rounded mt-0.5">
                      {lang.state}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TTS Voice Selection */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>2. Text-to-Speech (TTS) Voice Synthesizer</span>
            </label>
            <select
              value={selectedVoiceURI || 'auto'}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs font-medium bg-slate-50 text-slate-900 cursor-pointer"
            >
              <option value="auto">
                Auto Match Best Regional Voice ({currentLangObj.label})
              </option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">
              Browser prioritizes installed Indian English, Hindi, and regional speech synthesizers.
            </p>
          </div>

          {/* 3. Speech Rate Cadence */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 uppercase">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>3. Voice Speed Cadence</span>
              </span>
              <span className="text-purple-700 font-bold">{Math.round(speechRate * 100)}% Speed</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRateChange(0.75)}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  speechRate === 0.75
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Gentle (0.75×)
              </button>
              <button
                type="button"
                onClick={() => handleRateChange(0.85)}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  speechRate === 0.85
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Calm Elderly (0.85×)
              </button>
              <button
                type="button"
                onClick={() => handleRateChange(1.0)}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  speechRate === 1.0
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Standard (1.0×)
              </button>
            </div>
          </div>

          {/* 4. Sample Voice Preview & Test Button */}
          <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-[10px] font-black text-purple-800 uppercase tracking-wider">Voice Sample Prompt</p>
              <p className="text-xs font-semibold text-slate-800 italic mt-0.5">
                "{currentLangObj.sampleVoiceText}"
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestSpeech}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSpeaking ? 'Speaking...' : 'Test Voice Audio'}</span>
            </button>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium truncate hidden sm:inline">
            Speech Synthesis Active
          </span>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceLanguageModal;
