import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { farmerApi } from '../../services/farmerApi';
import { savedFarmerApi } from '../../services/savedFarmerApi';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import { notify } from '../../context/NotificationContext';
import { getProductImageUrl } from '../../services/productImages';
import BundleNegotiateModal from '../../components/BundleNegotiateModal';

export default function FarmerPublicProfile() {
  const { id } = useParams();
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
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-48 bg-gray-200 rounded-3xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h2 className="text-xl font-bold text-gray-800">Farmer Profile Not Found</h2>
        <Link to="/marketplace" className="text-emerald-700 text-sm font-semibold underline mt-2 inline-block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const memberYear = profile.memberSince ? new Date(profile.memberSince).getFullYear() : '2025';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/marketplace"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
        >
          ← Back to Marketplace
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-3xl border border-emerald-200 shrink-0 shadow-2xs">
              {profile.farmName ? profile.farmName.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {profile.farmName}
                </h1>
                {profile.verified && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✓ Verified Producer
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Operated by {profile.fullName || 'Registered Farmer'}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
                <span>📍 {[profile.district, profile.state].filter(Boolean).join(', ') || profile.location || 'India'}</span>
                <span>·</span>
                <span>🌾 Member since {memberYear}</span>
              </div>
            </div>
          </div>

          {/* Action / Bookmark Button */}
          {user?.role?.toLowerCase() === 'buyer' && (
            <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
              <button
                onClick={handleToggleSave}
                disabled={savingBookmark}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 ${
                  isSaved
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                    : 'bg-[#15803D] hover:bg-[#166534] text-white'
                }`}
              >
                <span>{isSaved ? '★' : '☆'}</span>
                <span>{isSaved ? 'Saved Supplier' : 'Save Farmer'}</span>
              </button>
              {isSaved && (
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline self-start sm:self-auto"
                >
                  Edit Note ({savedNotes ? '1 note' : 'Add note'})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Farmer Bio / Story */}
        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">About the Farm</h3>
            <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs text-center">
          <div className="text-xs font-semibold text-gray-500 uppercase">Customer Rating</div>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <StarRating rating={profile.rating || 0} size="sm" readOnly />
            <span className="text-lg font-black text-gray-900">{Number(profile.rating || 0).toFixed(1)}</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{profile.ratingCount || 0} reviews</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs text-center">
          <div className="text-xs font-semibold text-gray-500 uppercase">Fulfilled Orders</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {profile.completedOrdersCount || 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Delivered to buyers</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs text-center">
          <div className="text-xs font-semibold text-gray-500 uppercase">Avg Response Time</div>
          <div className="text-2xl font-black text-gray-900 mt-1">
            {profile.avgResponseTimeHours ? `~${profile.avgResponseTimeHours}h` : '< 4h'}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">On negotiations & orders</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs text-center">
          <div className="text-xs font-semibold text-gray-500 uppercase">Active Crops</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {listings.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Available for dispatch</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('LISTINGS')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'LISTINGS'
              ? 'text-emerald-800 border-b-2 border-emerald-800'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Active Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('REVIEWS')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'REVIEWS'
              ? 'text-emerald-800 border-b-2 border-emerald-800'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Customer Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab 1: Listings Grid */}
      {activeTab === 'LISTINGS' && (
        <div>
          {listings.length >= 2 && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                  🤝
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Multi-Crop Bulk Negotiation
                  </div>
                  <div className="text-xs text-emerald-800">
                    Want to buy multiple crops (e.g. Wheat + Rice) together? Negotiate a custom bundle price with {profile.farmName}!
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBundleModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
              >
                Negotiate Bundle ({listings.length} crops)
              </button>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm">
              This farmer currently has no active listings available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {listings.map((p) => {
                const img = p.imageUrl || getProductImageUrl(p.name, p.categoryName);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-4">
                        <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                          {p.categoryName || 'Agricultural Produce'}
                        </div>
                        <h4 className="font-bold text-gray-900 text-base mt-0.5 line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>Available: {p.availableQuantityQuintal} Qtl</span>
                          <span>Min Order: {p.minOrderQuantityQuintal || 1} Qtl</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between mt-2">
                      <div>
                        <div className="text-base font-black text-emerald-900">
                          ₹{Number(p.pricePerQuintal).toLocaleString('en-IN')}
                          <span className="text-[11px] font-normal text-gray-500"> / Qtl</span>
                        </div>
                      </div>
                      <Link
                        to={`/products/${p.slug || p.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-colors shadow-2xs"
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
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm">
              No customer reviews yet for this farmer.
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {rev.buyerName || 'Verified Buyer'}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StarRating rating={rev.rating} size="sm" readOnly />
                      {rev.productName && (
                        <span className="text-xs text-gray-400">for {rev.productName}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {rev.title && (
                  <h5 className="font-bold text-gray-900 text-sm mt-2">{rev.title}</h5>
                )}
                {rev.body && (
                  <p className="text-xs text-gray-700 leading-relaxed mt-1 whitespace-pre-wrap">
                    {rev.body}
                  </p>
                )}

                {rev.farmerReply && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <span className="font-bold text-emerald-900 block mb-0.5">Farmer's Response:</span>
                    <p className="text-emerald-800">{rev.farmerReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Private Note for {profile.farmName}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              This note is only visible to you. Use it to keep track of quality, delivery times, or negotiated pricing agreements.
            </p>
            <textarea
              value={savedNotes}
              onChange={(e) => setSavedNotes(e.target.value)}
              placeholder="e.g. Reliable delivery of Sharbati wheat, responds fast on WhatsApp..."
              rows={4}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-700 font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-2xs"
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
            farmerLocation: `${profile.district || ''}, ${profile.state || ''}`.replace(/^,\s*/, ''),
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
