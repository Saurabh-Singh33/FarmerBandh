import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Check,
  Sparkles,
  Info,
  Calendar,
  Layers,
  IndianRupee,
  Package,
  FileText
} from 'lucide-react';
import { sellerListingApi } from '../../services/sellerListingApi';
import { productApi } from '../../services/productApi';
import { notify } from '../../context/NotificationContext';
import { useSeller } from '../../context/SellerContext';
import { ImageDropzone, PRESET_IMAGES } from '../../components/ImageDropzone';

const POPULAR_CROP_SUGGESTIONS = [
  { name: 'Sharbati Wheat', categoryKeyword: 'grain', defaultImage: '/images/products/wheat-grade-a.jpg' },
  { name: 'Basmati Rice', categoryKeyword: 'grain', defaultImage: '/images/products/basmati-rice.jpg' },
  { name: 'Red Onion', categoryKeyword: 'veg', defaultImage: '/images/products/onion-red.jpg' },
  { name: 'Fresh Tomato', categoryKeyword: 'veg', defaultImage: '/images/products/tomato-fresh.jpg' },
  { name: 'Jyoti Potato', categoryKeyword: 'veg', defaultImage: '/images/products/potato-jyoti.jpg' },
  { name: 'Kesar Mango', categoryKeyword: 'fruit', defaultImage: '/images/products/mango-kesar.jpg' },
  { name: 'G9 Banana', categoryKeyword: 'fruit', defaultImage: '/images/products/banana-g9.jpg' },
  { name: 'Yellow Maize', categoryKeyword: 'grain', defaultImage: '/images/products/yellow-maize.jpg' },
  { name: 'Toor Dal', categoryKeyword: 'pulse', defaultImage: '/images/products/toor-dal.jpg' },
  { name: 'Chana Gram', categoryKeyword: 'pulse', defaultImage: '/images/products/chana-gram.jpg' },
  { name: 'Organic Turmeric', categoryKeyword: 'spice', defaultImage: '/images/products/turmeric-finger.jpg' }
];

