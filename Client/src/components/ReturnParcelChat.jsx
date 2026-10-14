import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Minimize2, 
  Maximize2, 
  X, 
  Radio, 
  Volume2, 
  VolumeX, 
  Truck, 
  Package, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Info,
  MoreVertical,
  Trash2,
  RotateCcw,
  Ban
} from 'lucide-react';
import { returnApi } from '../services/returnApi';
import { useAuth } from '../context/AuthContext';
import { notify } from '../context/NotificationContext';
import ChatBubble from './ChatBubble';

export default function ReturnParcelChat({ 
  returnId, 
  returnReq, 
  onMessagesUpdated,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  openTrigger,
  onClose,
  isDocked = false
}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(controlledIsOpen !== undefined ? controlledIsOpen : defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages, setMessages] = useState(returnReq?.messages || []);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync when controlledIsOpen or openTrigger changes (e.g., clicking "Return Parcel Chat" button)
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
      if (controlledIsOpen) {
        setIsMinimized(false);
        setUnreadCount(0);
      }
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    if (openTrigger) {
      setIsOpen(true);
      setIsMinimized(false);
      setUnreadCount(0);
    }
  }, [openTrigger]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // WhatsApp-style deletion state
  const [deleteModalMsg, setDeleteModalMsg] = useState(null);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // Deleted for me IDs (persisted locally per user and return ID)
  const storageKey = `fb_del_me_${user?.id || 'guest'}_${returnId}`;
  const [deletedForMe, setDeletedForMe] = useState(() => {
    try {
      const stored = localStorage.getItem(`fb_del_me_${user?.id || 'guest'}_${returnId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const updateDeletedForMe = (newArr) => {
    setDeletedForMe(newArr);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newArr));
    } catch {
      // safe fallback
    }
  };

  const messagesEndRef = useRef(null);
  const prevMessagesLength = useRef(returnReq?.messages?.length || 0);

  const isFarmer = user?.role?.toLowerCase() === 'farmer' || user?.role?.toLowerCase() === 'seller';
  const otherPartyName = isFarmer 
    ? (returnReq?.buyerName || 'Buyer') 
    : (returnReq?.sellerName || 'Farmer Ramesh');

  // Play a gentle notification sound when a new message arrives from the other party
  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // safe fallback if audio context not permitted yet
    }
  };

  // Sync internal messages when returnReq changes from parent
  useEffect(() => {
    if (returnReq?.messages && Array.isArray(returnReq.messages)) {
      const valid = returnReq.messages.filter((m) => m && (m.body || m.message || m.text));
      setMessages(valid);
      prevMessagesLength.current = valid.length;
    }
  }, [returnReq?.messages]);

  // Scroll to bottom on initial load or new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, deletedForMe]);

  // Real-time polling every 2.5 seconds for live return parcel coordination
  useEffect(() => {
    if (!returnId || !polling) return;

    const intervalId = setInterval(async () => {
      try {
        const fresh = await returnApi.getReturnById(returnId);
        if (fresh && Array.isArray(fresh.messages)) {
          const validMessages = fresh.messages.filter((m) => m && (m.body || m.message || m.text));
          
          setMessages((currentMsgs) => {
            const currentLen = currentMsgs.length;
            const freshLen = validMessages.length;
            
            const hasChange = freshLen !== currentLen ||
              (freshLen > 0 && currentLen > 0 && (
                validMessages[freshLen - 1]?.id !== currentMsgs[currentLen - 1]?.id ||
                validMessages[freshLen - 1]?.body !== currentMsgs[currentLen - 1]?.body
              ));

            if (hasChange) {
              const latestMsg = validMessages[freshLen - 1];
              const isFromOther = latestMsg?.senderUserId !== user?.id &&
                (isFarmer ? latestMsg?.senderRole?.toLowerCase() === 'buyer' : latestMsg?.senderRole?.toLowerCase() !== 'buyer');

              if (isFromOther) {
                playNotificationChime();
                if (isMinimized || !isOpen) {
                  setUnreadCount((c) => c + 1);
                }
              }

              if (onMessagesUpdated) {
                onMessagesUpdated(fresh);
              }
              return validMessages;
            }
            return currentMsgs;
          });
        }
      } catch (err) {
        // silent catch on polling to avoid interrupting UI
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [returnId, polling, soundEnabled, user?.id, isFarmer, isMinimized, isOpen, onMessagesUpdated]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText.trim() : inputMessage.trim();
    if (!textToSend || sending) return;

    setSending(true);
    try {
      const res = await returnApi.addReturnMessage(returnId, { body: textToSend });
      
      // Fetch fresh return details from database to guarantee 100% accurate database records
      const fresh = await returnApi.getReturnById(returnId);
      let cleanList = [];
      if (fresh && Array.isArray(fresh.messages)) {
        cleanList = fresh.messages.filter((m) => m && (m.body || m.message || m.text));
      } else if (res && (res.body || res.message)) {
        cleanList = [...messages, res];
      } else {
        cleanList = messages;
      }

      setMessages(cleanList);
      prevMessagesLength.current = cleanList.length;
      setInputMessage('');

      if (onMessagesUpdated && fresh) {
        onMessagesUpdated(fresh);
      }

      // Smooth scroll
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error('Failed to post return message:', err);
      notify.error(err.response?.data?.message || 'Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // WhatsApp-Style Deletion Handlers
  const isMsgFromCurrentUser = (msg) => {
    if (!msg) return false;
    return msg.senderUserId === user?.id || 
      (isFarmer && (msg.senderRole?.toLowerCase() === 'farmer' || msg.senderRole?.toLowerCase() === 'seller')) ||
      (!isFarmer && msg.senderRole?.toLowerCase() === 'buyer');
  };

  const handleDeleteForMe = (msgId) => {
    const updated = Array.from(new Set([...deletedForMe, msgId]));
    updateDeletedForMe(updated);
    setDeleteModalMsg(null);
    notify.success('Message deleted for you.');
  };

  const handleDeleteForEveryone = async (msgId) => {
    try {
      await returnApi.deleteReturnMessage(returnId, msgId, true);
      // Immediately reflect as deleted in local state
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, body: '[deleted]', text: '[deleted]' } : m))
      );
      setDeleteModalMsg(null);
      notify.success('Message deleted for everyone.');
    } catch (err) {
      console.error('Failed to delete message for everyone:', err);
      notify.error(err.response?.data?.message || 'Could not delete message for everyone.');
    }
  };

  const handleClearChatForMe = () => {
    const allIds = messages.map((m) => m.id).filter(Boolean);
    const updated = Array.from(new Set([...deletedForMe, ...allIds]));
    updateDeletedForMe(updated);
    setShowClearChatModal(false);
    setShowHeaderMenu(false);
    notify.success('Chat cleared from your side.');
  };

  const handleRestoreDeleted = () => {
    updateDeletedForMe([]);
    setShowHeaderMenu(false);
    notify.success('All hidden messages restored.');
  };

  // Preset quick tags for return parcel coordination
  const buyerQuickTags = [
    { label: '📦 Parcel Packed & Ready', text: 'The return produce has been carefully packaged in standard crates and is ready for pickup.' },
    { label: '🕒 Preferred Slot: Tomorrow Morning', text: 'Preferred pickup timing: Tomorrow between 10:00 AM and 1:00 PM.' },
    { label: '📍 Address Verified', text: 'Confirmed pickup at registered address. Contact number is active for driver coordination.' },
    { label: '⚖️ Weight Confirmed', text: 'Net quantity is weighed and matches the return request.' }
  ];

  const sellerQuickTags = [
    { label: '🚚 Pickup Vehicle Scheduled', text: 'We have dispatched our transport carrier for collection. Expected arrival tomorrow morning.' },
    { label: '📞 Driver Calling Ahead', text: 'The driver will call you 30 minutes before reaching your location.' },
    { label: '📦 Parcel Received', text: 'We have received the return parcel. Quality verification is underway.' },
    { label: '✅ Verified & Refund Initiated', text: 'Produce condition verified. Full refund has been authorized.' }
  ];

  const quickTags = isFarmer ? sellerQuickTags : buyerQuickTags;

  // Filter messages for display (excluding deleted-for-me messages)
  const visibleMessages = messages.filter(
    (m) => m && (m.body || m.message || m.text) && !deletedForMe.includes(m.id)
  );

  // Render floating trigger button when closed
  if (!isOpen && !isDocked) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setUnreadCount(0);
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#1B4D3E] text-white rounded-full shadow-xl hover:bg-[#143B2F] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-400/40"
        title="Open Real-Time Return Parcel Chat"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
        </div>
        <span className="text-xs font-bold font-sans tracking-wide">Parcel Live Chat</span>
        {unreadCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Minimized docked bar
  if (isMinimized) {
    return (
      <div className={`${isDocked ? 'w-full' : 'fixed bottom-6 right-6 z-50 w-80'} bg-[#1B4D3E] text-white rounded-2xl shadow-2xl border border-emerald-700/50 p-3.5 flex items-center justify-between transition-all duration-200`}>
        <div 
          onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
          className="flex items-center gap-2.5 cursor-pointer flex-1"
        >
          <div className="relative">
            <Package className="w-4 h-4 text-emerald-300" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              Parcel Live Chat
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-200/80 leading-tight">with {otherPartyName}</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
            className="p-1 hover:bg-white/10 rounded-lg text-emerald-200 hover:text-white"
            title="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {!isDocked && (
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/10 rounded-lg text-emerald-200 hover:text-white"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Chat Box (Exact size maintained: w-[380px] h-[540px])
  return (
    <div 
      className={`
        ${isDocked ? 'w-full h-full relative' : 'fixed bottom-6 right-6 z-50'} 
        w-[380px] max-w-[calc(100vw-32px)] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans transition-all duration-300
      `}
    >
      {/* Top Header Bar */}
      <div className="bg-[#1B4D3E] text-white px-4 py-3 shrink-0 flex items-center justify-between border-b border-emerald-800 shadow-xs relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/10">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide">Parcel Coordination</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-[10px] text-emerald-100/80">
              Direct chat with {otherPartyName}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1 text-emerald-200">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${soundEnabled ? 'text-emerald-300' : 'text-emerald-500'}`}
            title={soundEnabled ? 'Mute incoming chimes' : 'Enable incoming chimes'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* WhatsApp-Style 3-Dots Menu */}
          <div className="relative">
            <button
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              title="Chat options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showHeaderMenu && (
              <div className="absolute right-0 top-8 z-50 w-44 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowHeaderMenu(false);
                    setShowClearChatModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear chat (for me)
                </button>
                {deletedForMe.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRestoreDeleted}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-[#1B4D3E] flex items-center gap-2 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore cleared chat
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowHeaderMenu(false);
                    setSoundEnabled(!soundEnabled);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium border-t border-slate-100"
                >
                  {soundEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {soundEnabled ? 'Mute sound' : 'Enable sound'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {!isDocked && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
              title="Close chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Parcel Context Banner */}
      <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-3.5 py-2 flex items-center justify-between text-[11px] text-emerald-900 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <Package className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="font-semibold truncate">
            Return #{returnReq?.orderNumber || returnId?.slice(0, 8)}
          </span>
          <span className="text-emerald-700 font-bold">•</span>
          <span className="text-emerald-800 font-medium">Status: {returnReq?.status || 'Active'}</span>
        </div>
        <div className="text-[10px] text-emerald-700 font-semibold shrink-0 ml-2">
          Real-time
        </div>
      </div>

      {/* Message History Body */}
      <div 
        onClick={() => { if (showHeaderMenu) setShowHeaderMenu(false); }}
        className="flex-1 overflow-y-auto p-3.5 bg-slate-50/50 space-y-3 min-h-0 text-xs"
      >
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100/60 text-[#1B4D3E] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">No parcel messages</p>
              <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto mt-1">
                Coordinate pickup dates, driver contacts, packaging status, or inspection details in real-time.
              </p>
            </div>
            {deletedForMe.length > 0 && (
              <button
                type="button"
                onClick={handleRestoreDeleted}
                className="text-[11px] font-bold text-[#1B4D3E] hover:underline flex items-center gap-1 mt-1"
              >
                <RotateCcw className="w-3 h-3" /> Restore hidden chat history
              </button>
            )}
            <div className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mt-1">
              💡 Tap a suggestion below to start
            </div>
          </div>
        ) : (
          visibleMessages.map((msg, index) => {
            const isCurr = isMsgFromCurrentUser(msg);

            return (
              <ChatBubble
                key={msg.id || index}
                msg={msg}
                isCurrentUser={isCurr}
                onOpenDeleteModal={(m) => setDeleteModalMsg(m)}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips for Fast Real-Time Coordination */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Quick:
        </span>
        {quickTags.map((tag, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(tag.text)}
            disabled={sending}
            className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-200 whitespace-nowrap font-medium transition-colors shrink-0 disabled:opacity-50"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Input Form Footer */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder={`Message ${otherPartyName}...`}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#1B4D3E] focus:bg-white focus:ring-1 focus:ring-[#1B4D3E] transition-all disabled:opacity-60 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || sending}
            className="p-2.5 bg-[#1B4D3E] text-white rounded-xl hover:bg-[#143B2F] active:scale-95 disabled:opacity-40 disabled:hover:bg-[#1B4D3E] transition-all shadow-xs shrink-0 flex items-center justify-center"
            title="Send Message"
          >
            {sending ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-0.5">
          <span>Press Enter to send</span>
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" /> Real-time active
          </span>
        </div>
      </div>

      {/* WhatsApp-Style Delete Message Modal */}
      {deleteModalMsg && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 w-full max-w-[320px] text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-sans">Delete message?</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic px-2 bg-slate-50 py-1.5 rounded-lg border border-slate-100">
                "{deleteModalMsg.body || deleteModalMsg.message}"
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {/* If message was sent by current user, offer Delete for everyone */}
              {isMsgFromCurrentUser(deleteModalMsg) && (
                <button
                  type="button"
                  onClick={() => handleDeleteForEveryone(deleteModalMsg.id)}
                  className="w-full py-2.5 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 flex items-center justify-center gap-2"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Delete for everyone
                </button>
              )}

              {/* Delete for me is always available */}
              <button
                type="button"
                onClick={() => handleDeleteForMe(deleteModalMsg.id)}
                className="w-full py-2.5 px-3 text-xs font-bold text-[#1B4D3E] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete for me
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalMsg(null)}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-Style Clear Chat Modal */}
      {showClearChatModal && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 w-full max-w-[320px] text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-sans">Clear this chat?</h4>
              <p className="text-[11px] text-slate-500 mt-1 px-1">
                Messages will be deleted from your side only. The other party will still retain their conversation copy.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleClearChatForMe}
                className="w-full py-2.5 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear chat for me
              </button>

              <button
                type="button"
                onClick={() => setShowClearChatModal(false)}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
