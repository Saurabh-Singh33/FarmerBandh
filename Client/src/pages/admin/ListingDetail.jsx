import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Flag,
  Trash2,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Tag,
  Scale
} from 'lucide-react';
import { adminListingsApi } from '../../services/adminApi';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { notify } from '../../context/NotificationContext';

export const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await adminListingsApi.getListingDetail(id);
      setProduct(res);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleFlag = async (reason) => {
    try {
      setActionLoading(true);
      await adminListingsApi.flagListing(id, reason);
      notify.warning('Listing flagged for compliance inspection.');
      setFlagModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to flag listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnflag = async () => {
    try {
      setActionLoading(true);
      await adminListingsApi.unflagListing(id);
      notify.success('Listing flag resolved.');
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to unflag listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (reason) => {
    try {
      setActionLoading(true);
      await adminListingsApi.removeListing(id, reason);
      notify.error('Listing removed from marketplace.');
      setRemoveModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to remove listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setActionLoading(true);
      await adminListingsApi.restoreListing(id);
      notify.success('Listing restored successfully.');
      setRestoreModalOpen(false);
      fetchDetail();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to restore listing.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Listing Specifications...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Listing Not Found</h2>
        <button
          onClick={() => navigate('/admin/listings')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: '#0F172A', color: '#FFF' }}
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const isRemoved = product.status === 'Removed';
  const isFlagged = !!product.isFlagged;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <button
        onClick={() => navigate('/admin/listings')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.4rem 0.8rem',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          backgroundColor: '#FFFFFF',
          color: '#475569',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Listings
      </button>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt=""
                style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8'
                }}
              >
                <Package size={36} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                  {product.name}
                </h1>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: isRemoved ? '#FEE2E2' : '#DCFCE7',
                    color: isRemoved ? '#B91C1C' : '#15803D'
                  }}
                >
                  {product.status}
                </span>
                {isFlagged && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#FEF3C7',
                      color: '#B45309'
                    }}
                  >
                    Flagged
                  </span>
                )}
              </div>
              <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
                Category: <strong>{product.categoryName}</strong> • Listed by <strong>{product.farmerName}</strong> ({product.farmName})
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isFlagged ? (
              <button
                onClick={handleUnflag}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Flag
              </button>
            ) : (
              <button
                onClick={() => setFlagModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #FED7AA',
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Flag size={14} style={{ display: 'inline', marginRight: '4px' }} /> Flag
              </button>
            )}

            {isRemoved ? (
              <button
                onClick={() => setRestoreModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} /> Restore
              </button>
            ) : (
              <button
                onClick={() => setRemoveModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Remove Listing
              </button>
            )}
          </div>
        </div>

        {/* Flag Reason Banner */}
        {product.flaggedReason && (
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={18} color="#B45309" />
            <div style={{ fontSize: '0.85rem', color: '#92400E' }}>
              <strong>Flagged Reason:</strong> {product.flaggedReason}
            </div>
          </div>
        )}

        {/* Specs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.85rem'
          }}
        >
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>Base Price</span>
            <strong style={{ color: '#0F172A', fontSize: '1.1rem' }}>
              ₹{product.pricePerQuintal?.toLocaleString()} / Qtl
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>Available Stock</span>
            <strong style={{ color: '#0F172A' }}>{product.availableQuantityQuintal} Quintals</strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>Quality Grade</span>
            <strong style={{ color: '#0F172A' }}>{product.grade || 'Standard'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>Bulk Discount</span>
            <strong style={{ color: '#0F172A' }}>
              {product.bulkDiscountPercent ? `${product.bulkDiscountPercent}% off` : 'None'}
            </strong>
          </div>
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
          Product Description
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
          {product.description || 'No description provided by farmer.'}
        </p>
      </div>

      {/* Modals */}
      <ReasonModal
        isOpen={flagModalOpen}
        title="Flag Listing"
        description="State reason for flagging this listing for compliance review."
        confirmText="Flag"
        type="warning"
        isLoading={actionLoading}
        onConfirm={handleFlag}
        onCancel={() => setFlagModalOpen(false)}
      />

      <ReasonModal
        isOpen={removeModalOpen}
        title="Remove Listing"
        description="Explain why this listing is being removed from public view."
        confirmText="Remove"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleRemove}
        onCancel={() => setRemoveModalOpen(false)}
      />

      <ConfirmModal
        isOpen={restoreModalOpen}
        title="Restore Listing"
        message="Restore this listing to active marketplace status?"
        confirmText="Restore"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleRestore}
        onCancel={() => setRestoreModalOpen(false)}
      />
    </div>
  );
};

export default ListingDetail;