export const AddProduct = () => {
  const navigate = useNavigate();
  const { refreshDashboard, verificationStatus } = useSeller();

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
    harvestDate: new Date().toISOString().substring(0, 10),
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

    // Auto-match category when seller enters custom produce name
    if (name === 'name' && value.trim()) {
      const lower = value.toLowerCase();
      const matched = categories.find((c) => {
        const cName = c.name.toLowerCase();
        if (lower.includes('wheat') || lower.includes('rice') || lower.includes('maize') || lower.includes('corn') || lower.includes('barley') || lower.includes('millet')) {
          return cName.includes('grain');
        }
        if (lower.includes('tomato') || lower.includes('onion') || lower.includes('potato') || lower.includes('garlic') || lower.includes('ginger') || lower.includes('vegetable')) {
          return cName.includes('veg');
        }
        if (lower.includes('mango') || lower.includes('banana') || lower.includes('apple') || lower.includes('orange') || lower.includes('fruit')) {
          return cName.includes('fruit');
        }
        if (lower.includes('dal') || lower.includes('chana') || lower.includes('gram') || lower.includes('pulse')) {
          return cName.includes('pulse');
        }
        if (lower.includes('turmeric') || lower.includes('chilli') || lower.includes('pepper') || lower.includes('cardamom') || lower.includes('spice')) {
          return cName.includes('spice');
        }
        return false;
      });

      if (matched) {
        setFormData((prev) => ({ ...prev, categoryId: matched.id }));
      }
    }
  };

  const handleSelectCropSuggestion = (item) => {
    setFormData((prev) => {
      const next = { ...prev, name: item.name };
      // Auto-set category if available
      const matched = categories.find((c) => c.name.toLowerCase().includes(item.categoryKeyword));
      if (matched) {
        next.categoryId = matched.id;
      }
      // If user hasn't uploaded a custom photo, use suggestion's clean preset photo
      if (!prev.imageUrl || prev.imageUrl.startsWith('/images/products/')) {
        next.imageUrl = item.defaultImage;
      }
      return next;
    });
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
        imageUrl: formData.imageUrl ? formData.imageUrl.trim() : null,
        saveAsDraft
      };

      const isApproved =
        String(verificationStatus).toLowerCase() === 'verified' ||
        String(verificationStatus) === '2' ||
        String(verificationStatus).toLowerCase() === 'approved';

      await sellerListingApi.createListing(payload);
      notify.success(
        saveAsDraft
          ? 'Listing saved as draft.'
          : isApproved
          ? 'Produce listed live on Marketplace!'
          : 'Produce listing saved! It will appear to buyers once Admin approves your seller account.'
      );
      refreshDashboard();
      navigate('/seller/listings');
    } catch (err) {
      console.error('Error creating listing:', err);
      notify.error(err?.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const priceNum = parseFloat(formData.pricePerQuintal) || 0;
  const pricePerKg = priceNum > 0 ? (priceNum / 100).toFixed(2) : '0.00';
  const qtyNum = parseFloat(formData.availableQuantityQuintal) || 0;
  const qtyInTons = qtyNum > 0 ? (qtyNum / 10).toFixed(1) : '0.0';
  const discountPercent = parseFloat(formData.bulkDiscountPercent) || 0;
  const discountedPricePerQuintal = discountPercent > 0 && priceNum > 0
    ? (priceNum * (1 - discountPercent / 100)).toFixed(2)
    : null;

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '920px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Top Breadcrumb Link */}
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
          marginBottom: '1.25rem',
          transition: 'color 0.15s ease'
        }}
      >
        <ArrowLeft size={16} /> Back to My Listings
      </Link>

      {/* Main Container Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '2.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}
      >
        {/* Title Header */}
        <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: '0 0 0.35rem 0'
            }}
          >
            Add New Produce Listing
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
            Enter your crop harvest details, specify wholesale quantity and pricing, and upload authentic produce photos.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SECTION 1: CROP IDENTITY */}
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
                1. Produce Details & Classification
              </h2>
            </div>

            {/* Custom Produce Name Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#374151' }}>
                  Produce / Crop Name *
                </label>
                <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                  Enter any custom produce variety name
                </span>
              </div>

              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Sharbati Wheat 147, Red Nashik Onion, Kesar Mango, Fresh Potato..."
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '9px',
                  fontSize: '0.94rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#1B4D3E')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
              />

              {/* Quick Crop Suggestion Chips */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.4rem' }}>
                  <Sparkles size={13} color="#059669" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563' }}>
                    Quick suggestions (click to auto-fill name & category):
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {POPULAR_CROP_SUGGESTIONS.map((sug) => {
                    const isSelected = formData.name.toLowerCase() === sug.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={sug.name}
                        onClick={() => handleSelectCropSuggestion(sug)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          border: isSelected ? '1.5px solid #1B4D3E' : '1px solid #E5E7EB',
                          backgroundColor: isSelected ? '#E8F5E9' : '#FFFFFF',
                          color: isSelected ? '#1B4D3E' : '#4B5563',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        {sug.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category & Quality Grade Grid */}
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
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Categorization helps wholesale buyers filter produce accurately
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Quality Grade *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { grade: 'A', title: 'Grade A', subtitle: 'Premium Export / Retail' },
                    { grade: 'B', title: 'Grade B', subtitle: 'Standard Wholesale' },
                    { grade: 'C', title: 'Grade C', subtitle: 'Processing / Bulk' }
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
                          transition: 'all 0.15s ease',
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
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{g.title}</span>
                        <span style={{ fontSize: '0.68rem', color: isSelected ? '#047857' : '#6B7280', marginTop: '2px' }}>
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
              {/* Price / Quintal */}
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
                    placeholder="e.g. 2650"
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
                <span style={{ fontSize: '0.76rem', color: priceNum > 0 ? '#15803D' : '#6B7280', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  {priceNum > 0 ? `≈ ₹${pricePerKg} / kg (1 Quintal = 100 kg)` : '1 Quintal = 100 kg'}
                </span>
              </div>

              {/* Available Stock */}
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
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
                    padding: '0.72rem 0.85rem',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '9px',
                    fontSize: '0.94rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontWeight: 600
                  }}
                />
                <span style={{ fontSize: '0.76rem', color: qtyNum > 0 ? '#15803D' : '#6B7280', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  {qtyNum > 0 ? `≈ ${qtyInTons} Metric Tons available for dispatch` : 'Total harvest quantity currently in storage'}
                </span>
              </div>

              {/* Min Order Quantity */}
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
                <span style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Minimum volume a buyer must purchase per transaction
                </span>
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
                  Wholesale Bulk Volume Discount (Optional)
                </span>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  Boosts large buyer orders
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
                    placeholder="e.g. 5"
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
                    placeholder="e.g. 25"
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

              {discountedPricePerQuintal && formData.bulkDiscountThresholdQuintal && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                  💡 Orders of {formData.bulkDiscountThresholdQuintal}+ quintals automatically get {discountPercent}% off (effective price: ₹{discountedPricePerQuintal}/quintal).
                </div>
              )}
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
                4. Harvest Timing & Quality Notes
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
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
                    padding: '0.72rem 0.85rem',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '9px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Recent harvest dates increase buyer trust and search rank
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Description & Produce Notes
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Mention crop moisture levels, organic farming methods, jute bag packaging (50kg bags), storage conditions, or farm gate loading terms..."
                value={formData.description}
                onChange={handleChange}
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

          {/* FORM ACTIONS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1.5rem',
              flexWrap: 'wrap'
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
                padding: '0.75rem 1.4rem',
                borderRadius: '9px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #D1D5DB',
                color: '#374151',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'all 0.15s ease'
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
                gap: '8px',
                padding: '0.75rem 2rem',
                borderRadius: '9px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: submitting ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(27,77,62,0.25)',
                transition: 'all 0.15s ease',
                opacity: submitting ? 0.7 : 1
              }}
            >
              <Check size={18} strokeWidth={2.5} />
              {submitting ? 'Publishing Produce...' : 'Publish Listing to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
