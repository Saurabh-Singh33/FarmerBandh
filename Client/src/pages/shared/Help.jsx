import React, { useState, useMemo } from 'react';
import {
  Search,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Lock,
  Scale,
  Sprout,
  Truck,
  Wallet,
  Clock,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Sparkles,
  Download,
  AlertCircle,
  ExternalLink,
  X,
  ChevronDown,
  Layers
} from 'lucide-react';
import { SproutIcon } from '../../components/SocialIcons';

const FAQ_DATA = [
  {
    id: 1,
    category: 'buyers',
    categoryLabel: 'For Buyers',
    title: 'How do I start a negotiation on a produce listing?',
    content: 'Open any product card or details page in the Marketplace and click "Negotiate Price". Enter your requested quantity in quintals and proposed price per quintal. You can also add other produce from the same farmer into a bundled multi-crop deal. The farmer has 48 hours to accept, counter with a new price, or decline.'
  },
  {
    id: 2,
    category: 'account',
    categoryLabel: 'Account & Location',
    title: 'How is my location used on FarmerBandh?',
    content: 'When registering, you select your state and district. The marketplace prioritizes produce grown in your geographic district so you can source fresher harvest with lower transit costs and faster delivery timelines.'
  },
  {
    id: 3,
    category: 'farmers',
    categoryLabel: 'For Farmers',
    title: 'What is a Verified Farmer badge and how do I earn it?',
    content: 'A Verified Farmer badge indicates that a farmer\'s government photo ID, 7/12 land records (खतौनी), and farm location have been submitted through the Seller Hub Verification page and approved by the FarmerBandh administrative team.'
  },
  {
    id: 4,
    category: 'payments',
    categoryLabel: 'Payouts & Escrow',
    title: 'How do farmer payouts and wallet disbursements work?',
    content: 'Once an order is confirmed and dispatched, the farmer\'s earnings reflect in their Seller Hub Payouts balance. Farmers can request bank transfer or UPI payouts directly from their dashboard. Platform administrators process requests against verified IFSC and account credentials via NEFT/RTGS.'
  },
  {
    id: 5,
    category: 'buyers',
    categoryLabel: 'Disputes & Returns',
    title: 'What happens if I receive the wrong grade or damaged produce?',
    content: 'Buyers can initiate a Return or Dispute from their Order History within 48 hours of delivery. You can upload photographic evidence, specify the discrepancy (e.g. grade mismatch, spoiled bags), and converse directly with the farmer through the mediated chat. If unresolved, admin arbitrates refunds.'
  },
  {
    id: 6,
    category: 'buyers',
    categoryLabel: 'Order Logistics',
    title: 'Can I cancel an order after placing it?',
    content: 'Orders can be cancelled by the buyer while they are in "Pending" or "Confirmed" status without penalty. Once the farmer begins packing ("Packed") or dispatches the carrier ("Shipped"), cancellation is locked to safeguard transit logistics.'
  },
  {
    id: 7,
    category: 'buyers',
    categoryLabel: 'Reviews & Ratings',
    title: 'How and when can I review a farmer?',
    content: 'Only after an order status reaches "Delivered" will the "Write a Review" button become active on your Order Details screen. You can submit a 1 to 5 star rating along with comments on produce freshness, packaging, and communication.'
  },
  {
    id: 8,
    category: 'account',
    categoryLabel: 'Data & Security',
    title: 'How is my password and account information secured?',
    content: 'Passwords are salted and cryptographically hashed with BCrypt. We never store or transmit plain text passwords. Sessions utilize JSON Web Tokens (JWT) with secure rotating refresh tokens.'
  },
  {
    id: 9,
    category: 'farmers',
    categoryLabel: 'For Farmers',
    title: 'How do I update my payout bank account or UPI ID?',
    content: 'Farmers can manage their registered payout details inside Seller Hub under "Payouts & Earnings" → "Bank Account Settings". Changes require IFSC code validation and account name matching to ensure money reaches the genuine grower.'
  },
  {
    id: 10,
    category: 'buyers',
    categoryLabel: 'For Buyers',
    title: 'How do multi-item bundled negotiations work?',
    content: 'If a farmer lists multiple products (e.g. Wheat, Bajra, Mustard), you can add multiple line items into a single deal quote modal, proposing a combined lump-sum rate and custom quantities.'
  },
  {
    id: 11,
    category: 'account',
    categoryLabel: 'Notifications',
    title: 'How do notification preferences work?',
    content: 'FarmerBandh alerts you in real time about order milestones, counter-offers, dispute updates, and payouts. You can customize which notifications you receive anytime by visiting /notifications/preferences.'
  },
  {
    id: 12,
    category: 'account',
    categoryLabel: 'Support Desk',
    title: 'Who do I contact if I need platform assistance?',
    content: 'You can email support@farmerbandh.com or dial our toll-free support line at 1800-123-456 (Monday to Saturday, 9:00 AM – 6:00 PM IST). Our agrarian desk supports Hindi, Gujarati, Marathi, and English.'
  }
];

