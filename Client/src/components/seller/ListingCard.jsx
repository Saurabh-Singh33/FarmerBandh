import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Trash2, Eye, EyeOff, Archive, RefreshCw, Star, Tag } from 'lucide-react';
import { getProductImageUrl } from '../../services/productImages';

export const ListingCard = ({
  listing,
  onPublish,
  onUnpublish,
  onMarkOutOfStock,
  onRestock,
  onDelete
}) => {
  const imageUrl = getProductImageUrl(listing);
  const status = listing.productStatus || 'Active';

  const statusColors = {
    Active: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', label: 'Active' },
    Draft: { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB', label: 'Draft' },
    OutOfStock: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', label: 'Out of Stock' },
    Removed: { bg: '#F3F4F6', color: '#9CA3AF', border: '#E5E7EB', label: 'Removed' }
  };

  const currentStatus = statusColors[status] || statusColors.Active;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      {/* Top Image Banner */}
      <div style={{ position: 'relative', width: '100%', height: '160px', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={listing.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = '/images/products/wheat-grade-a.jpg';
          }}
        />

        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '9999px',
              backgroundColor: currentStatus.bg,
              color: currentStatus.color,
              border: `1px solid ${currentStatus.border}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {currentStatus.label}
          </span>
        </div>

        {/* Grade Pill */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(27, 77, 62, 0.9)',
              color: '#FFFFFF',
              backdropFilter: 'blur(4px)'
            }}
          >
            Grade {listing.grade || 'A'}
          </span>
        </div>

        {listing.rating > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#FFFFFF',
              padding: '2px 7px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Star size={11} fill="#FBBF24" color="#FBBF24" />
            <span>{listing.rating.toFixed(1)}</span>
            {listing.ratingCount > 0 && <span style={{ color: '#D1D5DB' }}>({listing.ratingCount})</span>}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
              {listing.categoryName || 'Produce'}
            </span>
            <h3 style={{ margin: '2px 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
              {listing.name}
            </h3>
          </div>
        </div>

        {/* Pricing & Stock Details */}
        <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B4D3E' }}>
              ₹{listing.pricePerQuintal?.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', marginLeft: '3px' }}>/ quintal</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: status === 'OutOfStock' ? '#DC2626' : '#374151' }}>
              {listing.availableQuantityQuintal} qtl left
            </span>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>MOQ: {listing.minOrderQuantityQuintal || 1} qtl</div>
          </div>
        </div>

        {/* Bulk discount tag */}
        {listing.bulkDiscountPercent > 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: '#065F46',
              backgroundColor: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: '6px',
              marginBottom: '0.75rem',
              width: 'fit-content'
            }}
          >
            <Tag size={12} />
            <span>{listing.bulkDiscountPercent}% off on {listing.bulkDiscountThresholdQuintal || 20}+ qtl</span>
          </div>
        )}

        {listing.description && (
          <p
            style={{
              fontSize: '0.8rem',
              color: '#6B7280',
              margin: '0 0 1rem 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4
            }}
          >
            {listing.description}
          </p>
        )}

        <div style={{ marginTop: 'auto', borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {/* Status action toggle */}
          {status === 'Draft' && (
            <button
              onClick={() => onPublish(listing.id)}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '0.45rem 0.65rem',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Eye size={13} /> Publish
            </button>
          )}

          {status === 'Active' && (
            <>
              <button
                onClick={() => onUnpublish(listing.id)}
                title="Unpublish to Draft"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer'
                }}
              >
                <EyeOff size={13} /> Unpublish
              </button>
              <button
                onClick={() => onMarkOutOfStock(listing.id)}
                title="Mark Out of Stock"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: '#FFFBEB',
                  color: '#B45309',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid #FDE68A',
                  cursor: 'pointer'
                }}
              >
                <Archive size={13} /> Out of Stock
              </button>
            </>
          )}

          {status === 'OutOfStock' && (
            <button
              onClick={() => onRestock(listing.id)}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '0.45rem 0.65rem',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid #A7F3D0',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} /> Restock
            </button>
          )}

          {/* Edit Button */}
          <Link
            to={`/seller/listings/${listing.id}/edit`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem 0.65rem',
              backgroundColor: '#F9FAFB',
              color: '#374151',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid #E5E7EB',
              textDecoration: 'none'
            }}
            title="Edit product details"
          >
            <Edit3 size={13} />
          </Link>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(listing.id)}
            title="Remove product"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem 0.65rem',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid #FECACA',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
