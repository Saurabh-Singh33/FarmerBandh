import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Flag,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle,
  RotateCcw,
  IndianRupee,
  AlertTriangle
} from 'lucide-react';
import { adminListingsApi } from '../../services/adminApi';
import { DataTable } from '../../components/admin/DataTable';
import { ReasonModal } from '../../components/admin/ReasonModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { notify } from '../../context/NotificationContext';

export const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [unfeatureModalOpen, setUnfeatureModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await adminListingsApi.getListings({
        page,
        pageSize: 20,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setListings(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFlag = async (reason) => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      await adminListingsApi.flagListing(selectedProduct.id, reason);
      notify.warning(`Listing '${selectedProduct.name}' flagged for review.`, 'Listing Flagged');
      setFlagModalOpen(false);
      setSelectedProduct(null);
      fetchListings();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to flag listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnflag = async (prod) => {
    try {
      await adminListingsApi.unflagListing(prod.id);
      notify.success(`Flag cleared for '${prod.name}'.`, 'Flag Removed');
      fetchListings();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to unflag listing.');
    }
  };

  const handleRemove = async (reason) => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      await adminListingsApi.removeListing(selectedProduct.id, reason);
      notify.error(`Listing '${selectedProduct.name}' removed from marketplace.`, 'Listing Removed');
      setRemoveModalOpen(false);
      setSelectedProduct(null);
      fetchListings();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to remove listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      await adminListingsApi.restoreListing(selectedProduct.id);
      notify.success(`Listing '${selectedProduct.name}' restored to active status.`, 'Listing Restored');
      setRestoreModalOpen(false);
      setSelectedProduct(null);
      fetchListings();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to restore listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeature = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      await adminListingsApi.featureListing(selectedProduct.id);
      notify.success(`Listing '${selectedProduct.name}' is now featured on marketplace.`, 'Featured');
      setFeatureModalOpen(false);
      setSelectedProduct(null);
      fetchListings();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to feature listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfeature = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      await adminListingsApi.unfeatureListing(selectedProduct.id);
      notify.info(`Listing '${selectedProduct.name}' unfeatured.`, 'Unfeatured');
      setUnfeatureModalOpen(false);
      setSelectedProduct(null);
      fetchListings();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to unfeature listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Product',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
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
            <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {p.name}
              {p.isFeatured && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                >
                  Featured
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {p.categoryName || 'Crop'} • by {p.farmerName}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Price & Stock',
      render: (p) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>
            ₹{p.pricePerQuintal?.toLocaleString()} / Qtl
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {p.availableQuantityQuintal} Qtl available
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (p) => {
        const isFlagged = !!p.isFlagged;
        const isRemoved = p.status === 'Removed';
        const isOutOfStock = p.status === 'OutOfStock';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                width: 'fit-content',
                backgroundColor: isRemoved ? '#FEE2E2' : isOutOfStock ? '#FEF3C7' : '#DCFCE7',
                color: isRemoved ? '#B91C1C' : isOutOfStock ? '#B45309' : '#15803D'
              }}
            >
              {p.status}
            </span>
            {isFlagged && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <AlertTriangle size={11} /> Flagged
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          <button
            onClick={() => navigate(`/admin/listings/${p.id}`)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Eye size={12} /> View
          </button>

          {p.isFeatured ? (
            <button
              onClick={() => {
                setSelectedProduct(p);
                setUnfeatureModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #FDE68A',
                backgroundColor: '#FEFCE8',
                color: '#B45309',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
              title="Remove from featured list"
            >
              Unfeature
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedProduct(p);
                setFeatureModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
              title="Feature on marketplace home"
            >
              <Sparkles size={12} /> Feature
            </button>
          )}

          {p.isFlagged ? (
            <button
              onClick={() => handleUnflag(p)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #86EFAC',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Unflag
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedProduct(p);
                setFlagModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #FED7AA',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <Flag size={12} /> Flag
            </button>
          )}

          {p.status === 'Removed' ? (
            <button
              onClick={() => {
                setSelectedProduct(p);
                setRestoreModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #86EFAC',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <RotateCcw size={12} /> Restore
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedProduct(p);
                setRemoveModalOpen(true);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <Trash2 size={12} /> Remove
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
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
            Listings Moderation
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Review crop offerings, flag prohibited goods, manage featured highlights, and moderate pricing integrity.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/featured-listings')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#059669',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} /> Manage Featured Order
        </button>
      </div>

      <DataTable
        columns={columns}
        data={listings}
        total={total}
        page={page}
        pageSize={20}
        onPageChange={(p) => setPage(p)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search product name, farmer, or slug..."
        isLoading={loading}
        toolbarActions={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '0.8rem',
              color: '#334155',
              outline: 'none',
              fontWeight: 500
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Flagged">Flagged</option>
            <option value="OutOfStock">Out Of Stock</option>
            <option value="Removed">Removed</option>
          </select>
        }
      />

      {/* Flag Modal */}
      <ReasonModal
        isOpen={flagModalOpen}
        title={`Flag Listing: ${selectedProduct?.name}`}
        description="Flagging marks this listing with a warning banner and prioritizes it for compliance review. State the reason below."
        placeholder="Reason for flagging (e.g. suspicious pricing, inaccurate description, non-compliant photo)..."
        confirmText="Flag Listing"
        type="warning"
        isLoading={actionLoading}
        onConfirm={handleFlag}
        onCancel={() => {
          setFlagModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Remove Modal */}
      <ReasonModal
        isOpen={removeModalOpen}
        title={`Remove Listing: ${selectedProduct?.name}`}
        description="Removing this listing will instantly hide it from the marketplace and prevent new purchases. State the reason."
        placeholder="Reason for removal (e.g. policy violation, counterfeit, prohibited item)..."
        confirmText="Remove Listing"
        type="danger"
        isLoading={actionLoading}
        onConfirm={handleRemove}
        onCancel={() => {
          setRemoveModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Restore Modal */}
      <ConfirmModal
        isOpen={restoreModalOpen}
        title={`Restore Listing: ${selectedProduct?.name}`}
        message="Are you sure you want to restore this listing back to the active public marketplace?"
        confirmText="Restore Listing"
        type="success"
        isLoading={actionLoading}
        onConfirm={handleRestore}
        onCancel={() => {
          setRestoreModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Feature Modal */}
      <ConfirmModal
        isOpen={featureModalOpen}
        title={`Feature Product: ${selectedProduct?.name}`}
        message="Pin this crop listing to the featured highlights reel on the marketplace homepage?"
        confirmText="Feature Product"
        type="info"
        isLoading={actionLoading}
        onConfirm={handleFeature}
        onCancel={() => {
          setFeatureModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Unfeature Modal */}
      <ConfirmModal
        isOpen={unfeatureModalOpen}
        title={`Unfeature Product: ${selectedProduct?.name}`}
        message="Remove this product from the featured highlights reel?"
        confirmText="Unfeature"
        type="warning"
        isLoading={actionLoading}
        onConfirm={handleUnfeature}
        onCancel={() => {
          setUnfeatureModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default ManageListings;
