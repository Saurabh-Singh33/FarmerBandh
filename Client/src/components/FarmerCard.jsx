import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { BadgeCheck, MapPin, Calendar, Trash2, Edit3, ArrowRight, Store } from 'lucide-react';

export default function FarmerCard({
  farmer,
  isSaved = false,
  note = '',
  onRemove = null,
  onUpdateNote = null,
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState(note || '');

  const handleSaveNote = async () => {
    if (onUpdateNote) {
      await onUpdateNote(farmer.farmerId || farmer.id, currentNote);
    }
    setEditingNote(false);
  };

  const farmerId = farmer.farmerId || farmer.id;
  const farmName = farmer.farmName || farmer.name || 'Farm';
  const location = [farmer.district, farmer.state].filter(Boolean).join(', ') || farmer.location || 'India';
  const initial = farmName.charAt(0).toUpperCase();

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '20px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      transition: 'all 0.2s ease',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #1B4D3E 0%, #15803D 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 4px 10px rgba(27, 77, 62, 0.2)',
              flexShrink: 0
            }}>
              {initial}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {farmName}
                </h3>
                {farmer.verified && (
                  <span style={{
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <BadgeCheck size={11} color="#059669" /> Verified
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={12} color="#9CA3AF" /> {location}
              </p>
            </div>
          </div>

          {isSaved && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(farmerId)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#DC2626';
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Remove from Saved"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Rating and Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StarRating rating={farmer.rating || 0} size="sm" readOnly />
            <span style={{ fontWeight: 700, color: '#1F2937' }}>{Number(farmer.rating || 0).toFixed(1)}</span>
            {farmer.ratingCount !== undefined && (
              <span style={{ color: '#9CA3AF' }}>({farmer.ratingCount})</span>
            )}
          </div>
          {farmer.activeListingsCount !== undefined && (
            <>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>{farmer.activeListingsCount} crops available</span>
            </>
          )}
        </div>

        {/* Notes section for Saved Farmers */}
        {isSaved && (
          <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '12px', backgroundColor: '#FEFDF8', border: '1px solid #FDE68A', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, color: '#92400E', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Private Note
              </span>
              {!editingNote && (
                <button
                  type="button"
                  onClick={() => setEditingNote(true)}
                  style={{ background: 'none', border: 'none', color: '#D97706', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Edit3 size={11} /> Edit
                </button>
              )}
            </div>
            {editingNote ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="e.g. Best price for Sharbati wheat, delivers in 2 days..."
                  rows={2}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #FCD34D', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentNote(note || '');
                      setEditingNote(false);
                    }}
                    style={{ padding: '3px 8px', borderRadius: '6px', background: 'none', border: '1px solid #E5E7EB', fontSize: '0.72rem', color: '#6B7280', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    style={{ padding: '3px 10px', borderRadius: '6px', backgroundColor: '#D97706', color: '#FFFFFF', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: currentNote ? '#374151' : '#9CA3AF', margin: 0, fontStyle: currentNote ? 'normal' : 'italic' }}>
                {currentNote || 'No notes added. Click edit to add a private note.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Bottom Link */}
      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Calendar size={11} /> {farmer.memberSince ? `Since ${new Date(farmer.memberSince).getFullYear()}` : 'Registered Producer'}
        </span>
        <Link
          to={`/farmers/${farmerId}`}
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#15803D',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'gap 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#14532D')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#15803D')}
        >
          View Storefront <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
