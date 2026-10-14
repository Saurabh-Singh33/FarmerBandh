import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  Package,
  Plus,
  RefreshCw
} from 'lucide-react';
import { adminListingsApi } from '../../services/adminApi';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { notify } from '../../context/NotificationContext';

export const FeaturedListings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unfeatureTarget, setUnfeatureTarget] = useState(null);
  const navigate = useNavigate();

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const res = await adminListingsApi.getFeaturedListings();
      setItems(res || []);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load featured listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // re-assign display orders
    const updated = newItems.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));
    setItems(updated);
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      const payload = items.map((item, idx) => ({
        id: item.id,
        displayOrder: idx + 1
      }));
      await adminListingsApi.reorderFeaturedListings(payload);
      notify.success('Featured listings display order updated successfully.', 'Order Saved');
      fetchFeatured();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reorder featured listings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnfeature = async () => {
    if (!unfeatureTarget) return;
    try {
      await adminListingsApi.unfeatureListing(unfeatureTarget.productId);
      notify.info(`Removed '${unfeatureTarget.productName}' from featured list.`, 'Unfeatured');
      setUnfeatureTarget(null);
      fetchFeatured();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to unfeature listing.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Featured Highlights...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
            Featured Listings Management
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Arrange priority ranking for products pinned to the buyer marketplace home hero banner.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/admin/listings')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Products
          </button>
          <button
            onClick={handleSaveOrder}
            disabled={saving || items.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Ranking Order'}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '3.5rem',
            textAlign: 'center',
            color: '#64748B'
          }}
        >
          <Sparkles size={36} color="#94A3B8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1E293B' }}>No Featured Listings</h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem' }}>
            Feature high-grade crops from verified farmers to spotlight them on the homepage.
          </p>
          <button
            onClick={() => navigate('/admin/listings')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Browse Listings Directory
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '0.85rem 1rem', width: '60px', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                  RANK
                </th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                  PRODUCT
                </th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                  FARMER
                </th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                  PRICE / QTL
                </th>
                <th style={{ padding: '0.85rem 1rem', width: '120px', textAlign: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                  REORDER
                </th>
                <th style={{ padding: '0.85rem 1rem', width: '100px', textAlign: 'right', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {it.imageUrl ? (
                        <img
                          src={it.imageUrl}
                          alt=""
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8'
                          }}
                        >
                          <Package size={20} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{it.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{it.categoryName || 'Crop'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#334155', fontWeight: 600 }}>
                    {it.farmerName}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#0F172A' }}>
                    ₹{it.pricePerQuintal?.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: idx === 0 ? '#CBD5E1' : '#334155',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: idx === items.length - 1 ? '#CBD5E1' : '#334155',
                          cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setUnfeatureTarget(it)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Unfeature
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Unfeature Modal */}
      <ConfirmModal
        isOpen={!!unfeatureTarget}
        title="Unfeature Product"
        message={`Remove '${unfeatureTarget?.productName}' from the featured spotlight?`}
        confirmText="Remove Spotlight"
        type="warning"
        onConfirm={handleUnfeature}
        onCancel={() => setUnfeatureTarget(null)}
      />
    </div>
  );
};

export default FeaturedListings;
