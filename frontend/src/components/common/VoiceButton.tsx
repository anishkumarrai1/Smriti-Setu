import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speakText, stopSpeech } from '../../utils/speech';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface VoiceButtonProps {
  textToSpeak: string;
  label?: string;
  lang?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  textToSpeak,
  label = 'Listen',
  lang,
  size = 'md',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { currentLanguage } = useLanguageStore();
  const { elderlyMode } = useAccessibilityStore();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const targetLanguage = lang || currentLanguage || 'en';
      speakText(
        textToSpeak,
        targetLanguage,
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
      // Safety timeout in case browser does not fire onend
      setTimeout(() => setIsPlaying(false), Math.max(4000, textToSpeak.length * 100));
    }
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const buttonPadding = elderlyMode
    ? 'px-5 py-3.5 text-lg min-h-[52px]'
    : 'px-4 py-2 text-sm min-h-[42px]';

  return (
    <button
      onClick={handleSpeak}
      type="button"
      aria-label={`Voice assistance: ${label}`}
      className={`inline-flex items-center gap-2 font-medium rounded-full transition-all duration-300 shadow-xs focus:ring-4 focus:ring-forest-500/30 select-none ${
        isPlaying
          ? 'bg-forest-700 text-white animate-pulse ring-2 ring-forest-500'
          : 'bg-forest-100/80 hover:bg-forest-200/80 text-forest-900 border border-forest-300/50'
      } ${buttonPadding} ${className}`}
    >
      {isPlaying ? <VolumeX className={iconSizes} /> : <Volume2 className={iconSizes} />}
      <span>{isPlaying ? 'Speaking...' : label}</span>
    </button>
  );
};
