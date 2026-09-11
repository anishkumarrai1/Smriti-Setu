// Web Speech API Voice Assistance Service for SMRITI-SETU Elderly Care

export interface VoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  isDefault: boolean;
}

let preferredVoiceURI: string | null = localStorage.getItem('smriti_preferred_voice') || null;
let preferredRate: number = parseFloat(localStorage.getItem('smriti_speech_rate') || '0.9');

export const setPreferredVoice = (voiceURI: string | null) => {
  preferredVoiceURI = voiceURI;
  if (voiceURI) {
    localStorage.setItem('smriti_preferred_voice', voiceURI);
  } else {
    localStorage.removeItem('smriti_preferred_voice');
  }
};

export const getPreferredVoice = (): string | null => {
  return preferredVoiceURI;
};

export const setPreferredRate = (rate: number) => {
  preferredRate = rate;
  localStorage.setItem('smriti_speech_rate', String(rate));
};

export const getPreferredRate = (): number => {
  return preferredRate;
};

export const getAvailableVoices = (): VoiceOption[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.map((v) => ({
    voiceURI: v.voiceURI,
    name: v.name,
    lang: v.lang,
    isDefault: v.default,
  }));
};

// Play an acoustic chime tone via Web Audio API so user always hears immediate sound
export const playAcousticChime = (freq: number = 587.33, duration: number = 0.18) => {
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // ignore
  }
};

export const speakText = (text: string, lang: string = 'en', onEnd?: () => void, onError?: () => void) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser environment.');
    if (onError) onError();
    return;
  }

  // Acoustic chime feedback so hearing is immediately verified
  playAcousticChime(523.25, 0.12);

  // Unpause synthesis if browser suspended it
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
  } catch (e) {
    console.warn('Speech cancel notice:', e);
  }

  // Clean and prepare text for speech synthesis
  const cleanText = text.trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Map language codes to BCP 47 tags for speech synthesis
  const langMap: Record<string, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    as: 'as-IN',
    bn: 'bn-IN',
    ne: 'ne-NP',
    brx: 'hi-IN',
    mr: 'mr-IN',
  };

  const targetLang = langMap[lang] || lang || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = preferredRate; // Slightly slower, calm cadence for elderly comprehension
  utterance.pitch = 1.0;
  utterance.volume = 1.0; // Max volume for clear hearing

  let finished = false;
  utterance.onend = () => {
    if (!finished) {
      finished = true;
      if (onEnd) onEnd();
    }
  };

  utterance.onerror = (e) => {
    console.warn('Utterance error:', e);
    if (!finished) {
      finished = true;
      if (onError) onError();
    }
  };

  const selectVoiceAndSpeak = () => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let matchedVoice: SpeechSynthesisVoice | undefined;

        // 1. If preferred voice URI is set by user, prioritize it
        if (preferredVoiceURI) {
          matchedVoice = voices.find((v) => v.voiceURI === preferredVoiceURI);
        }

        // 2. Hindi & Regional Voice Matching
        if (!matchedVoice && (lang === 'hi' || targetLang === 'hi-IN' || /[\u0900-\u097F]/.test(cleanText))) {
          matchedVoice =
            voices.find((v) => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
            voices.find((v) => v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('hemant')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
            voices.find((v) => v.lang.toLowerCase().includes('in'));
        }

        // 3. Direct exact or prefix match
        if (!matchedVoice) {
          const prefix = targetLang.split('-')[0].toLowerCase();
          matchedVoice = voices.find(
            (v) => v.lang.toLowerCase().startsWith(prefix) || v.lang.toLowerCase() === targetLang.toLowerCase()
          );
        }

        // 4. Special Fallbacks for Indian Regional Languages
        if (!matchedVoice) {
          if (lang === 'as' || targetLang === 'as-IN') {
            matchedVoice =
              voices.find((v) => v.lang.toLowerCase().startsWith('as')) ||
              voices.find((v) => v.lang.toLowerCase().startsWith('bn')) ||
              voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
              voices.find((v) => v.lang.toLowerCase().includes('in'));
          } else if (lang === 'bn' || targetLang === 'bn-IN' || targetLang === 'bn-BD') {
            matchedVoice =
              voices.find((v) => v.lang.toLowerCase().startsWith('bn')) ||
              voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
              voices.find((v) => v.lang.toLowerCase().includes('in'));
          } else if (lang === 'ne' || targetLang === 'ne-NP' || targetLang === 'ne-IN') {
            matchedVoice =
              voices.find((v) => v.lang.toLowerCase().startsWith('ne')) ||
              voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
              voices.find((v) => v.lang.toLowerCase().includes('in'));
          } else if (lang === 'brx' || targetLang === 'brx-IN') {
            matchedVoice =
              voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
              voices.find((v) => v.lang.toLowerCase().startsWith('bn')) ||
              voices.find((v) => v.lang.toLowerCase().includes('in'));
          }
        }

        // 4. Global fallback voice (Default system voice)
        if (!matchedVoice) {
          matchedVoice = voices.find((v) => v.default) || voices[0];
        }

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      window.speechSynthesis.speak(utterance);

      // Keep synthesis alive on Chromium long utterances
      const resumeInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumeInterval);
        } else if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 5000);
    } catch (err) {
      console.warn('speakText error:', err);
      if (onError) onError();
    }
  };

  // Ensure voices are loaded (Chrome loads voices asynchronously)
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      selectVoiceAndSpeak();
    };
    setTimeout(selectVoiceAndSpeak, 100);
  } else {
    selectVoiceAndSpeak();
  }
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
