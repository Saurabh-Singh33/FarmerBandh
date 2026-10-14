import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw, AlertCircle, Eye, EyeOff, Archive } from 'lucide-react';
import { sellerListingApi } from '../../services/sellerListingApi';
import { productApi } from '../../services/productApi';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshDashboard } = useSeller();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Active');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    grade: 'A',
    pricePerQuintal: '',
    availableQuantityQuintal: '',
    minOrderQuantityQuintal: '1',
    bulkDiscountPercent: '0',
    bulkDiscountThresholdQuintal: '',
    harvestDate: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cats, listing] = await Promise.all([
          productApi.listCategories(),
          sellerListingApi.getListing(id)
        ]);
        setCategories(cats || []);
        if (listing) {
          setCurrentStatus(listing.productStatus || 'Active');
          setFormData({
            name: listing.name || '',
            categoryId: listing.categoryId || '',
            grade: listing.grade || 'A',
            pricePerQuintal: listing.pricePerQuintal != null ? String(listing.pricePerQuintal) : '',
            availableQuantityQuintal: listing.availableQuantityQuintal != null ? String(listing.availableQuantityQuintal) : '',
            minOrderQuantityQuintal: listing.minOrderQuantityQuintal != null ? String(listing.minOrderQuantityQuintal) : '1',
            bulkDiscountPercent: listing.bulkDiscountPercent != null ? String(listing.bulkDiscountPercent) : '0',
            bulkDiscountThresholdQuintal: listing.bulkDiscountThresholdQuintal != null ? String(listing.bulkDiscountThresholdQuintal) : '',
            harvestDate: listing.harvestDate ? listing.harvestDate.substring(0, 10) : '',
            description: listing.description || '',
            imageUrl: listing.imageUrl || ''
          });
        }
      } catch (err) {
        console.error('Error loading listing:', err);
        notify.error('Could not load listing details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify.error('Produce name is required.');
      return;
    }
    const price = parseFloat(formData.pricePerQuintal);
    const qty = parseFloat(formData.availableQuantityQuintal);

    if (isNaN(price) || price <= 0) {
      notify.error('Price per quintal must be greater than zero.');
      return;
    }
    if (isNaN(qty) || qty < 0) {
      notify.error('Available stock cannot be negative.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        grade: formData.grade,
        pricePerQuintal: price,
        availableQuantityQuintal: qty,
        minOrderQuantityQuintal: parseFloat(formData.minOrderQuantityQuintal) || 1,
        bulkDiscountPercent: parseFloat(formData.bulkDiscountPercent) || 0,
        bulkDiscountThresholdQuintal: formData.bulkDiscountThresholdQuintal
          ? parseFloat(formData.bulkDiscountThresholdQuintal)
          : null,
        harvestDate: formData.harvestDate ? new Date(formData.harvestDate).toISOString() : null,
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl.trim() || null
      };

      await sellerListingApi.updateListing(id, payload);
      notify.success('Listing details updated successfully.');
      refreshDashboard();
      navigate('/seller/listings');
    } catch (err) {
      console.error('Error updating listing:', err);
      notify.error(err?.response?.data?.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading listing details...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box' }}>
      <Link
        to="/seller/listings"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#6B7280',
          fontSize: '0.88rem',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '1rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Listings
      </Link>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: 0
              }}
            >
              Edit Product Listing
            </h1>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              Update stock availability, unit price, or wholesale discount tiers.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Status:</span>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: currentStatus === 'Active' ? '#ECFDF5' : (currentStatus === 'OutOfStock' ? '#FEF2F2' : '#F3F4F6'),
                color: currentStatus === 'Active' ? '#065F46' : (currentStatus === 'OutOfStock' ? '#991B1B' : '#4B5563')
              }}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Row 1: Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Crop Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Category *
              </label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Grade & Harvest Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Quality Grade
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['A', 'B', 'C'].map((g) => (
                  <label
                    key={g}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: formData.grade === g ? '2px solid #1B4D3E' : '1px solid #D1D5DB',
                      backgroundColor: formData.grade === g ? '#ECFDF5' : '#FFFFFF',
                      color: formData.grade === g ? '#065F46' : '#4B5563',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="grade"
                      value={g}
                      checked={formData.grade === g}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    Grade {g}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Harvest Date
              </label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Row 3: Pricing & Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Price / Quintal (₹) *
              </label>
              <input
                type="number"
                name="pricePerQuintal"
                required
                min="1"
                step="0.01"
                value={formData.pricePerQuintal}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Available Stock (Quintals) *
              </label>
              <input
                type="number"
                name="availableQuantityQuintal"
                required
                min="0"
                step="0.1"
                value={formData.availableQuantityQuintal}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Min Order Quantity (Quintals)
              </label>
              <input
                type="number"
                name="minOrderQuantityQuintal"
                min="0.1"
                step="0.1"
                value={formData.minOrderQuantityQuintal}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Row 4: Wholesale Bulk Volume Discount */}
          <div
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '1.25rem'
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
              Wholesale Bulk Discount
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#4B5563', marginBottom: '4px' }}>
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  name="bulkDiscountPercent"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.bulkDiscountPercent}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#4B5563', marginBottom: '4px' }}>
                  Threshold Quantity (Quintals)
                </label>
                <input
                  type="number"
                  name="bulkDiscountThresholdQuintal"
                  min="1"
                  value={formData.bulkDiscountThresholdQuintal}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 5: Image URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {/* Row 6: Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Description & Quality Notes
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderTop: '1px solid #F3F4F6',
              paddingTop: '1.5rem',
              marginTop: '1rem'
            }}
          >
            <Link
              to="/seller/listings"
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: '8px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #D1D5DB',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.7rem 1.6rem',
                borderRadius: '8px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 2px 5px rgba(27,77,62,0.25)',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
