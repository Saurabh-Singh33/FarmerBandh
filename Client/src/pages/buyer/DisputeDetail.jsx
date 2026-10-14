import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, CheckCircle2, AlertCircle, Radio, RefreshCw, GripVertical } from 'lucide-react';
import { disputeApi } from '../../services/disputeApi';
import { orderApi } from '../../services/orderApi';
import StatusPill from '../../components/StatusPill';
import ChatBubble from '../../components/ChatBubble';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../context/NotificationContext';

export default function DisputeDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // New dispute form state
  const [isCreating] = useState(id === 'new' && !!orderIdParam);
  const [order, setOrder] = useState(null);
  const [category, setCategory] = useState('QualityIssue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Chat message state
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Resizable Right Panel (Stretch to increase or decrease size)
  const [rightPanelWidth, setRightPanelWidth] = useState(290);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      // Dragging to the left increases right panel width; dragging to the right decreases it
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, 210), 600);
      setRightPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e) => {
    if (!e.touches?.[0]) return;
    const startX = e.touches[0].clientX;
    const startWidth = rightPanelWidth;
    setIsDragging(true);

    const onTouchMove = (moveEvent) => {
      if (!moveEvent.touches?.[0]) return;
      const deltaX = startX - moveEvent.touches[0].clientX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, 210), 600);
      setRightPanelWidth(newWidth);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
  };

  const changePanelWidth = (delta) => {
    setRightPanelWidth((prev) => Math.min(Math.max(prev + delta, 210), 600));
  };

  const resetPanelWidth = () => {
    setRightPanelWidth(290);
  };

  // Buyer Resolution and Close Actions
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const handleResolveDispute = async (newStatus) => {
    const resolutionSummary = prompt(
      newStatus === 'Resolved'
        ? 'Enter resolution note (e.g., accepted seller replacement, issue settled):'
        : 'Enter reason for closing dispute:'
    );
    if (!resolutionSummary) return;

    setUpdatingStatus(true);
    try {
      const updated = await disputeApi.updateDisputeStatus(dispute.id, newStatus, resolutionSummary);
      setDispute(updated);
      notify.success(`Dispute marked as ${newStatus}.`, 'Dispute Updated');
    } catch (err) {
      console.error('Failed to update dispute status:', err);
      notify.error(err.response?.data?.message || 'Failed to update dispute status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Auto-scroll ref and previous message length tracker
  const messagesEndRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Sound chime for incoming real-time messages
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (_) {}
  };

  useEffect(() => {
    if (isCreating && orderIdParam) {
      fetchOrderToDispute(orderIdParam);
    } else if (id && id !== 'new') {
      fetchDisputeDetails(id, true);

      // Real-time synchronization loop every 2.5 seconds
      const interval = setInterval(() => {
        fetchDisputeDetails(id, false);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [id, orderIdParam]);

  const fetchOrderToDispute = async (oId) => {
    setLoading(true);
    try {
      const data = await orderApi.getBuyerOrderById(oId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order for dispute:', err);
      setError('Could not fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputeDetails = async (dspId, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setSyncing(true);

    try {
      const data = await disputeApi.getDisputeById(dspId);
      if (data) {
        setDispute((prev) => {
          if (!prev) {
            prevMsgCountRef.current = (data.messages || []).length;
            return data;
          }

          const prevMsgs = prev.messages || [];
          const newMsgs = data.messages || [];

          // Detect new message received from seller in real time
          if (newMsgs.length > prevMsgs.length) {
            const latestMsg = newMsgs[newMsgs.length - 1];
            const isMe = latestMsg.senderUserId === user?.id || latestMsg.senderUserId === user?.userId;
            if (!isMe && !isInitial) {
              playNotificationChime();
              notify.info(
                `New reply from ${latestMsg.senderName || 'Farmer'}: "${latestMsg.body?.slice(0, 35)}..."`,
                'New Message'
              );
            }
            setTimeout(() => scrollToBottom(true), 80);
          }

          // Detect status update (e.g. farmer marked resolved)
          if (prev.status !== data.status && !isInitial) {
            notify.success(`Dispute status updated to: ${data.status}`, 'Status Update');
          }

          prevMsgCountRef.current = newMsgs.length;
          return data;
        });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dispute details:', err);
      if (isInitial) setError('Dispute not found or access denied.');
    } finally {
      if (isInitial) {
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 200);
      }
      setSyncing(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      notify.warning('Please fill in both subject and description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await disputeApi.createDispute({
        orderId: orderIdParam,
        category,
        subject,
        description,
      });
      notify.success('Dispute ticket raised successfully.');
      navigate(`/disputes/${res.id}`);
    } catch (err) {
      console.error('Failed to create dispute:', err);
      notify.error(err.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend || !dispute) return;

    // Immediate optimistic local message append for zero perceived lag
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      disputeId: dispute.id,
      senderUserId: user?.id || user?.userId,
      senderName: user?.fullName || 'Anita Desai',
      senderRole: 'Buyer',
      body: textToSend,
      message: textToSend,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    setDispute((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), optimisticMessage],
    }));
    setNewMessage('');
    setSendingMsg(true);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await disputeApi.addMessage(dispute.id, textToSend);
      if (res?.messages) {
        setDispute(res);
      } else {
        setDispute((prev) => ({
          ...prev,
          messages: (prev.messages || []).map((m) => (m.id === tempId ? res : m)),
        }));
      }
      setTimeout(() => scrollToBottom(true), 100);
    } catch (err) {
      console.error('Failed to send message:', err);
      notify.error('Could not send message. Please try again.');
      // Revert optimistic message on failure
      setDispute((prev) => ({
        ...prev,
        messages: (prev.messages || []).filter((m) => m.id !== tempId),
      }));
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
        Loading dispute thread...
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 font-sans space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-900"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Back
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" /> Raise Dispute for Order #{order?.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              State your dispute clearly so the farmer seller and platform support can resolve it.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Dispute Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="NonDelivery">Non Delivery of Order</option>
                <option value="DelayedDelivery">Delayed Shipment / Delivery</option>
                <option value="QualityIssue">Grain Quality / Moisture Discrepancy</option>
                <option value="PaymentDispute">Payment / Billing Dispute</option>
                <option value="DamagedInTransit">Damaged in Transit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Dispute Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short title describing the dispute issue"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Detailed Explanation & Request *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide exact details of what occurred and what resolution you expect..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs rounded-full shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? 'Submitting Dispute...' : 'Submit Dispute'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-slate-800 font-serif mb-2">Dispute Not Found</h2>
        <p className="text-slate-600 text-xs mb-6">{error}</p>
        <Link to="/disputes" className="px-6 py-2.5 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-semibold text-xs rounded-full inline-block transition">
          Back to My Disputes
        </Link>
      </div>
    );
  }

  const isResolvedOrClosed = dispute.status === 'Resolved' || dispute.status === 'Closed';
  const disputeNum = dispute.disputeNumber || `DSP-${dispute.id?.slice(0, 8).toUpperCase()}`;
  const openedDate = dispute.openedAt || dispute.createdAt;
  const sellerName = dispute.sellerName || dispute.againstByName || 'Farmer Ramesh';

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 font-sans h-[calc(100vh-76px)] flex flex-col">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/disputes')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] hover:text-[#15803D] bg-white border border-[#E2EBE2] px-3 py-1.5 rounded-lg shadow-2xs hover:bg-[#F0FDF4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Disputes
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono font-bold text-slate-800 text-sm">{disputeNum}</span>
            <StatusPill status={dispute.status} />
          </div>
        </div>

        {/* Real-Time Live Status Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Real-Time Live
          </span>
          <button
            onClick={() => fetchDisputeDetails(dispute.id, false)}
            disabled={syncing}
            title="Sync Now"
            className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split with Interactive Draggable Resizer Handle */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 md:gap-2.5 overflow-hidden">
        {/* LEFT COLUMN: Chat Section (Takes all remaining width, top to bottom) */}
        <div className="flex-1 min-w-0 flex flex-col h-full bg-white border border-[#E2EBE2] rounded-2xl shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3 border-b border-[#E2EBE2] bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shadow-2xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-1.5">
                  Live Chat with Farmer ({sellerName})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Regarding Order #{dispute.orderNumber} • {dispute.subject}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              Messages sync in real time
            </span>
          </div>

          {/* Messages Stream (Takes all vertical height, scrolls from top to bottom) */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-[#FBFDFB] min-h-0">
            {(() => {
              const uniqueMessages = Array.from(
                new Map((dispute.messages || []).map((m) => [m.id, m])).values()
              );
              return uniqueMessages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No messages yet. Send a message below to begin discussion.
                </div>
              ) : (
                uniqueMessages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    msg={msg}
                    isCurrentUser={msg.senderUserId === user?.id || msg.senderUserId === user?.userId}
                  />
                ))
              );
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box at Bottom */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-[#E2EBE2] shrink-0">
            {!isResolvedOrClosed ? (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send a reply to ${sellerName}...`}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] shadow-2xs placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !newMessage.trim()}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all duration-150 ${
                    newMessage.trim()
                      ? 'bg-[#1B4D3E] hover:bg-[#143B2F] text-white cursor-pointer active:scale-95 shadow-[#1B4D3E]/20'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            ) : (
              <div className="text-center text-xs text-slate-600 italic bg-[#F8FAF8] p-2.5 rounded-lg border border-slate-200">
                This dispute is marked as <span className="font-bold text-slate-800">{dispute.status}</span>. Messaging is closed.
              </div>
            )}
          </div>
        </div>

        {/* DRAGGABLE RESIZER HANDLE: Stretch / resize Case Summary left or right */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={resetPanelWidth}
          title="Drag left or right to stretch / resize panel size • Double-click to reset"
          className={`hidden md:flex flex-col items-center justify-center w-4 cursor-col-resize select-none shrink-0 group py-4 rounded-full transition-colors ${
            isDragging ? 'bg-[#1B4D3E]/20' : 'hover:bg-[#1B4D3E]/10'
          }`}
        >
          <div
            className={`w-1 rounded-full transition-all duration-150 flex items-center justify-center ${
              isDragging
                ? 'bg-[#1B4D3E] h-20 shadow-md ring-2 ring-[#1B4D3E]/30'
                : 'bg-slate-300 h-12 group-hover:bg-[#1B4D3E] group-hover:h-16'
            }`}
          >
            <GripVertical
              className={`w-3 h-3 transition-colors ${
                isDragging ? 'text-white' : 'text-slate-500 group-hover:text-white'
              }`}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Resizable Vertical Panel About 1st Dispute Raise */}
        <div
          style={{ width: `${rightPanelWidth}px`, minWidth: `${rightPanelWidth}px` }}
          className={`w-full md:w-auto flex flex-col h-full bg-white border border-[#E2EBE2] rounded-2xl shadow-sm overflow-y-auto p-4 space-y-4 shrink-0 ${
            isDragging ? '' : 'transition-[width] duration-100 ease-out'
          }`}
        >
          {/* Header of Dispute Summary */}
          <div className="border-b border-[#E2EBE2] pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Case Summary
              </span>
              {/* Quick Stretch / Resize Controls */}
              <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <button
                  type="button"
                  onClick={() => changePanelWidth(-40)}
                  className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer"
                  title="Narrow panel (-40px)"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={resetPanelWidth}
                  className="px-1.5 h-5 rounded hover:bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer text-[9px]"
                  title="Reset to 290px"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => changePanelWidth(40)}
                  className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer"
                  title="Widen panel (+40px)"
                >
                  +
                </button>
              </div>
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm">{disputeNum}</div>
            <div className="mt-1.5">
              <StatusPill status={dispute.status} />
            </div>

            {/* Buyer Resolution Action Buttons */}
            {!isResolvedOrClosed && (
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#E2EBE2]">
                <button
                  onClick={() => handleResolveDispute('Resolved')}
                  disabled={updatingStatus}
                  className="w-full px-3 py-2 bg-[#1B4D3E] hover:bg-[#143B2F] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                </button>
                <button
                  onClick={() => handleResolveDispute('Closed')}
                  disabled={updatingStatus}
                  className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs border border-slate-300 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Close Ticket
                </button>
              </div>
            )}
          </div>

          {/* Resolution Card if resolved */}
          {dispute.resolutionSummary && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[11px] text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Resolution Note
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-900">{dispute.resolutionSummary}</p>
            </div>
          )}

          {/* 1st Dispute Raise Details */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              1st Dispute Filed Issue
            </span>

            <div>
              <div className="text-[11px] font-semibold text-slate-500">Subject</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{dispute.subject}</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-1">Original Issue Raised</div>
              <div className="text-xs text-slate-800 bg-[#F5F8F5] p-3 rounded-xl border border-[#E2ECE2] italic leading-relaxed">
                "{dispute.description || dispute.initialMessage || dispute.messages?.[0]?.body || dispute.messages?.[0]?.message || dispute.subject}"
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500">Category</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {dispute.category}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500">Filed On</div>
              <div className="text-xs text-slate-700 mt-0.5">
                {openedDate ? new Date(openedDate).toLocaleString() : 'Recent'}
              </div>
            </div>
          </div>

          {/* Order Reference */}
          <div className="pt-3 border-t border-[#E2EBE2] space-y-1.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              Order Reference
            </span>
            <div className="text-xs font-bold text-slate-900">#{dispute.orderNumber}</div>
            <Link
              to={`/orders`}
              className="text-[11px] font-bold text-[#1B4D3E] hover:text-[#15803D] hover:underline inline-block mt-0.5"
            >
              View Order in History →
            </Link>
          </div>

          {/* Involved Parties */}
          <div className="pt-3 border-t border-[#E2EBE2] space-y-2 text-xs">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
              Parties
            </span>
            <div>
              <div className="text-[11px] text-slate-400">Raised By:</div>
              <div className="font-semibold text-slate-800">
                {dispute.buyerName || dispute.raisedByName || 'Anita Desai'} (Buyer)
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Seller:</div>
              <div className="font-semibold text-slate-800">
                {sellerName} (Farmer)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
