import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Sparkles,
  Package,
  IndianRupee,
  Layers,
  FileText,
  Check
} from 'lucide-react';
import { sellerListingApi } from '../../services/sellerListingApi';
import { productApi } from '../../services/productApi';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';
import { ImageDropzone } from '../../components/ImageDropzone';

const POPULAR_CROP_SUGGESTIONS = [
  'Sharbati Wheat',
  'Basmati Rice',
  'Red Onion',
  'Fresh Tomato',
  'Jyoti Potato',
  'Kesar Mango',
  'G9 Banana',
  'Yellow Maize',
  'Toor Dal',
  'Chana Gram',
  'Organic Turmeric'
];

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
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : null
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
      <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#6B7280' }}>
        <RefreshCw size={36} color="#1B4D3E" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600, color: '#1B4D3E' }}>
          Loading produce listing details...
        </div>
      </div>
    );
  }

  const priceNum = parseFloat(formData.pricePerQuintal) || 0;
  const pricePerKg = priceNum > 0 ? (priceNum / 100).toFixed(2) : '0.00';
  const qtyNum = parseFloat(formData.availableQuantityQuintal) || 0;
  const qtyInTons = qtyNum > 0 ? (qtyNum / 10).toFixed(1) : '0.0';

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '920px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Back button */}
      <Link
        to="/seller/listings"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#4B5563',
          fontSize: '0.88rem',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '1.25rem'
        }}
      >
        <ArrowLeft size={16} /> Back to My Listings
      </Link>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '2.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.85rem',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: '0 0 0.35rem 0'
              }}
            >
              Edit Product Listing
            </h1>
            <span style={{ fontSize: '0.88rem', color: '#6B7280' }}>
              Update stock availability, unit price, photos, or wholesale discount tiers.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>Status:</span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: currentStatus === 'Active' ? '#ECFDF5' : (currentStatus === 'OutOfStock' ? '#FEF2F2' : '#F3F4F6'),
                color: currentStatus === 'Active' ? '#065F46' : (currentStatus === 'OutOfStock' ? '#991B1B' : '#4B5563'),
                border: currentStatus === 'Active' ? '1px solid #A7F3D0' : '1px solid #E5E7EB'
              }}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SECTION 1: CROP DETAILS */}
          <div
            style={{
              backgroundColor: '#F9FBF8',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Package size={18} color="#1B4D3E" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                1. Produce Name & Classification
              </h2>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Produce / Crop Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sharbati Wheat, Red Onion, Kesar Mango..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '9px',
                  fontSize: '0.94rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              />

              {/* Suggestions */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                {POPULAR_CROP_SUGGESTIONS.map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => setFormData((prev) => ({ ...prev, name: sug }))}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      border: formData.name === sug ? '1.5px solid #1B4D3E' : '1px solid #E5E7EB',
                      backgroundColor: formData.name === sug ? '#E8F5E9' : '#FFFFFF',
                      color: formData.name === sug ? '#1B4D3E' : '#4B5563',
                      fontSize: '0.76rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Category *
                </label>
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.72rem 0.85rem',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '9px',
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

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Quality Grade *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { grade: 'A', title: 'Grade A', subtitle: 'Premium' },
                    { grade: 'B', title: 'Grade B', subtitle: 'Standard' },
                    { grade: 'C', title: 'Grade C', subtitle: 'Commercial' }
                  ].map((g) => {
                    const isSelected = formData.grade === g.grade;
                    return (
                      <label
                        key={g.grade}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.6rem 0.4rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #1B4D3E' : '1.5px solid #E5E7EB',
                          backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                          color: isSelected ? '#065F46' : '#4B5563',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <input
                          type="radio"
                          name="grade"
                          value={g.grade}
                          checked={isSelected}
                          onChange={handleChange}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{g.title}</span>
                        <span style={{ fontSize: '0.68rem', color: isSelected ? '#047857' : '#6B7280' }}>
                          {g.subtitle}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & INVENTORY */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <IndianRupee size={18} color="#1B4D3E" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                2. Wholesale Pricing & Stock Inventory
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Price per Quintal (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontWeight: 700 }}>
                    ₹
                  </span>
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
                      padding: '0.72rem 0.85rem 0.72rem 1.8rem',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '9px',
                      fontSize: '0.94rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontWeight: 600
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.76rem', color: '#15803D', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  {priceNum > 0 ? `≈ ₹${pricePerKg} / kg` : ''}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
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
                    padding: '0.72rem 0.85rem',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '9px',
                    fontSize: '0.94rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontWeight: 600
                  }}
                />
                <span style={{ fontSize: '0.76rem', color: '#15803D', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  {qtyNum > 0 ? `≈ ${qtyInTons} Metric Tons` : ''}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
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
                    padding: '0.72rem 0.85rem',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '9px',
                    fontSize: '0.94rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Wholesale Bulk Volume Discount */}
            <div
              style={{
                marginTop: '1.5rem',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                <Sparkles size={16} color="#059669" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                  Wholesale Bulk Volume Discount
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>
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
                      padding: '0.6rem 0.8rem',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5563', marginBottom: '4px' }}>
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
                      padding: '0.6rem 0.8rem',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRODUCE PHOTOGRAPHY (DRAG & DROP + UPLOAD) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Layers size={18} color="#1B4D3E" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                3. Crop Photography (Drag & Drop or Upload)
              </h2>
            </div>

            <ImageDropzone
              value={formData.imageUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              label="Harvest Produce Photo"
            />
          </div>

          {/* SECTION 4: HARVEST DETAILS & NOTES */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <FileText size={18} color="#1B4D3E" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                4. Harvest Timing & Description
              </h2>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Harvest Date
              </label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '0.72rem 0.85rem',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '9px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Description & Produce Notes
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Mention crop moisture levels, packaging, storage conditions..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '9px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1.5rem'
            }}
          >
            <Link
              to="/seller/listings"
              style={{
                padding: '0.75rem 1.4rem',
                borderRadius: '9px',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                border: '1.5px solid #D1D5DB',
                fontSize: '0.92rem',
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
                padding: '0.75rem 2rem',
                borderRadius: '9px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(27,77,62,0.25)',
                cursor: submitting ? 'wait' : 'pointer'
              }}
            >
              <Check size={18} strokeWidth={2.5} />
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
