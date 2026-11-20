import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { farmerApi } from '../../services/farmerApi';
import { savedFarmerApi } from '../../services/savedFarmerApi';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import { notify } from '../../context/NotificationContext';
import { getProductImageUrl } from '../../services/productImages';
import BundleNegotiateModal from '../../components/BundleNegotiateModal';
import {
  ArrowLeft,
  Sprout,
  BadgeCheck,
  MapPin,
  Calendar,
  Star,
  Bookmark,
  BookmarkCheck,
  Handshake,
  PackageCheck,
  Clock,
  Layers,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Edit3,
  X,
  Store,
  ShoppingBag
} from 'lucide-react';

export default function FarmerPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('LISTINGS'); // LISTINGS, REVIEWS

  // Bookmark state
  const [isSaved, setIsSaved] = useState(false);
  const [savedNotes, setSavedNotes] = useState('');
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profData, listData, revData] = await Promise.all([
          farmerApi.getFarmerProfile(id),
          farmerApi.getFarmerListings(id, 1, 20).catch(() => ({ items: [] })),
          farmerApi.getFarmerReviews(id, 1, 20).catch(() => ({ items: [] })),
        ]);
        setProfile(profData);
        setListings(listData?.items || (Array.isArray(listData) ? listData : []));
        setReviews(revData?.items || (Array.isArray(revData) ? revData : []));

        if (user && user?.role?.toLowerCase() === 'buyer') {
          const check = await savedFarmerApi.checkSavedFarmer(id).catch(() => ({ isSaved: false }));
          setIsSaved(check?.isSaved || false);
          setSavedNotes(check?.notes || '');
        }
      } catch (err) {
        console.error('Failed to load farmer profile', err);
        notify.error('Could not load farmer profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, user]);

  const handleToggleSave = async () => {
    if (!user) {
      notify.info('Please sign in as a buyer to bookmark farmers.');
      return;
    }
    setSavingBookmark(true);
    try {
      if (isSaved) {
        await savedFarmerApi.removeSavedFarmer(id);
        setIsSaved(false);
        notify.info('Farmer removed from bookmarks.');
      } else {
        await savedFarmerApi.saveFarmer(id, savedNotes);
        setIsSaved(true);
        notify.success('Farmer added to your saved suppliers!');
        setShowNoteModal(true);
      }
    } catch (err) {
      notify.error('Failed to update bookmark status.');
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      await savedFarmerApi.saveFarmer(id, savedNotes);
      notify.success('Notes saved!');
      setShowNoteModal(false);
    } catch (err) {
      notify.error('Failed to save notes.');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1120px', margin: '2rem auto', padding: '0 1.25rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '2.5rem', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '84px', height: '84px', borderRadius: '22px', backgroundColor: '#E2E8F0' }} className="pulse-glow" />
            <div style={{ flex: 1 }}>
              <div style={{ height: '32px', width: '280px', backgroundColor: '#E2E8F0', borderRadius: '8px', marginBottom: '12px' }} className="pulse-glow" />
              <div style={{ height: '18px', width: '180px', backgroundColor: '#F1F5F9', borderRadius: '6px' }} className="pulse-glow" />
            </div>
          </div>
          <div style={{ height: '14px', width: '80%', backgroundColor: '#F1F5F9', borderRadius: '6px' }} className="pulse-glow" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '110px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '18px' }} className="pulse-glow" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: '550px', margin: '4rem auto', textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
          <Store size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Farmer Profile Not Found</h2>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>The producer storefront you are looking for does not exist or is currently offline.</p>
        <Link to="/marketplace" className="farmer-btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to Marketplace
        </Link>
      </div>
    );
  }

  const memberYear = profile.memberSince ? new Date(profile.memberSince).getFullYear() : '2026';
  const initialLetter = profile.farmName ? profile.farmName.charAt(0).toUpperCase() : 'F';
  const locationText = [profile.district, profile.state].filter(Boolean).join(', ') || profile.location || 'India';

  return (
    <div className="farmer-store-container">
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/marketplace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#15803D',
            fontSize: '0.88rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#14532D')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#15803D')}
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="farmer-store-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          {/* Avatar and Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div className="farmer-store-avatar">
              {initialLetter}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
                  {profile.farmName}
                </h1>
                {profile.verified && (
                  <span className="farmer-verified-pill">
                    <BadgeCheck size={14} color="#059669" /> Verified Producer
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.92rem', color: '#4B5563', fontWeight: 500, margin: '2px 0 8px 0' }}>
                Operated by <strong style={{ color: '#1F2937' }}>{profile.fullName || 'Registered Farmer'}</strong>
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: '#6B7280', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#059669" /> {locationText}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} color="#6B7280" /> Member since {memberYear}
                </span>
              </div>
            </div>
          </div>

          {/* Action / Bookmark Button */}
          {user?.role?.toLowerCase() === 'buyer' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingBookmark}
                className={isSaved ? 'farmer-btn-saved' : 'farmer-btn-primary'}
                style={{ opacity: savingBookmark ? 0.7 : 1 }}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                <span>{isSaved ? 'Saved Supplier' : 'Save Farmer'}</span>
              </button>

              {isSaved && (
                <button
                  type="button"
                  onClick={() => setShowNoteModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px'
                  }}
                >
                  <Edit3 size={12} /> {savedNotes ? 'Edit Private Note' : 'Add Note'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Farmer Bio / Story */}
        {profile.bio && (
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={13} color="#059669" /> About the Farm & Cultivation
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: '1.65', margin: 0, maxWidth: '850px' }}>
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Metric 1 */}
        <div className="farmer-stat-card">
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" /> Customer Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
            <StarRating rating={profile.rating || 0} size="sm" readOnly />
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>
              {Number(profile.rating || 0).toFixed(1)}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
            {profile.ratingCount || 0} reviews
          </div>
        </div>

        {/* Metric 2 */}
        <div className="farmer-stat-card">
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <PackageCheck size={13} color="#059669" /> Fulfilled Orders
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803D', marginTop: '6px' }}>
            {profile.completedOrdersCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
            Delivered to buyers
          </div>
        </div>

        {/* Metric 3 */}
        <div className="farmer-stat-card">
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Clock size={13} color="#0284C7" /> Avg Response Time
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', marginTop: '6px' }}>
            {profile.avgResponseTimeHours ? `~${profile.avgResponseTimeHours}h` : '< 4h'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
            On negotiations & orders
          </div>
        </div>

        {/* Metric 4 */}
        <div className="farmer-stat-card">
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Sprout size={13} color="#059669" /> Active Crops
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803D', marginTop: '6px' }}>
            {listings.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
            Available for dispatch
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '2px solid #E5E7EB', marginBottom: '1.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('LISTINGS')}
          className={`farmer-tab-btn ${activeTab === 'LISTINGS' ? 'active' : ''}`}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sprout size={16} /> Active Listings ({listings.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REVIEWS')}
          className={`farmer-tab-btn ${activeTab === 'REVIEWS' ? 'active' : ''}`}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} /> Customer Reviews ({reviews.length})
          </span>
        </button>
      </div>

      {/* Tab 1: Listings Grid */}
      {activeTab === 'LISTINGS' && (
        <div>
          {/* Multi-Crop Bundle Negotiation Banner */}
          {listings.length >= 2 && (
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
              border: '1.5px solid #A7F3D0',
              borderRadius: '20px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
                  flexShrink: 0
                }}>
                  <Handshake size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#14532D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Multi-Crop Bulk Negotiation Available
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '2px' }}>
                    Want to purchase multiple crops together? Negotiate a custom discounted package directly with {profile.farmName}.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBundleModalOpen(true)}
                className="farmer-btn-primary"
                style={{ padding: '9px 18px', fontSize: '0.82rem' }}
              >
                <Sparkles size={14} /> Negotiate Bundle ({listings.length} crops)
              </button>
            </div>
          )}

          {listings.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.92rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Sprout size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>No Active Produce Listed</h3>
              <p style={{ margin: 0 }}>This farmer currently has no active listings available for dispatch.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
              {listings.map((p) => {
                const img = p.imageUrl || getProductImageUrl(p.name, p.categoryName);
                return (
                  <div key={p.id} className="crop-listing-card">
                    <div>
                      {/* Product Image with Category Pill */}
                      <div style={{ position: 'relative', width: '100%', height: '190px', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                        <img
                          src={img}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/products/wheat-grain.jpg';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '12px',
                          backgroundColor: 'rgba(21, 128, 61, 0.92)',
                          backdropFilter: 'blur(6px)',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Sprout size={12} /> {p.categoryName || 'Produce'}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Grade {p.grade || 'A'} • Direct Farm Harvest
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '4px 0 10px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
                          <span>Available: <strong style={{ color: '#111827' }}>{p.availableQuantityQuintal} Qtl</strong></span>
                          <span>Min: <strong style={{ color: '#111827' }}>{p.minOrderQuantityQuintal || 1} Qtl</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div style={{ padding: '1rem 1.25rem', backgroundColor: '#FAFDF9', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block' }}>Farm Price</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803D', lineHeight: 1.1 }}>
                          ₹{Number(p.pricePerQuintal).toLocaleString('en-IN')}
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6B7280' }}> / Qtl</span>
                        </div>
                      </div>

                      <Link
                        to={`/products/${p.slug || p.id}`}
                        className="farmer-btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '12px' }}
                      >
                        View & Buy →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reviews List */}
      {activeTab === 'REVIEWS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.92rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <MessageSquare size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>No Customer Reviews Yet</h3>
              <p style={{ margin: 0 }}>Be the first verified customer to purchase produce and share your feedback for {profile.farmName}.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem' }}>
                        {rev.buyerName || 'Verified Buyer'}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <StarRating rating={rev.rating} size="sm" readOnly />
                      {rev.productName && (
                        <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>for <strong style={{ color: '#374151' }}>{rev.productName}</strong></span>
                      )}
                    </div>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                    {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {rev.title && (
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0.5rem 0 0.25rem 0' }}>
                    {rev.title}
                  </h5>
                )}

                {rev.body && (
                  <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.6', margin: '0.25rem 0 0 0', whiteSpace: 'pre-wrap' }}>
                    {rev.body}
                  </p>
                )}

                {rev.farmerReply && (
                  <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '14px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', fontSize: '0.84rem' }}>
                    <span style={{ fontWeight: 800, color: '#14532D', display: 'block', marginBottom: '2px' }}>
                      Farmer's Response:
                    </span>
                    <p style={{ color: '#166534', margin: 0, lineHeight: '1.5' }}>
                      {rev.farmerReply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 30px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Private Note for {profile.farmName}
              </h3>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              This private note is only visible to your buyer account. Keep track of harvest quality, dispatch timelines, or custom wholesale agreements.
            </p>
            <textarea
              value={savedNotes}
              onChange={(e) => setSavedNotes(e.target.value)}
              placeholder="e.g. Consistent high-grade Sharbati wheat, responds promptly on WhatsApp, clean bagging..."
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1.5px solid #D1D5DB', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', marginBottom: '1.25rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                style={{ padding: '8px 16px', borderRadius: '12px', background: 'none', border: '1px solid #E5E7EB', fontSize: '0.82rem', color: '#4B5563', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="farmer-btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Crop Bundle Negotiate Modal */}
      {isBundleModalOpen && profile && (
        <BundleNegotiateModal
          isOpen={isBundleModalOpen}
          onClose={() => setIsBundleModalOpen(false)}
          farmerGroup={{
            farmerId: profile.id,
            farmerName: profile.farmName,
            farmerLocation: locationText,
            items: listings.map((l) => ({
              productId: l.id,
              productName: l.name,
              categoryName: l.categoryName,
              imageUrl: l.imageUrl || getProductImageUrl(l.name, l.categoryName),
              quantityQuintal: Math.max(l.minOrderQuantityQuintal || 1, 2),
              unitPricePerQuintal: l.pricePerQuintal,
            })),
          }}
        />
      )}
    </div>
  );
}
