import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Gamepad2,
  Bell,
  Heart,
  Globe,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Key,
  Settings,
  Bot,
} from 'lucide-react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { speakText, stopSpeech } from '../../utils/speech';
import { assistantApi } from '../../services/api';
import { ActivityType } from '../../types';

export type AiChatLanguage = 'hi' | 'en';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  spokenText?: string;
  timestamp: string;
  actionExecuted?: string;
  source?: string;
}

interface AiVoiceCompanionProps {
  onStartActivity?: (type: ActivityType) => void;
  onNavigateTab?: (tab: string) => void;
  onExitActivity?: () => void;
  onOpenPortal?: () => void;
  currentTab?: string;
}

export const AiVoiceCompanion: React.FC<AiVoiceCompanionProps> = ({
  onStartActivity,
  onNavigateTab,
  onExitActivity,
  onOpenPortal,
  currentTab = 'home',
}) => {
  const { elderlyMode, toggleElderlyMode } = useAccessibilityStore();
  const { selectedPatient } = useAuthStore();

  // ONLY 2 Languages in Smriti Setu AI: 'hi' (Hindi) or 'en' (English)
  const [chatLanguage, setChatLanguage] = useState<AiChatLanguage>(() => {
    const saved = localStorage.getItem('smriti_chat_language');
    return saved === 'en' ? 'en' : 'hi';
  });

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('smriti_gemini_api_key') || '');
  const [geminiStatus, setGeminiStatus] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Gemini status on mount
  useEffect(() => {
    assistantApi.getStatus().then(setGeminiStatus).catch(() => {});
  }, []);

  // Initial welcome message localized to only Hindi or English
  const getInitialMessage = (lang: AiChatLanguage): string => {
    if (lang === 'hi') {
      return `नमस्ते ${selectedPatient.name}! 🙏 मैं आपकी स्मृति-सेतु साथी हूँ। आप मुझसे कोई भी सवाल पूछ सकते हैं (जैसे: "सूरज क्या है?", "काजीरंगा के बारे में बताओ") या "गेम खोलो", "दवाई रिमाइंडर" कह सकते हैं!`;
    }
    return `Hello ${selectedPatient.name}! 🙏 I am your Smriti-Setu AI Companion. Ask me any question, converse freely, or say "Open game" or "Show reminders"!`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: getInitialMessage(chatLanguage),
      spokenText: getInitialMessage(chatLanguage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini',
    },
  ]);

  const getLocalizedSuggestions = (lang: AiChatLanguage) => {
    if (lang === 'hi') {
      return ['सूरज क्या है? ☀️', 'काजीरंगा की कहानी 🦏', 'खेल शुरू करो 🎮', 'दवाई रिमाइंडर ⏰', 'ताजमहल कहाँ है? 🕌'];
    }
    return ['What is the Sun? ☀️', 'About Kaziranga 🦏', 'Play Memory Game 🎮', 'Show Reminders ⏰', 'Tell me a story 📖'];
  };

  const [quickSuggestions, setQuickSuggestions] = useState<string[]>(() => getLocalizedSuggestions(chatLanguage));

  // Update initial welcome when chat language toggles between Hindi and English
  useEffect(() => {
    const welcome = getInitialMessage(chatLanguage);
    setQuickSuggestions(getLocalizedSuggestions(chatLanguage));
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [
          {
            id: 'init-1',
            sender: 'assistant',
            text: welcome,
            spokenText: welcome,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'gemini',
          },
        ];
      }
      return prev;
    });
  }, [chatLanguage, selectedPatient.name]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Initialize Speech Recognition for Hindi (hi-IN) or English (en-IN)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = chatLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to setup speech recognition', e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [chatLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      recognitionRef.current.lang = chatLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  const executeAction = (action: { type: string; payload?: string }) => {
    if (!action || action.type === 'NONE') return null;

    let alertDesc = '';

    switch (action.type) {
      case 'OPEN_ACTIVITY': {
        const actType = (action.payload as ActivityType) || 'memory_match';
        if (onStartActivity) {
          onStartActivity(actType);
          const nameMap: Record<string, string> = {
            memory_match: 'Visual Memory Match',
            picture_recognition: 'Family & Face Recognition',
            sequence_recall: 'Find Same Images',
            familiar_sound: 'Familiar Sound Quiz',
            photo_puzzle: 'Personalized Photo Puzzle',
            routine_recall: 'Daily Routine Quiz',
          };
          alertDesc = `🎮 Opening ${nameMap[actType] || actType}`;
          setTimeout(() => setIsOpen(false), 1400);
        }
        break;
      }
      case 'OPEN_TAB': {
        const tab = action.payload || 'home';
        if (onNavigateTab) {
          onNavigateTab(tab);
          const tabNames: Record<string, string> = {
            home: 'Patient Dashboard',
            reminders: 'Daily Reminders & Medicines',
            memories: 'Memory Garden',
            activities: 'All Cognitive Games',
          };
          alertDesc = `📂 Directing to ${tabNames[tab] || tab.toUpperCase()}`;
          setTimeout(() => setIsOpen(false), 1400);
        }
        break;
      }
      case 'TOGGLE_ELDERLY': {
        toggleElderlyMode();
        alertDesc = `👓 Elderly Accessibility Mode Toggled`;
        break;
      }
      case 'EXIT_ACTIVITY': {
        if (onExitActivity) {
          onExitActivity();
          alertDesc = `🔙 Returned to Patient Dashboard`;
          setTimeout(() => setIsOpen(false), 1400);
        }
        break;
      }
      case 'OPEN_PORTAL': {
        if (onOpenPortal) {
          onOpenPortal();
          alertDesc = `🏛️ Opening Public Government Health Portal`;
          setTimeout(() => setIsOpen(false), 1400);
        }
        break;
      }
    }

    if (alertDesc) {
      setActionAlert(alertDesc);
      setTimeout(() => setActionAlert(null), 5000);
    }

    return alertDesc;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    setInputText('');
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call Backend AI Assistant API
      const res = await assistantApi.chat({
        message: query,
        language: chatLanguage,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        currentTab,
        history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        apiKey: geminiApiKey || undefined,
      });

      const actionDesc = executeAction(res.action);

      if (res.quickSuggestions && res.quickSuggestions.length > 0) {
        setQuickSuggestions(res.quickSuggestions);
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        spokenText: res.spokenText || res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: actionDesc || undefined,
        source: res.source,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak response aloud in Hindi or English
      if (speechEnabled) {
        speakText(res.spokenText || res.reply, chatLanguage === 'hi' ? 'hi-IN' : 'en-IN');
      }
    } catch (err) {
      console.error('Assistant call error:', err);
      const fallbackReply = chatLanguage === 'hi'
        ? `मैंने आपकी बात सुन ली: "${query}". मैं आपकी हर समय सहायता और ज्ञान चर्चा के लिए यहाँ हूँ!`
        : `I received your question: "${query}". I am here with you to assist and converse anytime!`;

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: fallbackReply,
        spokenText: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'independent_knowledge_engine',
      };
      setMessages((prev) => [...prev, botMsg]);
      if (speechEnabled) speakText(fallbackReply, chatLanguage === 'hi' ? 'hi-IN' : 'en-IN');
    } finally {
      setLoading(false);
    }
  };

  const switchLanguage = (newLang: AiChatLanguage) => {
    setChatLanguage(newLang);
    localStorage.setItem('smriti_chat_language', newLang);
  };

  return (
    <>
      {/* Floating Action Banner Notification */}
      {actionAlert && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          <span className="font-extrabold text-sm sm:text-base">{actionAlert}</span>
        </div>
      )}

      {/* Floating Trigger Button (Positioned above mobile bottom bar) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-1.5 sm:gap-2 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-lg border border-amber-300 text-[11px] sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="flex items-center gap-1 font-black text-blue-900">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-400" />
              {chatLanguage === 'hi' ? 'स्मृति साथी' : 'Smriti AI'}
            </span>
          </div>

          <button
            id="open-ai-companion-btn"
            onClick={() => {
              setIsOpen(true);
              stopSpeech();
            }}
            className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#004085] via-blue-700 to-amber-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-3 sm:border-4 border-white focus:outline-none focus:ring-4 focus:ring-amber-400 cursor-pointer"
            title="Open AI Voice & Chat Companion"
          >
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 bg-amber-400 text-[#004085] text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
              <span>✨</span>
              <span>AI</span>
            </div>
          </button>
        </div>
      )}

      {/* Full Chatbot & Voice Assistant Modal Drawer (Mobile Bottom Sheet & Desktop Card) */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 w-full sm:w-[470px] sm:bottom-4 sm:right-4 sm:inset-x-auto max-h-[92vh] h-[86vh] sm:h-[670px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-2 sm:border-2 border-slate-300 flex flex-col overflow-hidden animate-slideUpMobile sm:animate-slideUp safe-area-bottom">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#004085] via-blue-900 to-[#07243C] text-white p-3 sm:p-3.5 flex flex-col shadow-md shrink-0">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-2 sm:hidden" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5 fill-amber-400 stroke-[#004085]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">
                    {chatLanguage === 'hi' ? 'स्मृति-सेतु साथी' : 'Smriti-Setu AI'}
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">
                  {chatLanguage === 'hi' ? 'हिन्दी आवाज़ व चैट साथी' : 'Voice & Chat Companion'}
                </p>
              </div>
            </div>

            {/* Language Switcher & Controls (ONLY Hindi & English) */}
            <div className="flex items-center gap-1.5">
              
              {/* Clean 2-Language Toggle Button (Hindi / English ONLY) */}
              <div className="flex items-center bg-black/30 p-0.5 rounded-xl border border-white/20">
                <button
                  type="button"
                  onClick={() => switchLanguage('hi')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    chatLanguage === 'hi'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                  title="स्विच करें: हिन्दी"
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    chatLanguage === 'en'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                  title="Switch to: English"
                >
                  English
                </button>
              </div>

              {/* Voice Mute/Unmute */}
              <button
                onClick={() => {
                  setSpeechEnabled(!speechEnabled);
                  if (speechEnabled) stopSpeech();
                }}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  speechEnabled
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-slate-700/60 text-slate-400 hover:text-white'
                }`}
                title={speechEnabled ? 'Voice Audio Enabled' : 'Voice Audio Muted'}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeech();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

          {/* Quick Direct Actions & Suggestions Toolbar */}
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-800 border border-slate-300 hover:border-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-2xs transition-all cursor-pointer"
              >
                <span>{suggestion}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                      isBot
                        ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                        : 'bg-[#004085] text-white rounded-tr-xs'
                    }`}
                  >
                    <p
                      className={`leading-relaxed whitespace-pre-line font-medium ${
                        elderlyMode ? 'text-base font-bold' : 'text-sm'
                      }`}
                    >
                      {msg.text}
                    </p>

                    {/* Action Executed Badge */}
                    {msg.actionExecuted && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Action: {msg.actionExecuted}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 font-semibold">
                    <span>{msg.timestamp}</span>
                    {isBot && msg.spokenText && (
                      <button
                        onClick={() => speakText(msg.spokenText!, chatLanguage === 'hi' ? 'hi-IN' : 'en-IN')}
                        className="hover:text-amber-600 flex items-center gap-1 underline cursor-pointer"
                        title="Replay Voice"
                      >
                        <Volume2 className="w-3 h-3" /> {chatLanguage === 'hi' ? 'सुनें' : 'Listen'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl max-w-[65%] border border-amber-300 text-slate-700 text-xs font-bold animate-pulse shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>{chatLanguage === 'hi' ? 'उत्तर तैयार हो रहा है...' : 'Answering your question...'}</span>
              </div>
            )}

            {isListening && (
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-800 text-xs font-extrabold animate-pulse">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span>{chatLanguage === 'hi' ? 'सुन रही हूँ... बोलें (Listening...)' : 'Listening... Speak your question'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white ring-4 ring-red-300 animate-pulse'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                }`}
                title={isListening ? 'Stop Listening' : 'Tap to Speak (Voice Input)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  chatLanguage === 'hi'
                    ? 'कोई भी सवाल पूछें (जैसे: सूरज क्या है?, ताजमहल)...'
                    : 'Ask any question or command...'
                }
                className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#004085] focus:bg-white transition-all text-slate-900"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-3 rounded-2xl bg-[#004085] hover:bg-blue-800 disabled:opacity-40 text-white font-bold transition-all shadow-md flex items-center justify-center cursor-pointer"
                title="Send Question"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 font-bold mt-1.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 inline" />
              <span>{chatLanguage === 'hi' ? 'हिन्दी आवाज़ व चैट साथी सक्रिय है' : 'English Voice & Chat Assistant Active'}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AiVoiceCompanion;
