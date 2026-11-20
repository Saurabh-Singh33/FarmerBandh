import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedFarmerApi } from '../../services/savedFarmerApi';
import FarmerCard from '../../components/FarmerCard';
import { notify } from '../../context/NotificationContext';
import { Bookmark, Search, ArrowRight, Store, Sprout } from 'lucide-react';

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
    <div style={{ maxWidth: '1120px', margin: '2rem auto 4rem auto', padding: '0 1.25rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
            Saved Farmers & Direct Growers
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#6B7280', margin: '6px 0 0 0' }}>
            Keep track of your trusted suppliers, add private notes, and access their fresh listings directly.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="farmer-btn-primary"
          style={{ padding: '9px 18px', fontSize: '0.82rem' }}
        >
          <Sprout size={15} /> Discover Farmers in Marketplace
        </Link>
      </div>

      {/* Search Bar */}
      {farmers.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved farmers by farm name, location, or private notes..."
            style={{
              width: '100%',
              padding: '12px 14px 12px 40px',
              borderRadius: '14px',
              border: '1.5px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              fontSize: '0.88rem',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '1.5rem', height: '160px' }} className="pulse-glow" />
          ))}
        </div>
      ) : farmers.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E7EB', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Bookmark size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>No Saved Farmers Yet</h3>
          <p style={{ fontSize: '0.92rem', color: '#6B7280', maxWidth: '460px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
            When you find a farmer whose produce quality and harvest you trust, bookmark them to reorder quickly and keep personal supplier notes.
          </p>
          <Link
            to="/marketplace"
            className="farmer-btn-primary"
            style={{ display: 'inline-flex', padding: '10px 22px' }}
          >
            Explore Marketplace <ArrowRight size={15} />
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '3rem 2rem', textAlign: 'center', fontSize: '0.9rem', color: '#6B7280' }}>
          No saved farmers matched your search "<strong>{search}</strong>".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
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
