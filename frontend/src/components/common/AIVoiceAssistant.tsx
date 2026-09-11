import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, X, Send, Bot, Volume2, Search, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speakText } from '../../utils/speech';
import { assistantApi } from '../../services/api';

interface AIVoiceAssistantProps {
  onSearchQuery?: (query: string) => void;
}

export const AIVoiceAssistant: React.FC<AIVoiceAssistantProps> = ({ onSearchQuery }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; source?: string }>>([
    {
      sender: 'ai',
      text: 'Namaste! I am Smriti-AI (Powered by Gemini), your Cognitive & Healthcare Assistant. How can I assist you today?',
      source: 'gemini',
    },
  ]);

  const quickPrompts = [
    '🧠 Play Memory Card Match Game',
    '🏥 Find Nearest Guwahati Hospitals',
    '🔊 Enable Voice Assistance',
    '📊 Check Cognitive Score Analytics',
  ];

  const handleSendQuery = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user' as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const storedKey = localStorage.getItem('smriti_gemini_api_key') || undefined;
      const res = await assistantApi.chat({
        message: text,
        language: 'en',
        apiKey: storedKey,
        history: messages.slice(-4).map((m) => ({
          sender: m.sender === 'user' ? 'user' : 'assistant',
          text: m.text,
        })),
      });

      const aiReply = res.reply || 'Here is what I found for your cognitive health request.';
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply, source: res.source }]);
      speakText(res.spokenText || aiReply, res.detectedLanguage || 'en');

      // Trigger search if requested
      if (res.action?.type === 'OPEN_ACTIVITY' && onSearchQuery) {
        onSearchQuery('activities');
      } else if (res.action?.type === 'OPEN_PORTAL' && onSearchQuery) {
        onSearchQuery('portal');
      }
    } catch (e) {
      const fallbackReply = 'I am your Smriti-Setu AI assistant. You can ask me any healthcare or memory question!';
      setMessages((prev) => [...prev, { sender: 'ai', text: fallbackReply, source: 'local_heuristic' }]);
      speakText(fallbackReply, 'en');
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice Speech Recognition is not supported in this browser window. Please type your query.');
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSendQuery(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ai-pulse bg-gradient-to-r from-[#004085] via-blue-800 to-indigo-900 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 border-2 border-amber-400 backdrop-blur-md cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
          </div>
          <span className="hidden sm:inline text-sm tracking-wide font-bold">
            {isOpen ? 'Close Chat' : 'Ask Smriti AI'}
          </span>
          {isOpen ? <X className="w-4 h-4 text-amber-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
        </button>
      </div>

      {/* AI Assistant Floating Corner Popup Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] md:w-[420px] h-[540px] max-h-[78vh] bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-4 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
                <Bot className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  Smriti-AI Assistant <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <span className="text-[11px] text-sky-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Gemini Freestyle Q&A Active
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950/50 min-h-[260px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-amber-400'
                  }`}
                >
                  {msg.sender === 'user' ? 'Me' : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-2xl max-w-[65%] border border-sky-300 text-slate-700 dark:text-slate-200 text-xs font-bold animate-pulse">
                <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
                <span>Gemini is answering...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(p)}
                className="whitespace-nowrap text-[11px] font-bold bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-full transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-sky-600" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder={isListening ? 'Listening...' : 'Ask any question or command...'}
              className="flex-1 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
            />

            <button
              onClick={() => handleSendQuery()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
