import React, { useEffect, useState } from 'react';
import {
  Mail,
  Send,
  Eye,
  Trash2,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  MessageSquare,
  RefreshCw,
  Edit3,
  Save,
  Check
} from 'lucide-react';
import { contactApi } from '../../services/contactApi';
import { DataTable } from '../../components/admin/DataTable';
import { notify } from '../../context/NotificationContext';

export const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal / Drawer state for viewing & replying
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await contactApi.list({
        page,
        pageSize: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        userType: userTypeFilter !== 'all' ? userTypeFilter : undefined
      });
      setMessages(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      notify.error(err.response?.data?.message || 'Failed to load contact messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter, userTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenDetail = (msg) => {
    setSelectedMessage(msg);
    setReplyText('');
    setAdminNotes(msg.adminNotes || '');
    setStatusDraft(msg.status || 'Pending');
  };

  const handleCloseDetail = () => {
    setSelectedMessage(null);
    setReplyText('');
    setAdminNotes('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedMessage) return;
    try {
      setIsSavingStatus(true);
      const res = await contactApi.updateStatus(selectedMessage.id, {
        status: statusDraft,
        adminNotes: adminNotes.trim()
      });
      notify.success('Status and admin notes updated.');
      setSelectedMessage(res.data);
      fetchMessages();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      notify.error('Please enter reply text before sending.');
      return;
    }

    try {
      setIsSendingReply(true);
      const res = await contactApi.reply(selectedMessage.id, {
        replyText: replyText.trim(),
        adminNotes: adminNotes.trim()
      });
      notify.success(`Reply dispatched to ${selectedMessage.email}!`);
      setSelectedMessage(res.data);
      setReplyText('');
      fetchMessages();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;

    try {
      await contactApi.delete(id);
      notify.success('Contact message deleted.');
      if (selectedMessage?.id === id) {
        handleCloseDetail();
      }
      fetchMessages();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete message.');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    let bg = '#FEF3C7';
    let text = '#B45309';

    if (s === 'replied') {
      bg = '#DCFCE7';
      text = '#15803D';
    } else if (s === 'inreview') {
      bg = '#DBEAFE';
      text = '#1D4ED8';
    } else if (s === 'closed') {
      bg = '#F1F5F9';
      text = '#475569';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 700,
          backgroundColor: bg,
          color: text,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}
      >
        {status}
      </span>
    );
  };

  const getUserTypeBadge = (type) => {
    const t = (type || 'general').toLowerCase();
    let label = 'General';
    let bg = '#F3F4F6';
    let text = '#374151';

    if (t === 'farmer') {
      label = '🧑‍🌾 Farmer';
      bg = '#E8F5E9';
      text = '#1B4D3E';
    } else if (t === 'buyer') {
      label = '🛒 Buyer';
      bg = '#EFF6FF';
      text = '#1E40AF';
    } else if (t === 'partner') {
      label = '🤝 Partner';
      bg = '#FAF5FF';
      text = '#6B21A8';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 600,
          backgroundColor: bg,
          color: text
        }}
      >
        {label}
      </span>
    );
  };

  const columns = [
    {
      header: 'Sender Details',
      render: (m) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>{m.name}</span>
            {getUserTypeBadge(m.userType)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
            <a href={`mailto:${m.email}`} style={{ color: '#059669', textDecoration: 'none' }}>
              {m.email}
            </a>
            {m.phone && <span style={{ marginLeft: '8px' }}>• 📞 {m.phone}</span>}
          </div>
        </div>
      )
    },
    {
      header: 'Subject & Message',
      render: (m) => (
        <div style={{ maxWidth: '340px' }}>
          <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.86rem' }}>{m.subject}</div>
          <div
            style={{
              fontSize: '0.78rem',
              color: '#64748B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: '2px'
            }}
          >
            {m.message}
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (m) => getStatusBadge(m.status)
    },
    {
      header: 'Received At',
      render: (m) => (
        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
          {new Date(m.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}{' '}
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      render: (m) => (
        <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenDetail(m)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#1B4D3E',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Eye size={14} />
            <span>View & Reply</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleDelete(m.id, e)}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #FEE2E2',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              cursor: 'pointer'
            }}
            title="Delete inquiry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '1.75rem clamp(1rem, 2vw, 2.5rem)', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. PAGE HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#E8F5E9',
                color: '#1B4D3E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Mail size={20} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em'
              }}
            >
              Direct Contact Inquiries
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 44px', color: '#64748B', fontSize: '0.88rem' }}>
            Manage direct inquiries from farmers, wholesale buyers, and platform visitors.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMessages}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#334155',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. FILTER TABS & TOOLBAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1.25rem',
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'Pending', 'InReview', 'Replied', 'Closed'].map((st) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid #1B4D3E' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#1B4D3E' : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === 'all' ? 'All Inquiries' : st}
              </button>
            );
          })}
        </div>

        {/* User Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Filter by Role:</span>
          <select
            value={userTypeFilter}
            onChange={(e) => {
              setUserTypeFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '0.82rem',
              color: '#1E293B',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Roles</option>
            <option value="farmer">🧑‍🌾 Farmer</option>
            <option value="buyer">🛒 Wholesale Buyer</option>
            <option value="partner">🤝 Partner</option>
            <option value="general">🌐 General</option>
          </select>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <DataTable
        columns={columns}
        data={messages}
        total={total}
        page={page}
        pageSize={15}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, phone, or subject..."
        isLoading={loading}
        emptyMessage="No contact inquiries found matching your filters."
        onRowClick={(m) => handleOpenDetail(m)}
      />

      {/* 4. DETAIL & DIRECT REPLY MODAL / DRAWER */}
      {selectedMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={handleCloseDetail}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #E2E8F0',
              padding: '1.75rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {selectedMessage.subject}
                  </h2>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Submitted on{' '}
                  {new Date(selectedMessage.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                style={{
                  border: 'none',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Sender Name
                </div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                  {selectedMessage.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Email Address
                </div>
                <div style={{ fontSize: '0.88rem' }}>
                  <a href={`mailto:${selectedMessage.email}`} style={{ color: '#059669', fontWeight: 600 }}>
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Phone
                </div>
                <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 500 }}>
                  {selectedMessage.phone || 'Not provided'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Sender Role
                </div>
                <div style={{ marginTop: '2px' }}>{getUserTypeBadge(selectedMessage.userType)}</div>
              </div>
            </div>

            {/* Inbound Message Content */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px'
                }}
              >
                Message Content:
              </div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.94rem',
                  color: '#1E293B',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            {/* Past Admin Reply (if already replied) */}
            {selectedMessage.adminReplyText && (
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    Past Admin Response Dispatched:
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#15803D' }}>
                    {selectedMessage.repliedAt &&
                      new Date(selectedMessage.repliedAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#14532D', whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.adminReplyText}
                </div>
              </div>
            )}

            {/* Direct Email Reply Box */}
            <div
              style={{
                backgroundColor: '#FAFAF9',
                border: '1px solid #E7E5E4',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Send size={16} color="#1B4D3E" />
                <span style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.92rem' }}>
                  Send Direct Email Reply to {selectedMessage.name}
                </span>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#78716C' }}>
                The user will receive your response directly at <strong>{selectedMessage.email}</strong>. This will
                automatically mark the inquiry as <strong>Replied</strong>.
              </p>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your official administrative response here..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #D6D3D1',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  resize: 'vertical'
                }}
              />
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={isSendingReply || !replyText.trim()}
                  onClick={handleSendReply}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: isSendingReply || !replyText.trim() ? '#A8A29E' : '#1B4D3E',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: isSendingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(27,77,62,0.2)'
                  }}
                >
                  <Send size={14} />
                  <span>{isSendingReply ? 'Sending Email...' : 'Send Direct Email Reply'}</span>
                </button>
              </div>
            </div>

            {/* Status & Internal Notes Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 180px) 1fr auto',
                gap: '12px',
                alignItems: 'end',
                paddingTop: '1rem',
                borderTop: '1px solid #E2E8F0'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                  Update Ticket Status:
                </label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="InReview">In Review</option>
                  <option value="Replied">Replied</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                  Internal Admin Notes (Optional):
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Assigned to logistics officer"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="button"
                disabled={isSavingStatus}
                onClick={handleUpdateStatus}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #059669',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: isSavingStatus ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={14} />
                <span>{isSavingStatus ? 'Saving...' : 'Save Status'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;
