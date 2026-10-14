import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedFarmerApi } from '../../services/savedFarmerApi';
import FarmerCard from '../../components/FarmerCard';
import { notify } from '../../context/NotificationContext';

export default function SavedFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await savedFarmerApi.getSavedFarmers();
      setFarmers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load saved farmers', err);
      notify.error('Could not load saved farmers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (farmerId) => {
    if (!window.confirm('Remove farmer from your saved list?')) return;
    try {
      await savedFarmerApi.removeSavedFarmer(farmerId);
      setFarmers((prev) => prev.filter((f) => f.farmerId !== farmerId && f.id !== farmerId));
      notify.info('Farmer removed from bookmarks.');
    } catch (err) {
      notify.error('Failed to remove farmer.');
    }
  };

  const handleUpdateNote = async (farmerId, notes) => {
    try {
      await savedFarmerApi.saveFarmer(farmerId, notes);
      setFarmers((prev) =>
        prev.map((f) => ((f.farmerId === farmerId || f.id === farmerId) ? { ...f, notes } : f))
      );
      notify.success('Note updated successfully.');
    } catch (err) {
      notify.error('Failed to update note.');
    }
  };

  const filtered = farmers.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const farmName = (f.farmName || '').toLowerCase();
    const name = (f.farmerName || f.name || '').toLowerCase();
    const loc = `${f.district || ''} ${f.state || ''}`.toLowerCase();
    const notes = (f.notes || '').toLowerCase();
    return farmName.includes(q) || name.includes(q) || loc.includes(q) || notes.includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Saved Farmers & Direct Growers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Keep track of your trusted suppliers, add private notes, and access their fresh listings.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="self-start sm:self-auto text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 shadow-2xs"
        >
          + Discover Farmers in Marketplace
        </Link>
      </div>

      {/* Search Bar */}
      {farmers.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved farmers by name, location, or notes..."
            className="w-full text-xs p-3 rounded-2xl border border-gray-200 bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-48" />
          ))}
        </div>
      ) : farmers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 text-2xl flex items-center justify-center mx-auto mb-4 font-bold">
            🔖
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No saved farmers yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            When you find a farmer whose quality and harvest you love, bookmark them to reorder quickly and keep personal supplier notes.
          </p>
          <Link
            to="/marketplace"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-xs transition-colors"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-xs text-gray-500">
          No saved farmers matched your search "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <FarmerCard
              key={item.id || item.farmerId}
              farmer={item}
              isSaved={true}
              note={item.notes}
              onRemove={handleRemove}
              onUpdateNote={handleUpdateNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