export const Help = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openAccordionIds, setOpenAccordionIds] = useState([1]);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const toggleAccordion = (id) => {
    setOpenAccordionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFeedback = (id, type) => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: type }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <div
      style={{
        backgroundColor: '#FAF8F5',
        color: '#2C3E35',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.6
      }}
    >
      {/* 1. HERO & SEARCH SECTION (WIDE & BALANCED) */}
      <section
        id="faq"
        style={{
          background: 'linear-gradient(180deg, #F4EFEA 0%, #FAF8F5 100%)',
          borderBottom: '1px solid #E7E0D3',
          padding: '4.5rem 1.5rem 3.5rem'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Top Badge & Header */}
          <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 2.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#EDE5D8',
                border: '1px solid #D5C7B2',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1B4D3E',
                letterSpacing: '0.04em',
                marginBottom: '1rem'
              }}
            >
              <span>🌾</span>
              <span>किसान व ग्राहक सहायता केंद्र · KNOWLEDGE BASE & HELP DESK</span>
            </div>

            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(2.3rem, 4.4vw, 3.4rem)',
                fontWeight: 700,
                color: '#1B4D3E',
                lineHeight: 1.2,
                margin: '0 0 1rem 0'
              }}
            >
              How can we help you today?
              <br />
              <span style={{ fontStyle: 'italic', color: '#B45309', fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)' }}>
                आपकी सहायता के लिए सदैव तत्पर
              </span>
            </h1>

            <p style={{ color: '#4B5563', fontSize: '1.05rem', margin: '0 auto' }}>
              Find verified answers about direct farm trading, 48-hour price negotiations, bank payouts, and quality dispute resolution.
            </p>
          </div>

          {/* Wide Enhanced Search Bar */}
          <div style={{ maxWidth: '720px', margin: '0 auto 2.5rem', position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '9999px',
                border: '1.5px solid #D5C7B2',
                boxShadow: '0 8px 24px rgba(27,77,62,0.08)',
                padding: '6px 12px 6px 20px',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={20} color="#059669" style={{ flexShrink: 0, marginRight: '10px' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions (e.g. negotiation, payout, 7/12 land KYC, dispute)..."
                aria-label="Search FAQ questions"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  color: '#1F2937',
                  backgroundColor: 'transparent',
                  padding: '8px 0'
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Suggested Search Tag Shortcuts */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: '#6B7280'
              }}
            >
              <span style={{ fontWeight: 600 }}>Quick Topics:</span>
              {[
                { label: '🤝 Negotiation', tag: 'negotiation' },
                { label: '💳 Payouts', tag: 'payout' },
                { label: '📜 KYC Verification', tag: 'verification' },
                { label: '⚖️ Returns & Dispute', tag: 'dispute' },
                { label: '📦 Logistics', tag: 'order' }
              ].map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => setSearch(item.tag)}
                  style={{
                    border: '1px solid #E2D9CB',
                    backgroundColor: '#FFFFFF',
                    color: '#1B4D3E',
                    borderRadius: '9999px',
                    padding: '3px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Wide Quick-Access Topic Cards (Fills width beautifully) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {[
              {
                icon: Sprout,
                catId: 'farmers',
                titleHindi: 'किसान सहायता निर्देशिका',
                titleEng: 'For Farmers & Producers',
                desc: 'How to list harvests, set fair base rates, handle counter-offers, and verify 7/12 land records.'
              },
              {
                icon: BookOpen,
                catId: 'buyers',
                titleHindi: 'खरीदार व्यापार गाइड',
                titleEng: 'For Wholesale Buyers',
                desc: 'Bargaining steps, multi-item crop bundles, delivery milestones, and quality return policies.'
              },
              {
                icon: Wallet,
                catId: 'payments',
                titleHindi: 'सुरक्षित भुगतान व एस्क्रो',
                titleEng: 'Payouts & Escrow Security',
                desc: 'Direct NEFT/RTGS bank transfers, UPI settlement cycles, zero-commission guarantee.'
              },
              {
                icon: ShieldCheck,
                catId: 'account',
                titleHindi: 'खाता व पहचान सुरक्षा',
                titleEng: 'Account & Verification',
                desc: 'Government photo ID KYC, district location matching, password safety, and dispute care.'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              const isSelected = selectedCategory === card.catId;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'all' : card.catId);
                    setSearch('');
                  }}
                  style={{
                    backgroundColor: isSelected ? '#E8F5E9' : '#FFFFFF',
                    border: isSelected ? '2px solid #059669' : '1px solid #E2D9CB',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(27,77,62,0.04)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#1B4D3E' : '#F4EFEA',
                      color: isSelected ? '#FFFFFF' : '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309', marginBottom: '0.2rem' }}>
                    {card.titleHindi}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: '#1B4D3E',
                      margin: '0 0 0.5rem 0'
                    }}
                  >
                    {card.titleEng}
                  </h3>

                  <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                    {card.desc}
                  </p>

                  <div
                    style={{
                      marginTop: '1rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{isSelected ? '✓ Filter Active' : 'Explore questions'}</span>
                    {!isSelected && <ArrowRight size={13} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT: 2-COLUMN BALANCED KNOWLEDGE CENTER */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) 1fr',
            gap: '2.5rem',
            alignItems: 'start'
          }}
          className="help-layout-grid"
        >
          {/* LEFT SIDEBAR: TOPICS & DIRECT CONTACT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '90px' }}>
            {/* Category Filter Menu Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2D9CB',
                borderRadius: '16px',
                padding: '1.25rem',
                boxShadow: '0 4px 14px rgba(27,77,62,0.04)'
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#1B4D3E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={14} color="#059669" />
                <span>विषय सूची · Topics</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'all', label: 'All Questions', labelHindi: 'सभी प्रश्न', count: 12 },
                  { id: 'buyers', label: 'For Buyers', labelHindi: 'खरीदारों के लिए', count: 4 },
                  { id: 'farmers', label: 'For Farmers', labelHindi: 'किसानों के लिए', count: 2 },
                  { id: 'payments', label: 'Payouts & Escrow', labelHindi: 'भुगतान व एस्क्रो', count: 2 },
                  { id: 'account', label: 'Account & Security', labelHindi: 'खाता व सुरक्षा', count: 4 }
                ].map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: isActive ? '#1B4D3E' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#374151',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div>{cat.label}</div>
                        <div style={{ fontSize: '0.72rem', opacity: isActive ? 0.85 : 0.6 }}>
                          {cat.labelHindi}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                          color: isActive ? '#FFFFFF' : '#6B7280'
                        }}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Kisan Helpline Card */}
            <div
              style={{
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 8px 24px rgba(27,77,62,0.18)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: '#A7F3D0'
                }}
              >
                <span>📞</span>
                <span>किसान व ग्राहक हेल्पलाइन</span>
              </div>

              <h4
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0 0 0.5rem 0'
                }}
              >
                Need to speak with us?
              </h4>

              <p style={{ fontSize: '0.86rem', color: '#D1FAE5', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Our agricultural desk is available Monday to Saturday, 9:00 AM – 6:00 PM IST.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <a
                  href="tel:1800123456"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#1B4D3E',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={14} />
                  <span>1800-123-456 (Toll-Free)</span>
                </a>

                <a
                  href="mailto:support@farmerbandh.com"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Mail size={14} />
                  <span>support@farmerbandh.com</span>
                </a>
              </div>
            </div>

            {/* Platform Operational Status Badge */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2D9CB',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ fontWeight: 700, color: '#1B4D3E', marginBottom: '0.4rem' }}>
                मंडी स्थिति · Live Platform Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#16A34A',
                    boxShadow: '0 0 6px #16A34A'
                  }}
                />
                <span>All Mandi Systems Operational</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACCORDION QUESTIONS LIST */}
          <div>
            {/* Results Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1.5px solid #E2D9CB',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1B4D3E' }}>
                  Showing {filteredFaqs.length} verified answers
                </span>
                {search && (
                  <span style={{ fontSize: '0.84rem', color: '#6B7280', marginLeft: '6px' }}>
                    for "{search}"
                  </span>
                )}
              </div>

              {(search || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    color: '#6B7280',
                    cursor: 'pointer'
                  }}
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Questions List */}
            {filteredFaqs.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2D9CB'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                <h3
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#1B4D3E',
                    margin: '0 0 0.5rem 0'
                  }}
                >
                  No matching questions found
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.94rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  We couldn't find any questions matching your query. Our agricultural help desk is available to assist you directly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                  }}
                  style={{
                    padding: '0.6rem 1.5rem',
                    backgroundColor: '#1B4D3E',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  View All Questions
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredFaqs.map((faq) => {
                  const isOpen = openAccordionIds.includes(faq.id);
                  const userFeedback = feedbackGiven[faq.id];

                  return (
                    <div
                      key={faq.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: isOpen ? '1.5px solid #10B981' : '1px solid #E2D9CB',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: isOpen
                          ? '0 6px 18px rgba(27,77,62,0.08)'
                          : '0 2px 6px rgba(27,77,62,0.02)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Accordion Question Header */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(faq.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '1.25rem 1.5rem',
                          backgroundColor: isOpen ? '#F4FAF6' : '#FFFFFF',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          outline: 'none',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#B45309',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}
                          >
                            {faq.categoryLabel}
                          </span>
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '1.02rem',
                              fontWeight: 600,
                              color: isOpen ? '#1B4D3E' : '#1F2937',
                              lineHeight: 1.35
                            }}
                          >
                            {faq.title}
                          </span>
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isOpen ? '#1B4D3E' : '#F3F4F6',
                            color: isOpen ? '#FFFFFF' : '#6B7280',
                            flexShrink: 0,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ChevronDown size={16} />
                        </span>
                      </button>

                      {/* Accordion Answer Body */}
                      {isOpen && (
                        <div
                          style={{
                            padding: '1.25rem 1.5rem 1.5rem',
                            borderTop: '1px solid #E7F0E9',
                            color: '#374151',
                            fontSize: '0.96rem',
                            lineHeight: 1.7,
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <p style={{ margin: '0 0 1.25rem 0' }}>{faq.content}</p>

                          {/* Helpful Answer Feedback Bar */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '0.85rem',
                              borderTop: '1px solid #F3F4F6',
                              fontSize: '0.82rem',
                              color: '#6B7280',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <span>Was this answer helpful?</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {userFeedback ? (
                                <span style={{ color: '#059669', fontWeight: 600 }}>
                                  ✓ Thank you for your feedback!
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(faq.id, 'yes')}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 8px',
                                      backgroundColor: '#F3F4F6',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      color: '#374151',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <ThumbsUp size={12} />
                                    <span>Yes</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(faq.id, 'no')}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 8px',
                                      backgroundColor: '#F3F4F6',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      color: '#374151',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <ThumbsDown size={12} />
                                    <span>No</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. LEGAL POLICY SECTION 1: TERMS OF SERVICE (WIDE & BALANCED) */}
      <section
        id="terms"
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E7E0D3',
          padding: '5rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              कानूनी नियम व शर्तें · LEGAL FRAMEWORK
            </span>
            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: '0 0 0.5rem 0'
              }}
            >
              Terms of Service
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.98rem', maxWidth: '700px', margin: 0 }}>
              The transparent legal framework governing farmer and wholesale buyer commercial agreements on FarmerBandh.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {[
              {
                num: '1',
                title: 'Eligibility & Accounts',
                content:
                  'You must be at least 18 years old and capable of forming legally binding agreements under Indian law. Users agree to register with their real identity, verified phone numbers, and true farm or business addresses. Only one active account is permitted per enterprise or individual.'
              },
              {
                num: '2',
                title: 'Platform Role & Direct Scope',
                content:
                  'FarmerBandh operates as an online marketplace facilitation platform connecting independent agricultural producers and commercial buyers. FarmerBandh does not take physical title to produce, set non-negotiable prices, or operate as an agricultural middleman broker. Contracts of sale and purchase are made directly between the buyer and the farmer.'
              },
              {
                num: '3',
                title: 'Prohibited Conduct & Integrity',
                content:
                  'Users agree not to: (a) create fake crop listings or misrepresent produce grade; (b) initiate fraudulent chargebacks; (c) solicit off-platform transactions to evade platform fee rules; (d) harass, abuse, or intimidate other participants; or (e) manipulate ratings and reviews. Violations lead to immediate account suspension and withholding of unsettled funds.'
              },
              {
                num: '4',
                title: 'Orders, Cancellations & Delivery',
                content:
                  'Buyers may cancel orders while in "Pending" or "Confirmed" status without penalty. Once an order is marked "Packed" or "Shipped", cancellation is not permitted. Farmers agree to dispatch orders within their specified handling window and update accurate shipping/delivery milestones.'
              },
              {
                num: '5',
                title: 'Returns, Refunds & Dispute Arbitration',
                content:
                  'If delivered produce fails the stated grade criteria, weight, or arrives spoiled, buyers may file a return within 48 hours with photographic evidence. Both parties have access to a mediated dispute chat. If parties cannot reach consensus, FarmerBandh administrators will issue a binding decision, approving returns or releasing refunds accordingly.'
              },
              {
                num: '6',
                title: 'Platform Fees & Payouts',
                content:
                  'Platform commissions or transaction processing fees (as displayed during checkout and outlined in Admin Settings) are transparently deducted upon payout release. Farmers receive net earnings via verified NEFT/RTGS or UPI channels upon dispatch and delivery milestones.'
              }
            ].map((term) => (
              <div
                key={term.num}
                style={{
                  backgroundColor: '#FAF8F5',
                  border: '1px solid #E2D9CB',
                  borderRadius: '14px',
                  padding: '1.75rem 1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.65rem' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#1B4D3E',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {term.num}
                  </span>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                    {term.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  {term.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LEGAL POLICY SECTION 2: PRIVACY POLICY (WIDE & BALANCED) */}
      <section
        id="privacy"
        style={{
          backgroundColor: '#FAF8F5',
          borderTop: '1px solid #E7E0D3',
          padding: '5rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              गोपनीयता नीति · YOUR PRIVACY MATTERS
            </span>
            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: '0 0 0.5rem 0'
              }}
            >
              Privacy Policy
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.98rem', maxWidth: '700px', margin: 0 }}>
              How your profile credentials, verification documents, and payment details are safeguarded on FarmerBandh.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {[
              {
                icon: '📋',
                title: 'Information We Collect',
                text: 'Profile details (name, email, phone, state, district), farmer verification documents (7/12 land records, Aadhaar photo ID), trade records (negotiations, orders, delivery receipts), and banking credentials for payout disbursement.'
              },
              {
                icon: '🎯',
                title: 'How We Use Your Data',
                text: 'To scope marketplace searches to your local district, coordinate transport dispatch, disburse farmer earnings, arbitrate returns, and protect users against fraudulent accounts.'
              },
              {
                icon: '🛡️',
                title: 'What We Never Share or Sell',
                text: 'We never sell, rent, or trade your personal information to third-party ad brokers. Sensitive bank account numbers and passwords are encrypted and never exposed through public APIs.'
              },
              {
                icon: '🍪',
                title: 'Cookies & Session Storage',
                text: 'FarmerBandh uses encrypted local web tokens (JWT) so you stay logged in securely across browser sessions. We do not use intrusive cross-site ad trackers.'
              },
              {
                icon: '🔐',
                title: 'User Rights & Account Export',
                text: 'You maintain full rights to inspect, update, or request permanent deletion of your profile data. Contact privacy@farmerbandh.com for complete data exports.'
              },
              {
                icon: '📜',
                title: 'Regulatory Compliance',
                text: 'FarmerBandh complies with the Information Technology Act, 2000 and applicable Indian digital data protection standards.'
              }
            ].map((p, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2D9CB',
                  borderRadius: '14px',
                  padding: '1.75rem 1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{p.icon}</span>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                    {p.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEGAL POLICY SECTION 3: DATA SECURITY STANDARDS (WIDE & BALANCED) */}
      <section
        id="security"
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E7E0D3',
          padding: '5rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              सुरक्षा व वास्तुकला · ARCHITECTURE & PROTECTION
            </span>
            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: '0 0 0.5rem 0'
              }}
            >
              Data Security Standards
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.98rem', maxWidth: '700px', margin: 0 }}>
              Enterprise-grade cryptographic protections safeguarding farmer identities, payment escrows, and trade agreements.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}
          >
            {[
              {
                icon: Lock,
                title: 'BCrypt Cryptography',
                desc: 'All passwords are independently salted and hashed with high-cost BCrypt hashing before database persistence. Plain text passwords are never stored.'
              },
              {
                icon: ShieldCheck,
                title: 'Ephemeral JWT Tokens',
                desc: 'Session authentication uses cryptographically signed JWT access tokens coupled with rotating refresh tokens stored with revocation timestamps.'
              },
              {
                icon: Scale,
                title: 'ORM Parameterization',
                desc: 'All database operations strictly route through Entity Framework Core parameterized abstractions, completely mitigating SQL injection risks.'
              },
              {
                icon: CheckCircle2,
                title: 'Immutable Audit Journal',
                desc: 'Every critical administrative action — verification approvals, dispute settlements, and payout disbursements — is logged into an immutable audit journal.'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '1.75rem 1.5rem',
                    backgroundColor: '#FAF8F5',
                    border: '1px solid #E2D9CB',
                    borderRadius: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#E8F5E9',
                      color: '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#1B4D3E', fontSize: '1.08rem', margin: '0 0 0.5rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: '1.25rem 1.75rem',
              backgroundColor: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              borderRadius: '12px',
              fontSize: '0.88rem',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Platform Security Specification: Version 2.4 — Audited & Compliant</span>
            </div>
            <span style={{ fontWeight: 700 }}>Last System Verification: 15 October 2026</span>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CONTACT & DESK BANNER */}
      <section
        style={{
          backgroundColor: '#1B4D3E',
          color: '#FFFFFF',
          padding: '4.5rem 1.5rem',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#059669',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            <SproutIcon size={26} color="#059669" />
          </div>

          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2rem, 3.8vw, 2.6rem)',
              fontWeight: 700,
              lineHeight: 1.25,
              margin: '0 0 1rem 0'
            }}
          >
            Still have a question about trading?
          </h2>

          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65, maxWidth: '600px', margin: '0 auto 2rem' }}>
            Our agrarian support officers are on call in Hindi, Gujarati, Marathi, and English to help you negotiate, pack, or settle payments.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="tel:1800123456"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1B4D3E',
                padding: '0.85rem 2rem',
                borderRadius: '9999px',
                fontSize: '0.96rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)'
              }}
            >
              <Phone size={16} />
              <span>Call Helpline 1800-123-456</span>
            </a>

            <a
              href="mailto:support@farmerbandh.com"
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                padding: '0.85rem 1.8rem',
                borderRadius: '9999px',
                fontSize: '0.96rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Mail size={16} />
              <span>Email Support Desk</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;
