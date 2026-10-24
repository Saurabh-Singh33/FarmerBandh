import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Trash2, 
  ChevronDown, 
  Globe, 
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { chatbotApi } from '../services/chatbotApi';
import { notify } from '../context/NotificationContext';

export const ChatbotWidget = () => {
  const { user } = useAuth();
  const { language: contextLang, changeLanguage } = useLanguage();

  // Widget visibility & expansion
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Active Chat Language: 'en' | 'hi' | 'gu'
  const [activeLang, setActiveLang] = useState(contextLang || 'en');
  useEffect(() => {
    if (contextLang && ['en', 'hi', 'gu'].includes(contextLang)) {
      setActiveLang(contextLang);
    }
  }, [contextLang]);

  // Messages list
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice state: Speech-to-Text (STT)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Voice state: Text-to-Speech (TTS)
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(false);
  const audioRef = useRef(null);

  // References
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role?.toLowerCase() || 'guest';
  const isAdmin = role === 'admin';
  const isFarmer = role === 'farmer';

  // Initial welcome message setup based on language and role
  useEffect(() => {
    const welcome = getWelcomeMessage(activeLang, role, user?.fullName);
    setMessages([welcome]);
  }, [activeLang, role, user?.fullName]);

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Cleanup speech synthesis and audio on unmount & warm voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Initialize Speech Recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify.error('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set recognition language with regional code
    recognition.lang = activeLang === 'hi' ? 'hi-IN' : (activeLang === 'gu' ? 'gu-IN' : 'en-IN');

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputText(transcript);
        // User asked by speaking -> KrishiMitra will answer by speaking aloud
        handleSendMessage(transcript, { isVoiceInput: true });
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        notify.warning('Microphone permission denied. Please allow microphone access in browser.');
      } else if (event.error === 'language-not-supported' && activeLang === 'gu') {
        // Fallback retry with generic 'gu' if 'gu-IN' is rejected
        try {
          recognition.lang = 'gu';
          recognition.start();
          setIsListening(true);
        } catch {
          notify.info('Gujarati speech service is unavailable in this browser. Please type your message.');
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Stop TTS if speaking
    stopSpeaking();

    const rec = initSpeechRecognition();
    if (rec) {
      recognitionRef.current = rec;
      try {
        rec.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgIndex(null);
  };

  // Helper to split long text into clean phrase chunks suitable for audio synthesis
  const splitTextForAudio = (str, maxLen = 170) => {
    const sentences = str.match(/[^।?!.,\n]+[।?!.,\n]*/g) || [str];
    const chunks = [];
    let current = '';

    for (const s of sentences) {
      if ((current + s).length > maxLen) {
        if (current.trim()) chunks.push(current.trim());
        if (s.length > maxLen) {
          const words = s.split(' ');
          let wChunk = '';
          for (const w of words) {
            if ((wChunk + ' ' + w).length > maxLen) {
              if (wChunk.trim()) chunks.push(wChunk.trim());
              wChunk = w;
            } else {
              wChunk += (wChunk ? ' ' : '') + w;
            }
          }
          if (wChunk.trim()) current = wChunk.trim();
          else current = '';
        } else {
          current = s;
        }
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length > 0 ? chunks : [str];
  };

  // High-quality sequential audio streaming for Gujarati and unsupported regional voices
  const playAudioStream = (cleanText, msgIndex, targetLang, fallbackVoice) => {
    const chunks = splitTextForAudio(cleanText, 170);
    let chunkIdx = 0;
    setSpeakingMsgIndex(msgIndex);

    const playNext = () => {
      if (chunkIdx >= chunks.length) {
        setSpeakingMsgIndex(null);
        return;
      }

      const chunk = chunks[chunkIdx];
      chunkIdx++;

      // Primary source: Server API TTS endpoint (same-origin proxy)
      const primaryUrl = chatbotApi.getTtsAudioUrl(chunk, targetLang);
      // Secondary fallback source: Direct Google Translate TTS endpoint
      const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(targetLang)}&q=${encodeURIComponent(chunk)}`;

      const audio = new Audio(primaryUrl);
      audioRef.current = audio;

      audio.onended = () => {
        playNext();
      };

      audio.onerror = () => {
        // Fallback to direct Google TTS stream
        const fallbackAudio = new Audio(directUrl);
        audioRef.current = fallbackAudio;

        fallbackAudio.onended = () => {
          playNext();
        };

        fallbackAudio.onerror = () => {
          // If network is completely blocked, try Hindi / Indic SpeechSynthesis as last resort
          if (fallbackVoice && window.speechSynthesis) {
            const utt = new SpeechSynthesisUtterance(chunk);
            utt.voice = fallbackVoice;
            utt.lang = fallbackVoice.lang || 'hi-IN';
            utt.onend = () => playNext();
            utt.onerror = () => setSpeakingMsgIndex(null);
            window.speechSynthesis.speak(utt);
          } else {
            setSpeakingMsgIndex(null);
          }
        };

        fallbackAudio.play().catch(() => {
          setSpeakingMsgIndex(null);
        });
      };

      audio.play().catch(() => {
        // If autoplay / audio play was rejected, try direct URL
        const fallbackAudio = new Audio(directUrl);
        audioRef.current = fallbackAudio;
        fallbackAudio.onended = () => {
          playNext();
        };
        fallbackAudio.onerror = () => {
          setSpeakingMsgIndex(null);
        };
        fallbackAudio.play().catch(() => {
          setSpeakingMsgIndex(null);
        });
      });
    };

    playNext();
  };

  // Text to Speech (TTS)
  const speakText = (text, index, explicitLang) => {
    if (speakingMsgIndex === index) {
      stopSpeaking();
      return;
    }

    // Stop current speech
    stopSpeaking();

    // Clean text of markdown characters, URLs, and formatting
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, '')
      .trim();

    if (!cleanText) return;

    const langCode = explicitLang || activeLang || 'en';

    // Check if browser native SpeechSynthesis has a dedicated voice for this language
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langCode));

    // For Gujarati (or when no native voice is available in the browser), use the high-quality audio stream
    if (langCode === 'gu' || !matchedVoice) {
      playAudioStream(cleanText, index, langCode, matchedVoice || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi')));
    } else {
      // Use browser SpeechSynthesis if native voice exists (common for Hindi & English)
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = langCode === 'hi' ? 'hi-IN' : (langCode === 'gu' ? 'gu-IN' : 'en-IN');
        utterance.voice = matchedVoice;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setSpeakingMsgIndex(index);
        };

        utterance.onend = () => {
          setSpeakingMsgIndex(null);
        };

        utterance.onerror = () => {
          // Fallback to audio stream if speech synthesis encounters error
          playAudioStream(cleanText, index, langCode, null);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis failed, falling back to audio stream:', err);
        playAudioStream(cleanText, index, langCode, null);
      }
    }
  };

  const handleSendMessage = async (customText, options = {}) => {
    const isVoiceInput = options?.isVoiceInput === true;
    const textToSend = (customText || inputText).trim();
    if (!textToSend || loading) return;

    // Stop any ongoing speech
    stopSpeaking();

    // Auto-detect question language (Hindi, Gujarati, English)
    const detectedLang = detectMessageLanguage(textToSend, activeLang);
    if (detectedLang !== activeLang) {
      setActiveLang(detectedLang);
    }

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: isVoiceInput
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      const serverHistory = newHistory.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await chatbotApi.sendMessage({
        message: textToSend,
        language: detectedLang,
        userName: user?.fullName || '',
        history: serverHistory
      });

      const replyLang = res.language || detectedLang;
      if (replyLang !== activeLang) {
        setActiveLang(replyLang);
      }

      const botReply = {
        role: 'assistant',
        content: res.reply || 'Thank you for contacting FarmerBandh.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: res.suggestedFollowUps || [],
        language: replyLang
      };

      const newMsgList = [...newHistory, botReply];
      setMessages(newMsgList);

      // CRITICAL MULTIMODAL RULE:
      // If user asked by SPEAKING (isVoiceInput === true): KrishiMitra speaks the answer aloud in that language!
      // If user asked by WRITING (isVoiceInput === false): KrishiMitra answers strictly in WRITING (silent text)!
      if (isVoiceInput) {
        speakText(botReply.content, newMsgList.length - 1, replyLang);
      } else if (autoVoiceEnabled) {
        speakText(botReply.content, newMsgList.length - 1, replyLang);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      const fallbackReply = {
        role: 'assistant',
        content: getErrorMessage(activeLang),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handlePromptClick = (promptText) => {
    // Clicking a written suggestion answers by writing
    handleSendMessage(promptText, { isVoiceInput: false });
  };

  const handleClearChat = () => {
    stopSpeaking();
    const welcome = getWelcomeMessage(activeLang, role, user?.fullName);
    setMessages([welcome]);
  };

  const handleLanguageSwitch = (langCode) => {
    stopSpeaking();
    setActiveLang(langCode);
    if (changeLanguage) {
      changeLanguage(langCode);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#1B4D3E] to-[#065F46] hover:from-[#163e32] hover:to-[#044c38] text-white rounded-full shadow-2xl border border-emerald-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
            title="Chat with KrishiMitra - FarmerBandh AI Assistant"
          >
            {/* Glowing ripple aura */}
            <span className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-30 group-hover:opacity-60 blur-sm transition duration-300"></span>

            <div className="relative flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-lg">
                🌾
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                  KrishiMitra AI
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-emerald-200 font-medium">
                  {isAdmin ? '🛡️ Admin Assistant' : 'Agrarian Companion'}
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Window - Compact & Sleek */}
      {isOpen && (
        <div 
          translate="no" 
          className="notranslate fixed bottom-5 right-3 sm:right-6 w-[92vw] sm:w-[350px] h-[72vh] sm:h-[480px] max-h-[510px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header - Compact */}
          <div className="bg-gradient-to-r from-[#1B4D3E] via-[#164336] to-[#0F2F26] text-white p-2.5 px-3 flex items-center justify-between shadow-sm relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-base shadow-inner">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-white tracking-wide">
                    {activeLang === 'hi' ? 'कृषिमित्र AI' : (activeLang === 'gu' ? 'કૃષિમિત્ર AI' : 'KrishiMitra AI')}
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    {isAdmin ? '🛡️ Admin' : (isFarmer ? 'Kisan' : 'Direct Trade')}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/90 font-medium">
                  {isAdmin ? 'Admin Control Center' : 'FarmerBandh Agrarian Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Selector Dropdown */}
              <div className="flex items-center bg-black/25 rounded-md p-0.5 border border-white/10 text-[10px]">
                {[
                  { code: 'en', label: 'EN' },
                  { code: 'hi', label: 'हि' },
                  { code: 'gu', label: 'ગુ' }
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleLanguageSwitch(l.code)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                      activeLang === l.code
                        ? 'bg-amber-400 text-slate-900 shadow-2xs'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Auto Voice Readout Toggle */}
              <button
                type="button"
                onClick={() => setAutoVoiceEnabled(!autoVoiceEnabled)}
                className={`p-1 rounded-md border transition-colors ${
                  autoVoiceEnabled
                    ? 'bg-amber-400 text-slate-900 border-amber-300'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
                title={autoVoiceEnabled ? 'Voice Auto-readout: ON' : 'Voice Auto-readout: OFF'}
              >
                {autoVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Clear chat */}
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors"
                title="Clear Conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors"
                title="Close Assistant"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Mode Notice - Slim */}
          <div className="bg-amber-50/90 border-b border-amber-200/70 px-3 py-1 flex items-center justify-between text-[10px] text-amber-900 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              {isAdmin ? 'Admin: Privileged access' : 'Scope: FarmerBandh only'}
            </span>
            <span className="text-[9px] text-amber-800 font-bold tracking-tight">
              {activeLang === 'hi' 
                ? '🎤 बोलें = बोलकर उत्तर | ⌨️ लिखें = लिखकर उत्तर' 
                : (activeLang === 'gu' 
                    ? '🎤 બોલો = બોલીને ઉત્તર | ⌨️ લખો = લખીને ઉત્તર' 
                    : '🎤 Speak = Speaks | ⌨️ Write = Writes')}
            </span>
          </div>

          {/* Message History Container - Compact */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isSpeakingThis = speakingMsgIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                >
                  <div className="flex items-end gap-1.5 max-w-[88%]">
                    {!isUser && (
                      <div className="w-5 h-5 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center text-[10px] flex-shrink-0 mb-0.5 shadow-2xs">
                        🌾
                      </div>
                    )}

                    <div
                      className={`p-2.5 px-3 rounded-xl text-xs leading-relaxed shadow-2xs relative ${
                        isUser
                          ? 'bg-[#1B4D3E] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Bot Message Voice Playback Button */}
                      {!isUser && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => speakText(msg.content, idx)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold text-[9px] transition-colors ${
                              isSpeakingThis
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-50'
                            }`}
                            title={isSpeakingThis ? 'Stop Voice' : 'Listen with Voice'}
                          >
                            {isSpeakingThis ? <VolumeX className="w-2.5 h-2.5 text-amber-700" /> : <Volume2 className="w-2.5 h-2.5 text-slate-500" />}
                            <span>{isSpeakingThis ? 'Stop' : 'Listen'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggested Follow-up chips */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-1.5 pl-6 flex flex-wrap gap-1 max-w-[92%]">
                      {msg.suggestedFollowUps.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handlePromptClick(chip)}
                          className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full text-[10px] font-medium transition-all shadow-2xs text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs pl-6 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B4D3E]" />
                <span className="italic text-[11px]">
                  {activeLang === 'hi' ? 'कृषिमित्र सोच रहा है...' : (activeLang === 'gu' ? 'કૃષિમિત્ર વિચારી રહ્યું છે...' : 'KrishiMitra is thinking...')}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Active Wave Bar */}
          {isListening && (
            <div className="bg-rose-50 border-t border-rose-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-rose-900 animate-pulse">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                <span>
                  {activeLang === 'hi' ? 'बोलिए, सुन रहा हूँ...' : (activeLang === 'gu' ? 'બોલો, સાંભળી રહ્યો છું...' : 'Listening... Speak now')}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input & Voice Controls Footer - Compact */}
          <div className="p-2 px-2.5 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText, { isVoiceInput: false });
              }}
              className="flex items-center gap-1.5"
            >
              {/* Voice Speech-to-Text Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg border transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-600 animate-bounce'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title={`Speak in ${activeLang === 'hi' ? 'हिन्दी' : (activeLang === 'gu' ? 'ગુજરાતી' : 'English')}`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getPlaceholder(activeLang)}
                disabled={loading}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] focus:bg-white transition-all font-medium"
              />

              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="p-2 bg-[#1B4D3E] hover:bg-[#143c30] text-white rounded-lg shadow-2xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="text-[9px] text-center text-slate-400 mt-1 font-medium">
              FarmerBandh AI • Exclusively for FarmerBandh
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function cleanFriendlyName(userName) {
  if (!userName) return '';
  if (userName.includes('@')) {
    const prefix = userName.split('@')[0].replace(/[\d_\.\-]+/g, ' ').trim();
    if (!prefix) return '';
    return prefix.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return userName.trim();
}

function getWelcomeMessage(lang, role, userName) {
  const isAdmin = role === 'admin';
  const cleanName = cleanFriendlyName(userName);
  const name = cleanName ? ` ${cleanName}` : (isAdmin ? '' : (role === 'farmer' ? (lang === 'hi' ? ' किसान मित्र' : ' Kisan Mitra') : ''));

  if (isAdmin) {
    switch (lang) {
      case 'hi':
        return {
          role: 'assistant',
          content: `नमस्ते एडमिन${name}! मैं फार्मरबंध का विशेष एडमिन एआई सहायक हूँ। आप मुझसे किसान सत्यापन (KYC 7/12 व आधार), विवाद मध्यस्थता (Disputes), कमीशन सेटिंग और पेआउट्स के बारे में पूछ सकते हैं।`,
          timestamp: 'Just now',
          suggestedFollowUps: ['किसान सत्यापन कैसे स्वीकृत करें?', 'विवादों का निपटारा कैसे करें?', 'प्लेटफॉर्म कमीशन सेटिंग']
        };
      case 'gu':
        return {
          role: 'assistant',
          content: `નમસ્તે એડમિન${name}! હું ફાર્મરબંધનું વિશિષ્ટ એડમિન AI સહાયક છું. તમે મને ખેડૂત ચકાસણી (KYC 7/12 અને આધાર), વિવાદ નિરાકરણ, કમિશન સેટિંગ્સ અને પેઆઉટ્સ વિશે પૂછી શકો છો.`,
          timestamp: 'Just now',
          suggestedFollowUps: ['ખેડૂત ચકાસણી કેવી રીતે મંજૂર કરવી?', 'વિવાદોનો ઉકેલ કેવી રીતે લાવવો?', 'પ્લેટફોર્મ કમિશન સેટિંગ્સ']
        };
      default:
        return {
          role: 'assistant',
          content: `Welcome Administrator${name}! I am your dedicated KrishiMitra Admin Assistant. I can assist with Farmer KYC verifications (7/12 extract & Aadhaar approvals), dispute arbitrations, platform commission rates, and payouts.`,
          timestamp: 'Just now',
          suggestedFollowUps: ['How do I verify farmer KYC?', 'How do I arbitrate disputes?', 'Platform fee settings']
        };
    }
  }

  // Non-Admin (Farmer / Buyer / Guest)
  switch (lang) {
    case 'hi':
      return {
        role: 'assistant',
        content: `नमस्ते${name}! मैं कृषिमित्र हूँ, फार्मरबंध का आधिकारिक एआई सहायक। मैं केवल फार्मरबंध प्लेटफॉर्म (फसलें, मोलभाव, रेज़रपे पेमेंट लिंक, और डिलीवरी) से जुड़े सवालों के जवाब देता हूँ। आप मुझसे क्या पूछना चाहते हैं?`,
        timestamp: 'Just now',
        suggestedFollowUps: ['फसल के भाव पर मोलभाव कैसे करें?', 'रेज़रपे से कम या ज्यादा भुगतान कैसे करें?', 'डिलीवरी स्लॉट विकल्प']
      };
    case 'gu':
      return {
        role: 'assistant',
        content: `નમસ્તે${name}! હું કૃષિમિત્ર છું, ફાર્મરબંધનું સત્તાવાર AI સહાયક. હું ફક્ત ફાર્મરબંધ પ્લેટફોર્મ (પાક, વાટાઘાટો, રેઝરપે પેમેન્ટ લિંક અને ડિલિવરી) સંબંધિત પ્રશ્નોના જવાબો આપું છું.`,
        timestamp: 'Just now',
        suggestedFollowUps: ['પાકના ભાવ પર વાટાઘાટો કેવી રીતે કરવી?', 'રેઝરપેથી ઓછી અથવા વધુ ચુકવણી કેવી રીતે કરવી?', 'ડિલિવરી સ્લોટ વિકલ્પો']
      };
    default:
      return {
        role: 'assistant',
        content: `Hello${name}! I am KrishiMitra, your FarmerBandh AI companion. I provide support exclusively for FarmerBandh (fresh produce marketplace, price negotiations, Razorpay payment links, delivery tracking). How can I help you today?`,
        timestamp: 'Just now',
        suggestedFollowUps: ['How do I negotiate crop prices?', 'How to pay less or more with Razorpay?', 'What are delivery slots?']
      };
  }
}

function getPlaceholder(lang) {
  switch (lang) {
    case 'hi':
      return 'पूछें या बोलें (फसल, भाव, रेज़रपे)...';
    case 'gu':
      return 'પૂછો અથવા બોલો (પાક, ભાવ, ચુકવણી)...';
    default:
      return 'Ask about crops, price negotiation, payments...';
  }
}

function getErrorMessage(lang) {
  switch (lang) {
    case 'hi':
      return 'क्षमा करें, संदेश संसाधित करने में समस्या हुई। कृपया पुनः प्रयास करें।';
    case 'gu':
      return 'માફ કરશો, સંદેશ પ્રક્રિયા કરવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.';
    default:
      return 'Sorry, there was an issue connecting to the assistant. Please try again.';
  }
}

export function detectMessageLanguage(text, fallbackLang = 'en') {
  if (!text || typeof text !== 'string') return fallbackLang;
  const trimmed = text.trim();

  // 1. Unicode script detection: Devanagari -> Hindi
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return 'hi';
  }

  // 2. Unicode script detection: Gujarati script -> Gujarati
  if (/[\u0A80-\u0AFF]/.test(trimmed)) {
    return 'gu';
  }

  // 3. Romanized keywords detection (Hinglish / Gujlish)
  const lower = trimmed.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  const hindiTerms = [
    'namaste', 'kaise', 'kaisa', 'kya', 'hai', 'hain', 'ho', 'karo', 'kisan', 'fasal',
    'bhav', 'daam', 'kharidna', 'bechna', 'kharid', 'bech', 'paise', 'bhai',
    'mera', 'meri', 'mere', 'aapka', 'aapki', 'aapke', 'tumhara', 'aap', 'mujhe',
    'hum', 'nahi', 'nahin', 'molbhav', 'kheti', 'mandi', 'dhanyawad'
  ];

  const gujaratiTerms = [
    'kem', 'cho', 'tamaru', 'maru', 'mane', 'pak', 'khedut',
    'su', 'shu', 'che', 'nathi', 'karvu', 'kharidi', 'vechan', 'aabhar'
  ];

  let hindiCount = 0;
  let gujaratiCount = 0;

  for (const w of words) {
    if (hindiTerms.includes(w)) hindiCount++;
    if (gujaratiTerms.includes(w)) gujaratiCount++;
  }

  if (hindiCount >= 2 || (hindiCount === 1 && words.length <= 4)) {
    return 'hi';
  }

  if (gujaratiCount >= 2 || (gujaratiCount === 1 && words.length <= 4)) {
    return 'gu';
  }

  const englishTerms = [
    'what', 'how', 'who', 'where', 'when', 'why', 'can', 'could', 'is', 'are',
    'the', 'your', 'my', 'you', 'hello', 'hi', 'work', 'help', 'crop', 'crops',
    'price', 'negotiate', 'pay', 'payment', 'delivery', 'buy', 'sell', 'order'
  ];

  let englishCount = 0;
  for (const w of words) {
    if (englishTerms.includes(w)) englishCount++;
  }

  if (englishCount >= 1) {
    return 'en';
  }

  return fallbackLang;
}

export default ChatbotWidget;
