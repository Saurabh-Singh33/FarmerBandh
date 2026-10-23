import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../services/productApi';
import { reviewApi } from '../../services/reviewApi';
import { negotiationApi } from '../../services/negotiationApi';
import { savedFarmerApi } from '../../services/savedFarmerApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import { getProductImageUrl } from '../../services/productImages';
import { notify } from '../../context/NotificationContext';
import { ArrowLeft, Sprout, BadgeCheck, UserCheck, MapPin, Star, ShoppingBag, Handshake, Bookmark, Store, X, Sparkles, Minus, Plus, Lock, Tag, TrendingDown } from 'lucide-react';

export const ProductDetails = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [addedToCartJustNow, setAddedToCartJustNow] = useState(false);

  // Phase 5: Negotiation & Saved Farmer states
  const [isSavedFarmer, setIsSavedFarmer] = useState(false);
  const [savingFarmer, setSavingFarmer] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [negotiateQty, setNegotiateQty] = useState(1);
  const [negotiatePrice, setNegotiatePrice] = useState('');
  const [negotiateMsg, setNegotiateMsg] = useState('');
  const [submittingNegotiate, setSubmittingNegotiate] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const data = await productApi.getByIdOrSlug(idOrSlug);
        setProduct(data);
        setQuantity(data.minOrderQuantityQuintal || 1);

        const similarData = await productApi.getSimilar(idOrSlug);
        setSimilar(similarData || []);

        const revData = await reviewApi.getProductReviews(data.id).catch(() => []);
        setReviews(Array.isArray(revData) ? revData : []);

        const fId = data.farmer?.id || data.farmerId;
        if (fId && user && user?.role?.toLowerCase() === 'buyer') {
          savedFarmerApi.checkSavedFarmer(fId)
            .then((res) => setIsSavedFarmer(res?.isSaved || false))
            .catch(() => {});
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [idOrSlug, user]);

  const handleToggleSaveFarmer = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const fId = product?.farmer?.id || product?.farmerId;
    if (!fId) return;

    setSavingFarmer(true);
    try {
      if (isSavedFarmer) {
        await savedFarmerApi.removeSavedFarmer(fId);
        setIsSavedFarmer(false);
        notify.info('Farmer removed from saved list.');
      } else {
        await savedFarmerApi.saveFarmer(fId, '');
        setIsSavedFarmer(true);
        notify.success(`${product.farmer?.farmName || 'Farmer'} saved to your bookmarks!`);
      }
    } catch (err) {
      notify.error('Failed to update bookmark.');
    } finally {
      setSavingFarmer(false);
    }
  };

  const handleSubmitNegotiation = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    const priceNum = Number(negotiatePrice);
    if (!priceNum || priceNum <= 0) {
      notify.error('Please specify a valid price per quintal');
      return;
    }
    const qtyNum = Number(negotiateQty);
    if (!qtyNum || qtyNum < (product.minOrderQuantityQuintal || 1)) {
      notify.error(`Minimum order quantity is ${product.minOrderQuantityQuintal || 1} Quintals`);
      return;
    }

    setSubmittingNegotiate(true);
    try {
      const res = await negotiationApi.createNegotiation({
        productId: product.id,
        quantityQuintal: qtyNum,
        offeredPricePerQuintal: priceNum,
        initialOfferPrice: priceNum,
        message: negotiateMsg.trim(),
      });
      notify.success('Negotiation initiated! Opening discussion thread...');
      setShowNegotiateModal(false);
      const targetId = res.id || res.negotiation?.id;
      navigate(`/negotiations/${targetId}`);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to submit negotiation offer');
    } finally {
      setSubmittingNegotiate(false);
    }
  };


  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '2rem', animate: 'pulse' }}>
          <div style={{ height: '32px', backgroundColor: '#F3F4F6', width: '60%', borderRadius: '4px', marginBottom: '1rem' }} />
          <div style={{ height: '20px', backgroundColor: '#F3F4F6', width: '30%', borderRadius: '4px', marginBottom: '2rem' }} />
          <div style={{ height: '100px', backgroundColor: '#F3F4F6', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <h2 style={{ color: '#1B4D3E', fontFamily: 'Playfair Display, serif' }}>Product Not Found</h2>
        <p style={{ color: '#6B7280' }}>The requested crop listing does not exist or has been unlisted.</p>
        <button
          onClick={() => navigate('/marketplace')}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '24px',
            backgroundColor: '#1B4D3E',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/marketplace')}
        style={{
          background: 'none',
          border: 'none',
          color: '#2E7D32',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Left Column: Crop Hero & Details */}
        <div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', padding: '0', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
            
            {/* Product Hero Image */}
            <div style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/products/tomato-fresh.jpg';
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                backgroundColor: 'rgba(27, 77, 62, 0.92)',
                backdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Sprout size={14} /> {product.categoryName} • Grade {product.grade}
                </span>
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              {/* Category & Verified Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sprout size={18} color="#2E7D32" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {product.categoryName} • Grade {product.grade}
                  </span>
                </div>
                {product.verified === 'Verified' && (
                  <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', border: '1px solid #C8E6C9', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <BadgeCheck size={14} color="#2E7D32" /> Verified Farm
                  </span>
                )}
                {product.isFeatured && (
                  <span style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '4px', letterSpacing: '0.03em' }}>
                    <Sparkles size={14} fill="#FFFFFF" /> Featured Produce
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1B4D3E', margin: '0 0 1rem 0', fontSize: '2.2rem' }}>
                {product.name}
              </h1>

            {/* Price Banner */}
            <div style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#E65100' }}>
                  ₹{product.pricePerQuintal.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#5D4037', fontWeight: 600 }}> / quintal</span>
              </div>
              {product.bulkDiscountPercent > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ backgroundColor: '#E65100', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>
                    {product.bulkDiscountPercent}% OFF
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#795548', marginTop: '4px' }}>
                    for orders ≥ {product.bulkDiscountThresholdQuintal} Qtl
                  </div>
                </div>
              )}
            </div>

            {/* Specs Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#F9FBF8', padding: '1rem', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Available Qty</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B4D3E', marginTop: '2px' }}>{product.availableQuantityQuintal} Quintals</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Min Order Qty</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B4D3E', marginTop: '2px' }}>{product.minOrderQuantityQuintal} Quintal</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Harvest Date</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B4D3E', marginTop: '2px' }}>
                  {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'Fresh Crop'}
                </div>
              </div>
            </div>

                {product.description && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#1B4D3E', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Crop Description</h3>
                    <p style={{ color: '#4B5563', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Right Column: Farmer Mini-Card & Action Block */}
        <div>
          {/* Farmer Card */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1B4D3E', fontSize: '1.1rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
              Farmer Profile
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#1B4D3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={22} color="#1B4D3E" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '1.05rem' }}>{product.farmer.farmName}</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="#6B7280" /> {product.district}, {product.state}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#374151', padding: '0.5rem 0', borderTop: '1px solid #F9FAFB' }}>
              <span>Seller Rating:</span>
              <span style={{ fontWeight: 700, color: '#E65100', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Star size={13} fill="#E65100" color="#E65100" /> {product.farmer.rating} / 5.0
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#374151', padding: '0.5rem 0' }}>
              <span>Verification Status:</span>
              <span style={{ fontWeight: 700, color: '#2E7D32', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <BadgeCheck size={14} color="#2E7D32" /> {product.farmer.verified}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6' }}>
              <Link
                to={`/farmers/${product.farmer.id || product.farmerId}`}
                style={{ textDecoration: 'none', color: '#1B4D3E', fontSize: '0.82rem', fontWeight: 700 }}
              >
                View Farm Profile →
              </Link>
              {(!user || user?.role?.toLowerCase() === 'buyer') && (
                <button
                  type="button"
                  onClick={handleToggleSaveFarmer}
                  disabled={savingFarmer}
                  style={{
                    background: 'none',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: isSavedFarmer ? '#B45309' : '#4B5563',
                    backgroundColor: isSavedFarmer ? '#FEF3C7' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Bookmark size={13} fill={isSavedFarmer ? '#B45309' : 'none'} />
                  {isSavedFarmer ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
          </div>

          {/* Purchasing Box */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1B4D3E', fontSize: '1.1rem' }}>Order Quantity</h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Quantity (Quintals)
              </label>
              <input
                type="number"
                min={product.minOrderQuantityQuintal}
                max={product.availableQuantityQuintal}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.minOrderQuantityQuintal, Math.min(product.availableQuantityQuintal, Number(e.target.value))))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                Min: {product.minOrderQuantityQuintal} Qtl | Max: {product.availableQuantityQuintal} Qtl
              </span>
            </div>

            {/* Total Estimated Price */}
            <div style={{ backgroundColor: '#F9FBF8', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 600 }}>Estimated Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B4D3E' }}>
                ₹{(quantity * product.pricePerQuintal).toLocaleString()}
              </span>
            </div>

            {/* Instant Confirmation Banner with Direct View Cart CTA */}
            {addedToCartJustNow && (
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#065F46', fontWeight: 600 }}>
                  ✓ {quantity} quintal(s) in Cart
                </div>
                <Link
                  to="/cart"
                  style={{
                    backgroundColor: '#15803D',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 4px rgba(21,128,61,0.2)'
                  }}
                >
                  View Cart 🛒 →
                </Link>
              </div>
            )}

            {/* Buttons */}
            <button
              disabled={actionLoading || product.availableQuantityQuintal <= 0}
              onClick={async () => {
                if (!user) {
                  navigate('/auth');
                  return;
                }
                setActionLoading(true);
                try {
                  await addToCart(product.id, quantity);
                  setAddedToCartJustNow(true);
                  notify.success(`Added ${quantity} quintal(s) of ${product.name} to your cart!`);
                } catch (err) {
                  notify.error(err.message || 'Failed to add item to cart');
                } finally {
                  setActionLoading(false);
                }
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '24px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                marginBottom: '0.75rem',
                fontSize: '0.95rem',
                opacity: actionLoading ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={18} /> {actionLoading ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              disabled={actionLoading || product.availableQuantityQuintal <= 0}
              onClick={async () => {
                if (!user) {
                  navigate('/auth');
                  return;
                }
                setActionLoading(true);
                try {
                  await addToCart(product.id, quantity);
                  notify.success(`Proceeding to checkout with ${product.name}...`);
                  navigate('/cart');
                } catch (err) {
                  notify.error(err.message || 'Failed to proceed to cart');
                  setActionLoading(false);
                }
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '24px',
                backgroundColor: '#E65100',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                opacity: actionLoading ? 0.7 : 1
              }}
            >
              Buy Now
            </button>

            {(!user || user?.role?.toLowerCase() === 'buyer') && (
              <button
                type="button"
                disabled={actionLoading || product.availableQuantityQuintal <= 0}
                onClick={() => {
                  if (!user) {
                    navigate('/auth');
                    return;
                  }
                  setNegotiateQty(quantity);
                  setNegotiatePrice(Math.round(product.pricePerQuintal * 0.9));
                  setNegotiateMsg(`Looking to purchase ${quantity} quintals. Can you offer ₹${Math.round(product.pricePerQuintal * 0.9)}/quintal?`);
                  setShowNegotiateModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '24px',
                  backgroundColor: '#F0FDF4',
                  color: '#15803D',
                  fontWeight: 700,
                  border: '1.5px solid #BBF7D0',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  marginTop: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Handshake size={18} /> Negotiate Bulk Price
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={{ marginTop: '3.5rem', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1B4D3E', margin: 0, fontSize: '1.6rem' }}>
              Customer Reviews ({reviews.length})
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <StarRating rating={Math.round(product.rating || 5)} size="md" />
              <span style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '0.95rem' }}>
                {product.rating?.toFixed(1) || '5.0'} out of 5.0
              </span>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>• {product.ratingCount || reviews.length} verified ratings</span>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6B7280', fontSize: '0.9rem' }}>
            No buyer reviews yet for this crop batch. Reviews are automatically verified from delivered orders.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid #F9FAFB', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StarRating rating={rev.rating} size="sm" />
                      {rev.title && <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{rev.title}</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                      By {rev.buyerName || 'Verified Buyer'} • {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {rev.comment && (
                  <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: '1.5', margin: '0.5rem 0 0 0' }}>
                    "{rev.comment}"
                  </p>
                )}

                {rev.farmerReply && (
                  <div style={{ marginTop: '0.75rem', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <UserCheck size={15} /> Farmer Response:
                    </div>
                    <div style={{ color: '#15803D' }}>{rev.farmerReply}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar Products Grid */}
      {similar.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1B4D3E', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
            Similar Crops in {product.categoryName}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {similar.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/products/${item.slug || item.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                }}
              >
                <div style={{ height: '130px', width: '100%', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                  <img
                    src={getProductImageUrl(item)}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/products/tomato-fresh.jpg';
                    }}
                  />
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sprout size={13} /> {item.category}
                  </div>
                  <h4 style={{ color: '#1B4D3E', margin: '0 0 0.4rem 0', fontFamily: 'Playfair Display, serif', fontSize: '1.05rem' }}>{item.name}</h4>
                  <div style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={13} /> {item.farmerName}
                  </div>
                  <div style={{ fontWeight: 700, color: '#E65100', fontSize: '1.1rem' }}>₹{item.pricePerQuintal.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 400 }}>/ Qtl</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negotiate Price Modal */}
      {showNegotiateModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          style={{ zIndex: 1000 }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#15803D] to-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-emerald-800/20 shrink-0">
                  🤝
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Negotiate {product.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-bold text-slate-800">{product.farmer?.farmName}</span>
                    {product.farmer?.district && (
                      <span className="text-slate-400">· {product.farmer?.district}, {product.farmer?.state}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNegotiateModal(false)}
                className="w-9 h-9 rounded-full bg-white/80 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all duration-150 hover:rotate-90 cursor-pointer shadow-2xs"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNegotiation} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Quick Target Discount Chips */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Quick Target Discount
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Listed: ₹{Number(product.pricePerQuintal).toLocaleString('en-IN')}/q
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((pct) => {
                    const discountedRate = Math.max(1, Math.round(product.pricePerQuintal * (1 - pct / 100)));
                    const isSelected = Number(negotiatePrice) === discountedRate;
                    return (
                      <button
                        type="button"
                        key={pct}
                        onClick={() => setNegotiatePrice(discountedRate)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#15803D] to-[#166534] text-white border-[#15803D] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        {pct}% Off (₹{discountedRate.toLocaleString('en-IN')})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume & Target Rate Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Volume (Quintals) *
                  </label>
                  <div className="inline-flex w-full items-center rounded-xl border border-slate-200 bg-slate-50/60 p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setNegotiateQty(Math.max(product.minOrderQuantityQuintal || 1, Number(negotiateQty) - 1))}
                      disabled={Number(negotiateQty) <= (product.minOrderQuantityQuintal || 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={product.minOrderQuantityQuintal || 1}
                      max={product.availableQuantityQuintal}
                      value={negotiateQty}
                      onChange={(e) => setNegotiateQty(Number(e.target.value))}
                      className="flex-1 text-center text-xs font-black text-slate-900 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setNegotiateQty(Math.min(product.availableQuantityQuintal, Number(negotiateQty) + 1))}
                      disabled={Number(negotiateQty) >= product.availableQuantityQuintal}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Min {product.minOrderQuantityQuintal || 1} · Available {product.availableQuantityQuintal} Qtl
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Target Rate (₹/q) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={product.pricePerQuintal}
                      value={negotiatePrice}
                      onChange={(e) => setNegotiatePrice(e.target.value)}
                      placeholder={`Listed: ₹${product.pricePerQuintal}`}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs font-black text-slate-900 outline-none transition-all shadow-2xs"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-slate-400">Listed: ₹{Number(product.pricePerQuintal).toLocaleString('en-IN')}/q</span>
                    {Number(negotiatePrice) < product.pricePerQuintal && Number(negotiatePrice) > 0 && (
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        -{Math.round(((product.pricePerQuintal - Number(negotiatePrice)) / product.pricePerQuintal) * 100)}% off
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Deal Summary Receipt Card */}
              {(() => {
                const totalListedVal = (product.pricePerQuintal || 0) * (Number(negotiateQty) || 0);
                const proposedTotalVal = (Number(negotiatePrice) || 0) * (Number(negotiateQty) || 0);
                const totalSavingsVal = Math.max(0, totalListedVal - proposedTotalVal);
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B2E1D] via-[#10432B] to-[#0A2618] text-white shadow-lg border border-emerald-700/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-300/80">Proposed Order Value</div>
                        <div className="text-xl sm:text-2xl font-black text-white">
                          ₹{Number(proposedTotalVal).toLocaleString('en-IN')}
                        </div>
                      </div>
                      {totalSavingsVal > 0 && (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-amber-300 border border-emerald-500/30 text-xs font-bold inline-block">
                            Save ₹{Number(totalSavingsVal).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-emerald-800/60 flex items-center gap-1.5 text-[10px] text-emerald-200/80">
                      <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>100% Escrow protected. Farmers have 48h to accept or counter.</span>
                    </div>
                  </div>
                );
              })()}

              {/* Message to Farmer */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Message to Farmer (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['⚡ Urgent Delivery Needed', '🤝 Regular Wholesale Buyer', '💳 Immediate Payment Ready'].map((chip, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNegotiateMsg((prev) => prev ? `${prev} ${chip}` : chip)}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] font-medium text-slate-600 border border-slate-200/70 cursor-pointer transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <textarea
                  value={negotiateMsg}
                  onChange={(e) => setNegotiateMsg(e.target.value)}
                  placeholder="Introduce yourself or mention required delivery schedule..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 outline-none resize-none transition-all shadow-2xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNegotiateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNegotiate}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 via-[#15803D] to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-800/25 flex items-center gap-1.5 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {submittingNegotiate ? 'Submitting...' : 'Send Offer to Farmer 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

