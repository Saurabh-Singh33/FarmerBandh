import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Sparkles, Image as ImageIcon } from 'lucide-react';
import { sellerListingApi } from '../../services/sellerListingApi';
import { productApi } from '../../services/productApi';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';

const PRESET_IMAGES = [
  { label: 'Wheat', url: '/images/products/wheat-grade-a.jpg' },
  { label: 'Rice', url: '/images/products/basmati-rice.jpg' },
  { label: 'Tomato', url: '/images/products/tomato-fresh.jpg' },
  { label: 'Onion', url: '/images/products/onion-red.jpg' },
  { label: 'Potato', url: '/images/products/potato-jyoti.jpg' },
  { label: 'Mango', url: '/images/products/mango-kesar.jpg' },
  { label: 'Banana', url: '/images/products/banana-g9.jpg' },
  { label: 'Corn/Maize', url: '/images/products/yellow-maize.jpg' },
  { label: 'Toor Dal', url: '/images/products/toor-dal.jpg' },
  { label: 'Chana', url: '/images/products/chana-gram.jpg' },
  { label: 'Turmeric', url: '/images/products/turmeric-finger.jpg' }
];

export const AddProduct = () => {
  const navigate = useNavigate();
  const { refreshDashboard } = useSeller();

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
    imageUrl: '/images/products/wheat-grade-a.jpg'
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await productApi.listCategories();
        setCategories(list || []);
        if (list && list.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: list[0].id }));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!formData.name.trim()) {
      notify.error('Please enter a produce or crop name.');
      return;
    }
    if (!formData.categoryId) {
      notify.error('Please select a category.');
      return;
    }
    const price = parseFloat(formData.pricePerQuintal);
    const qty = parseFloat(formData.availableQuantityQuintal);

    if (isNaN(price) || price <= 0) {
      notify.error('Price per quintal must be greater than zero.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      notify.error('Available stock must be greater than zero.');
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
        imageUrl: formData.imageUrl.trim() || null,
        saveAsDraft
      };

      await sellerListingApi.createListing(payload);
      notify.success(saveAsDraft ? 'Listing saved as draft.' : 'Produce listed live on Marketplace!');
      refreshDashboard();
      navigate('/seller/listings');
    } catch (err) {
      console.error('Error creating listing:', err);
      notify.error(err?.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Back button */}
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
        <h1
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1B4D3E',
            margin: '0 0 0.5rem 0'
          }}
        >
          Add New Produce Listing
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: '0 0 2rem 0' }}>
          Provide crop harvest specifics, wholesale grade, quantity, and pricing.
        </p>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Row 1: Crop Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Produce / Crop Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Sharbati Wheat, Red Onion, Kesar Mango"
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
                placeholder="e.g. 2650"
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
                min="0.1"
                step="0.1"
                placeholder="e.g. 150"
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

          {/* Row 4: Wholesale Bulk Discount Incentives */}
          <div
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
              <Sparkles size={16} color="#059669" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                Wholesale Bulk Volume Discount (Optional)
              </span>
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
                  placeholder="e.g. 5"
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
                  placeholder="e.g. 25"
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

          {/* Row 5: Product Photo & Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Crop Photo (Select Preset or Provide Image URL)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {PRESET_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: img.url }))}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: '6px',
                    border: formData.imageUrl === img.url ? '2px solid #1B4D3E' : '1px solid #D1D5DB',
                    backgroundColor: formData.imageUrl === img.url ? '#ECFDF5' : '#FFFFFF',
                    color: formData.imageUrl === img.url ? '#065F46' : '#4B5563',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {img.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                name="imageUrl"
                placeholder="Or paste custom image URL..."
                value={formData.imageUrl}
                onChange={handleChange}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <div
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img
                  src={formData.imageUrl || '/images/products/wheat-grade-a.jpg'}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/products/wheat-grade-a.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Description & Quality Notes
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe grain moisture, purity, organic practices, bag packaging, or pickup terms..."
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

          {/* Form Actions */}
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
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.7rem 1.4rem',
                borderRadius: '8px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #D1D5DB',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} /> Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.7rem 1.5rem',
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
              <Eye size={16} /> Publish to Marketplace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
