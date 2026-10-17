import React, { useState } from 'react';
import {
  Star,
  Clock,
  CheckCircle2,
  ThumbsUp,
  MapPin,
  TrendingUp,
  Filter,
  PlusCircle,
  X,
  MessageSquareQuote,
  ShieldCheck,
  Award,
  Sparkles,
  Tractor,
  ShoppingBag,
  Store,
  ChevronRight
} from 'lucide-react';
import { SproutIcon } from './SocialIcons';

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Ramesh Patel',
    location: 'Anand, Gujarat',
    role: 'Organic Vegetable Grower',
    roleType: 'farmer',
    avatarText: 'RP',
    avatarBg: 'from-emerald-700 to-green-600',
    usageDuration: 'Using FarmerBandh for 1.5 Years',
    durationCategory: 'long',
    rating: 5,
    verified: true,
    verifiedType: 'Verified Grower',
    headline: 'Eliminated middleman commissions completely — saved over ₹1.2L this past year alone.',
    review:
      'I have been using FarmerBandh continuously for 18 months now, starting with our winter harvest in late 2023. Prior to this, local traders in the APMC mandi would routinely deduct 25% commission and take weeks to clear payments. On FarmerBandh, direct buyers from Ahmedabad negotiate openly. Money lands straight in my SBI account within 24 hours of delivery confirmation. I will never sell through middlemen again.',
    metric: '+38% Net Income',
    metricLabel: 'vs old mandi prices',
    produce: '🍅 Organic Tomatoes & Okra',
    dealsCount: '52 Orders Completed',
    date: 'Member since Oct 2023 · Reviewed 1 week ago',
    helpful: 47,
  },
  {
    id: 'rev-2',
    name: 'Chef Ananya Sen',
    location: 'Ahmedabad, Gujarat',
    role: 'Head Chef & Co-Owner, The Herbivore Table',
    roleType: 'buyer',
    avatarText: 'AS',
    avatarBg: 'from-amber-600 to-emerald-700',
    usageDuration: 'Active Buyer for 10 Months',
    durationCategory: 'medium',
    rating: 5,
    verified: true,
    verifiedType: 'Verified Commercial Buyer',
    headline: 'Farm-to-kitchen produce within 14 hours of harvesting. Our guests notice the difference.',
    review:
      'We joined FarmerBandh 10 months ago when expanding our farm-to-table bistro. We used to struggle with inconsistent vegetable grading from vegetable wholesalers. Here, we lock in recurring weekly orders with certified farmers in Kheda and Anand. The bundled negotiation tool lets us contract bell peppers, fresh herbs, and heirloom tomatoes in a single order with total transparency.',
    metric: '99.4% Freshness Score',
    metricLabel: 'Zero transit spoilage',
    produce: '🌿 Exotic Greens, Peppers & Herbs',
    dealsCount: '86 Deliveries Received',
    date: 'Member since Dec 2023 · Reviewed 3 days ago',
    helpful: 39,
  },
  {
    id: 'rev-3',
    name: 'Devendra Singh Jadeja',
    location: 'Mehsana, Gujarat',
    role: 'Wheat & Mustard Commercial Farmer',
    roleType: 'farmer',
    avatarText: 'DJ',
    avatarBg: 'from-emerald-800 to-teal-700',
    usageDuration: 'Trading for 2+ Years (Founding Seller)',
    durationCategory: 'long',
    rating: 5,
    verified: true,
    verifiedType: 'Verified Gold Grower',
    headline: 'Sold 18 tons of Sharbati wheat in one week without distressed pricing.',
    review:
      'I have been on this platform since early 2023 when it was in its initial stages. In traditional selling, harvest season means market glut and forced distress pricing. Through FarmerBandh, bulk flour mills and grocery cooperatives bid on my harvest well before harvest day. The multi-crop counter offers and escrow safety give farmers actual bargaining power for the first time.',
    metric: '18 Tons Traded',
    metricLabel: '₹340/quintal above MSP',
    produce: '🌾 Sharbati Wheat & Yellow Mustard',
    dealsCount: '34 Bulk Contracts',
    date: 'Member since Feb 2023 · Reviewed 2 weeks ago',
    helpful: 63,
  },
  {
    id: 'rev-4',
    name: 'Vikram Mehta',
    location: 'Surat, Gujarat',
    role: 'Procurement Director, Gujarat Fresh Marts (6 Outlets)',
    roleType: 'buyer',
    avatarText: 'VM',
    avatarBg: 'from-teal-700 to-green-700',
    usageDuration: 'Using for 8 Months (Daily Sourcing)',
    durationCategory: 'medium',
    rating: 5,
    verified: true,
    verifiedType: 'Verified Enterprise Buyer',
    headline: 'Escrow dispute protection gives our procurement team complete peace of mind.',
    review:
      'We have been purchasing weekly for 8 months across 6 supermarket branches. What impressed us most is the platform security. On one occasion, a rainstorm dampened half a potato crate in transit; the dispute arbitration system resolved the partial refund in 4 hours without any bitter arguments. Direct farmer relationships mean our shelves carry the freshest crops in South Gujarat.',
    metric: '₹4.8L Saved',
    metricLabel: 'annual wholesale savings',
    produce: '🥔 Potatoes, Onions & Brassicas',
    dealsCount: '114 Orders Fulfilled',
    date: 'Member since Feb 2024 · Reviewed 1 month ago',
    helpful: 31,
  },
  {
    id: 'rev-5',
    name: 'Sunita Ben Rabari',
    location: 'Bhuj, Kutch',
    role: 'Smallholder & Women Agrarian Collective Lead',
    roleType: 'farmer',
    avatarText: 'SR',
    avatarBg: 'from-green-700 to-emerald-600',
    usageDuration: 'Selling on FarmerBandh for 7 Months',
    durationCategory: 'medium',
    rating: 5,
    verified: true,
    verifiedType: 'Verified Collective Lead',
    headline: 'Our women’s self-help group now accesses high-paying urban buyers directly.',
    review:
      'I started 7 months ago after receiving guidance from the FarmerBandh regional field coordinator. Before this, rural women farmers in our taluka had zero direct transport connections to big cities. Now, we aggregate seasonal drumsticks, dates, and cluster beans. We set our own reserve price and buyers pay guaranteed escrow deposits before dispatch.',
    metric: '42 Women Empowered',
    metricLabel: 'In our cooperative cluster',
    produce: '🌴 Kutch Dates, Guar & Moringa',
    dealsCount: '28 Group Shipments',
    date: 'Member since Mar 2024 · Reviewed 3 weeks ago',
    helpful: 55,
  },
  {
    id: 'rev-6',
    name: 'Karan Malhotra',
    location: 'Rajkot, Gujarat',
    role: 'Wholesale Grain & Pulse Aggregator',
    roleType: 'buyer',
    avatarText: 'KM',
    avatarBg: 'from-emerald-900 to-green-800',
    usageDuration: 'Using Platform for 1 Year 2 Months',
    durationCategory: 'long',
    rating: 5,
    verified: true,
    verifiedType: 'Verified Grain Trader',
    headline: 'Transparent lot inspections and direct farmer chats cut transaction cycle from days to hours.',
    review:
      'Been an active commercial buyer on FarmerBandh for 14 months. The platform replaced endless chaotic phone calls with structured digital negotiation, verified farmer KYC certificates, and automated PDF tax invoices. You know the exact moisture grade and harvest timestamp before transferring a single rupee.',
    metric: '98.8% Fulfillment',
    metricLabel: 'On-schedule delivery rate',
    produce: '🫘 Toor Dal, Gram & Cumin Seeds',
    dealsCount: '67 Commercial Trades',
    date: 'Member since Aug 2023 · Reviewed 1 month ago',
    helpful: 28,
  },
];

