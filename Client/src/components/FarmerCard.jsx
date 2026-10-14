import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200 shrink-0">
              {farmName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base">{farmName}</h3>
                {farmer.verified && (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{location}</p>
            </div>
          </div>

          {isSaved && onRemove && (
            <button
              onClick={() => onRemove(farmerId)}
              className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              title="Remove from Saved"
            >
              <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
          )}
        </div>

        {/* Rating and Meta */}
        <div className="flex items-center gap-3 py-2 border-y border-gray-50 text-xs">
          <div className="flex items-center gap-1">
            <StarRating rating={farmer.rating || 0} size="sm" readOnly />
            <span className="font-semibold text-gray-800">{Number(farmer.rating || 0).toFixed(1)}</span>
            {farmer.ratingCount !== undefined && (
              <span className="text-gray-400">({farmer.ratingCount})</span>
            )}
          </div>
          {farmer.activeListingsCount !== undefined && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-gray-600 font-medium">{farmer.activeListingsCount} listings</span>
            </>
          )}
        </div>

        {/* Notes section for Saved Farmers */}
        {isSaved && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider">Your Note</span>
              {!editingNote && (
                <button
                  onClick={() => setEditingNote(true)}
                  className="text-amber-800 hover:underline text-[11px] font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            {editingNote ? (
              <div className="space-y-1.5 mt-1">
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="e.g. Best price for Sharbati wheat, delivers in 2 days..."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setCurrentNote(note || '');
                      setEditingNote(false);
                    }}
                    className="px-2 py-0.5 rounded text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-2.5 py-0.5 bg-amber-600 text-white rounded font-medium hover:bg-amber-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 italic">
                {currentNote || <span className="text-gray-400">No notes yet. Click edit to add a reminder.</span>}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {farmer.memberSince ? `Member since ${new Date(farmer.memberSince).getFullYear()}` : 'Registered Producer'}
        </span>
        <Link
          to={`/farmers/${farmerId}`}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}