export const TestimonialsSection = () => {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'farmer', 'buyer', 'long'
  const [helpfulClicked, setHelpfulClicked] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state for new review
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    role: '',
    roleType: 'farmer',
    usageDuration: 'Using FarmerBandh for 6 Months',
    rating: 5,
    headline: '',
    review: '',
    produce: '',
    metric: '+25% Profit Improvement',
  });

  const handleHelpful = (id) => {
    if (helpfulClicked[id]) return;
    setHelpfulClicked((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.review.trim()) {
      alert('Please fill in your name and review experience.');
      return;
    }

    const initials = formData.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'FB';

    const newReview = {
      id: `rev-${Date.now()}`,
      name: formData.name,
      location: formData.location || 'Gujarat, India',
      role: formData.role || (formData.roleType === 'farmer' ? 'Crop Producer' : 'Produce Buyer'),
      roleType: formData.roleType,
      avatarText: initials,
      avatarBg: formData.roleType === 'farmer' ? 'from-emerald-700 to-green-600' : 'from-teal-700 to-emerald-800',
      usageDuration: formData.usageDuration,
      durationCategory: formData.usageDuration.includes('Year') ? 'long' : 'medium',
      rating: Number(formData.rating),
      verified: true,
      verifiedType: formData.roleType === 'farmer' ? 'Verified Platform Grower' : 'Verified Community Buyer',
      headline: formData.headline || 'Excellent experience trading directly on FarmerBandh',
      review: formData.review,
      metric: formData.metric || 'Direct Verified Trade',
      metricLabel: 'Platform verified trade',
      produce: formData.produce ? `🌾 ${formData.produce}` : '🌱 Fresh Agro Produce',
      dealsCount: 'Verified Trade Member',
      date: 'Just now · Verified Community Review',
      helpful: 1,
    };

    setReviews([newReview, ...reviews]);
    setIsModalOpen(false);
    setToastMessage('Thank you! Your experience has been published to the community board.');
    setTimeout(() => setToastMessage(''), 5000);

    // Reset form
    setFormData({
      name: '',
      location: '',
      role: '',
      roleType: 'farmer',
      usageDuration: 'Using FarmerBandh for 6 Months',
      rating: 5,
      headline: '',
      review: '',
      produce: '',
      metric: '+25% Profit Improvement',
    });
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'farmer') return r.roleType === 'farmer';
    if (activeFilter === 'buyer') return r.roleType === 'buyer';
    if (activeFilter === 'long') return r.durationCategory === 'long' || r.usageDuration.toLowerCase().includes('year');
    return true;
  });

  return (
    <section
      id="community-reviews"
      style={{
        backgroundColor: '#F3F6F2',
        position: 'relative',
        padding: '5.5rem 1.5rem',
        borderTop: '1px solid #E5EBE3',
        borderBottom: '1px solid #E5EBE3',
        overflow: 'hidden',
      }}
    >
      {/* Background soft ambient accents */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(187, 247, 208, 0.4) 0%, rgba(243, 246, 242, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #BBF7D0',
              padding: '0.4rem 1.1rem',
              borderRadius: '9999px',
              color: '#1B4D3E',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(27,77,62,0.06)',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={16} color="#16A34A" />
            <span>Real Voices · Transparent Track Record</span>
          </div>

          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
              fontWeight: 700,
              color: '#1B4D3E',
              lineHeight: 1.2,
              margin: '0 0 1rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Trusted by Growers & Buyers <br />
            <span style={{ color: '#059669' }}>Across Seasons & Harvests</span>
          </h2>

          <p
            style={{
              color: '#4B5563',
              fontSize: 'clamp(1rem, 1.4vw, 1.12rem)',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            Read candid experiences from verified farmers and commercial buyers who have been trading on FarmerBandh for months and years.
          </p>

          {/* Social Proof Metric Highlights Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              maxWidth: '960px',
              margin: '0 auto 2.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem 1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 18px rgba(27, 77, 62, 0.05)',
            }}
          >
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1B4D3E' }}>4.9</span>
                <div style={{ display: 'flex', color: '#F59E0B' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 500 }}>
                From 1,480+ Verified Trades
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
                14+ Months
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 500 }}>
                Avg. Member Platform Retention
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1B4D3E', marginBottom: '4px' }}>
                100% KYC
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 500 }}>
                Verified Farmers & Agrarian Land
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '0.5rem', borderLeft: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A', marginBottom: '4px' }}>
                ₹0 Taken
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 500 }}>
                Zero Middleman Commission Cut
              </div>
            </div>
          </div>

          {/* Filter Pills & Write Review Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              maxWidth: '1240px',
              margin: '0 auto',
            }}
          >
            {/* Filter buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: activeFilter === 'all' ? '1.5px solid #1B4D3E' : '1px solid #D1D5DB',
                  backgroundColor: activeFilter === 'all' ? '#1B4D3E' : '#FFFFFF',
                  color: activeFilter === 'all' ? '#FFFFFF' : '#374151',
                  boxShadow: activeFilter === 'all' ? '0 2px 8px rgba(27,77,62,0.2)' : 'none',
                }}
              >
                All Stories ({reviews.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('farmer')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: activeFilter === 'farmer' ? '1.5px solid #1B4D3E' : '1px solid #D1D5DB',
                  backgroundColor: activeFilter === 'farmer' ? '#1B4D3E' : '#FFFFFF',
                  color: activeFilter === 'farmer' ? '#FFFFFF' : '#374151',
                  boxShadow: activeFilter === 'farmer' ? '0 2px 8px rgba(27,77,62,0.2)' : 'none',
                }}
              >
                <Tractor size={15} />
                <span>Farmers & Growers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('buyer')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: activeFilter === 'buyer' ? '1.5px solid #1B4D3E' : '1px solid #D1D5DB',
                  backgroundColor: activeFilter === 'buyer' ? '#1B4D3E' : '#FFFFFF',
                  color: activeFilter === 'buyer' ? '#FFFFFF' : '#374151',
                  boxShadow: activeFilter === 'buyer' ? '0 2px 8px rgba(27,77,62,0.2)' : 'none',
                }}
              >
                <Store size={15} />
                <span>Buyers & Restaurants</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('long')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: activeFilter === 'long' ? '1.5px solid #1B4D3E' : '1px solid #D1D5DB',
                  backgroundColor: activeFilter === 'long' ? '#1B4D3E' : '#FFFFFF',
                  color: activeFilter === 'long' ? '#FFFFFF' : '#374151',
                  boxShadow: activeFilter === 'long' ? '0 2px 8px rgba(27,77,62,0.2)' : 'none',
                }}
              >
                <Clock size={15} />
                <span>1+ Year Members</span>
              </button>
            </div>

            {/* Share experience button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                padding: '0.6rem 1.35rem',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803D')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
            >
              <PlusCircle size={18} />
              <span>Share Your Experience</span>
            </button>
          </div>
        </div>

        {/* Toast confirmation message */}
        {toastMessage && (
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto 2rem',
              backgroundColor: '#ECFDF5',
              border: '1.5px solid #10B981',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <CheckCircle2 size={20} color="#10B981" />
            <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{toastMessage}</span>
          </div>
        )}

        {/* REVIEW CARDS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.75rem',
            alignItems: 'stretch',
          }}
        >
          {filteredReviews.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5EBE3',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: '0 4px 16px rgba(27, 77, 62, 0.04)',
                transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(27, 77, 62, 0.1)';
                e.currentTarget.style.borderColor = '#86EFAC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(27, 77, 62, 0.04)';
                e.currentTarget.style.borderColor = '#E5EBE3';
              }}
            >
              {/* Top Watermark Quote */}
              <div
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.5rem',
                  color: 'rgba(27, 77, 62, 0.08)',
                  pointerEvents: 'none',
                }}
              >
                <MessageSquareQuote size={44} />
              </div>

              <div>
                {/* User Header: Avatar, Name, Location, Verified Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.1rem' }}>
                  <div
                    className={`bg-gradient-to-br ${item.avatarBg}`}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '1rem',
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      flexShrink: 0,
                    }}
                  >
                    {item.avatarText}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: '#111827',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </h4>
                      {item.verified && (
                        <span
                          title={item.verifiedType}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            border: '1px solid #BBF7D0',
                          }}
                        >
                          <ShieldCheck size={12} />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', fontSize: '0.8rem', marginTop: '2px' }}>
                      <MapPin size={13} color="#9CA3AF" />
                      <span>{item.location}</span>
                      <span style={{ margin: '0 2px' }}>·</span>
                      <span style={{ color: '#4B5563', fontWeight: 500 }}>{item.role}</span>
                    </div>
                  </div>
                </div>

                {/* HIGHLIGHT: USAGE DURATION BADGE */}
                {/* Demonstrates "I have been using this website for this much time" */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                  }}
                >
                  <Clock size={13} color="#059669" />
                  <span>{item.usageDuration}</span>
                </div>

                {/* Star Rating + Deals metric */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                    ))}
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginLeft: '4px' }}>
                      5.0
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: '#4B5563',
                      backgroundColor: '#F3F4F6',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {item.dealsCount}
                  </span>
                </div>

                {/* Review Headline */}
                <h5
                  style={{
                    margin: '0 0 0.6rem 0',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    color: '#1B4D3E',
                    lineHeight: 1.35,
                  }}
                >
                  "{item.headline}"
                </h5>

                {/* Review Paragraph */}
                <p
                  style={{
                    margin: '0 0 1.25rem 0',
                    fontSize: '0.88rem',
                    color: '#4B5563',
                    lineHeight: 1.6,
                  }}
                >
                  {item.review}
                </p>
              </div>

              {/* Bottom Card Footer: Produce Tag, Key Metric & Helpful Button */}
              <div
                style={{
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '1rem',
                  marginTop: 'auto',
                }}
              >
                {/* Key Result Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '0.6rem 0.85rem',
                    marginBottom: '0.85rem',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B4D3E' }}>
                      {item.metric}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {item.metricLabel}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.76rem',
                      color: '#065F46',
                      backgroundColor: '#E6F4EA',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    {item.produce}
                  </span>
                </div>

                {/* Date & Helpful Counter */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.76rem',
                    color: '#9CA3AF',
                  }}
                >
                  <span>{item.date}</span>

                  <button
                    type="button"
                    onClick={() => handleHelpful(item.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: helpfulClicked[item.id] ? '#DCFCE7' : '#F3F4F6',
                      color: helpfulClicked[item.id] ? '#15803D' : '#4B5563',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: helpfulClicked[item.id] ? 'default' : 'pointer',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    title="Mark this review as helpful"
                  >
                    <ThumbsUp size={12} color={helpfulClicked[item.id] ? '#15803D' : '#6B7280'} />
                    <span>Helpful ({item.helpful})</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Assurance Note */}
        <div
          style={{
            marginTop: '3.5rem',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803D',
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#1B4D3E' }}>
                Every Review Is Tied to a Delivered Order
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                We maintain genuine transparency. Anonymous submissions and paid endorsements are strictly blocked.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              padding: '0.65rem 1.4rem',
              borderRadius: '9999px',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>Write your experience</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MODAL: SHARE YOUR EXPERIENCE */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              padding: '2rem',
              position: 'relative',
              animation: 'modalSlideUp 0.25s ease',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6B7280',
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <Sparkles size={13} />
                <span>Community Review</span>
              </div>
              <h3
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  margin: '0 0 0.35rem 0',
                }}
              >
                Share Your FarmerBandh Journey
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#6B7280' }}>
                Tell others how long you have been using the marketplace and the value it brought to your harvest or business.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bharatbhai Desai"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vadodara, Gujarat"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    I am a *
                  </label>
                  <select
                    value={formData.roleType}
                    onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="farmer">🌾 Farmer / Agro Producer</option>
                    <option value="buyer">🏢 Commercial Buyer / Restaurant</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Your Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cotton & Groundnut Farmer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* TIMELINE FIELD: How long have you been using FarmerBandh? */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#1B4D3E', marginBottom: '4px' }}>
                  ⏱️ How long have you been using FarmerBandh? *
                </label>
                <select
                  value={formData.usageDuration}
                  onChange={(e) => setFormData({ ...formData, usageDuration: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1.5px solid #10B981',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: '#F0FDF4',
                    color: '#065F46',
                    fontWeight: 600,
                  }}
                >
                  <option value="Using FarmerBandh for 3 Months">🌱 Using FarmerBandh for 3 Months (Recent Harvest)</option>
                  <option value="Using FarmerBandh for 6 Months">🌿 Using FarmerBandh for 6 Months (Active Member)</option>
                  <option value="Using FarmerBandh for 10 Months">🌾 Using FarmerBandh for 10 Months (Regular Trades)</option>
                  <option value="Using FarmerBandh for 1.5 Years">⭐ Using FarmerBandh for 1.5 Years (Multi-Season Veteran)</option>
                  <option value="Trading for 2+ Years (Founding Member)">🏆 Trading for 2+ Years (Founding Member)</option>
                </select>
              </div>

              {/* Headline */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Headline Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Higher margins and zero payment delay since joining"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* Full Review Text */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Your Experience Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details like: How did you start? How has your income or sourcing improved? How do escrow payments help?"
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Produce & Key Metric */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Crops / Produce Traded
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kesar Mangoes, Cumin"
                    value={formData.produce}
                    onChange={(e) => setFormData({ ...formData, produce: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Key Benefit / Metric
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +30% Higher Margin"
                    value={formData.metric}
                    onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    backgroundColor: '#1B4D3E',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(27,77,62,0.25)',
                  }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;
