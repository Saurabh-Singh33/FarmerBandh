import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SproutIcon } from '../../components/SocialIcons';
import { FarmerBuyerScene } from '../../components/FarmerBuyerScene';
import { TestimonialsSection } from '../../components/TestimonialsSection';
import { Tractor, ShoppingBag, ShieldCheck, CheckCircle2, Zap, Sprout, Check, ArrowRight } from 'lucide-react';

export const Landing = () => {
  const { user } = useAuth();

  // Redirect authenticated users to their specific dashboard
  if (user) {
    const role = (user.role || '').toLowerCase();
    if (role === 'farmer' || role === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    }
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <div style={{ backgroundColor: '#F9FBF8', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
      {/* SECTION 1: HERO WITH 3D THREE.JS ANIMATION */}
      <section
        style={{
          background: 'linear-gradient(180deg, #E8F5E9 0%, #F9FBF8 100%)',
          padding: '4.5rem 1.5rem 4rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          className="flex flex-col lg:flex-row items-center justify-between"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
            gap: '3rem'
          }}
        >
          {/* Left Column: Typography, Badge & CTAs */}
          <div style={{ flex: '1 1 540px', maxWidth: '620px', textAlign: 'left' }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #BBF7D0',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                color: '#1B4D3E',
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(27,77,62,0.06)',
                marginBottom: '1.5rem'
              }}
            >
              <SproutIcon size={18} color="#16A34A" />
              <span>Direct Agricultural Marketplace · Zero Middlemen</span>
            </div>

            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                fontWeight: 700,
                color: '#1B4D3E',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                margin: '0 0 1.25rem 0'
              }}
            >
              Trade directly. <br />
              <span style={{ color: '#059669' }}>Grow together.</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.6vw, 1.18rem)',
                color: '#4B5563',
                lineHeight: 1.6,
                margin: '0 0 2rem 0'
              }}
            >
              FarmerBandh connects farmers and buyers directly — no middleman, no markup, no guesswork. Browse local produce, negotiate a fair price, and get it delivered.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '2.5rem'
              }}
            >
              <Link
                to="/auth"
                style={{
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  padding: '0.85rem 2.2rem',
                  borderRadius: '9999px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(27,77,62,0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                Get started →
              </Link>

              <Link
                to="/about"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1B4D3E',
                  padding: '0.85rem 2rem',
                  borderRadius: '9999px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1.5px solid #1B4D3E',
                  transition: 'all 0.15s ease'
                }}
              >
                Learn more
              </Link>
            </div>

            {/* Trust Mini Highlights */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(27,77,62,0.1)'
              }}
            >
              {[
                '✓ Verified Farmers',
                '🤝 Direct Price Negotiations',
                '🔒 Escrow Protection'
              ].map((pill) => (
                <span
                  key={pill}
                  style={{
                    fontSize: '0.82rem',
                    color: '#065F46',
                    fontWeight: 600
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: 3D Interactive Three.js Scene */}
          <div
            style={{
              flex: '1 1 480px',
              maxWidth: '560px',
              width: '100%',
              height: '480px',
              position: 'relative'
            }}
          >
            <FarmerBuyerScene />
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: '0 0 0.75rem 0'
            }}
          >
            How FarmerBandh Works
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '560px', margin: '0 auto' }}>
            Built around real farmer-buyer relationships, transparent negotiations, and verified local harvest.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}
        >
          {/* Card 1: For Buyers */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '2rem 1.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: '1.25rem'
              }}
            >
              🛒
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.35rem', color: '#1B4D3E', margin: '0 0 1rem 0' }}>
              For Buyers
            </h3>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#4B5563', lineHeight: 1.7, fontSize: '0.94rem' }}>
              <li>Browse farm produce scoped directly by state and district.</li>
              <li>Negotiate prices or propose custom bundle offers per quintal.</li>
              <li>Track parcel order milestones from packing to doorstep delivery.</li>
              <li>Write verified reviews to help your regional farming community.</li>
            </ul>
          </div>

          {/* Card 2: For Farmers */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #BBF7D0',
              borderRadius: '16px',
              padding: '2rem 1.75rem',
              boxShadow: '0 4px 12px rgba(27,77,62,0.05)'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: '1.25rem'
              }}
            >
              🌾
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.35rem', color: '#1B4D3E', margin: '0 0 1rem 0' }}>
              For Farmers
            </h3>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#4B5563', lineHeight: 1.7, fontSize: '0.94rem' }}>
              <li>List your harvest with grade, bulk discounts, and min orders.</li>
              <li>Accept, counter, or decline buyer negotiation offers in 48 hours.</li>
              <li>Manage incoming queue orders, package dispatch, and delivery.</li>
              <li>Receive direct bank and UPI payouts safely into your account.</li>
            </ul>
          </div>

          {/* Card 3: For Everyone */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '2rem 1.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FFFBEB',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: '1.25rem'
              }}
            >
              🤝
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.35rem', color: '#1B4D3E', margin: '0 0 1rem 0' }}>
              For Everyone
            </h3>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#4B5563', lineHeight: 1.7, fontSize: '0.94rem' }}>
              <li>Transparent price clarity without hidden broker percentages.</li>
              <li>Verified farmer badges backed by admin document review.</li>
              <li>Fair dispute resolution with return parcels and mediated chat.</li>
              <li>Instant in-app alerts whenever orders or deals advance.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: BUILT FOR LOCAL */}
      <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '5rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          <div>
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
              Hyper-Local Sourcing
            </span>
            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
                color: '#1B4D3E',
                lineHeight: 1.25,
                margin: '0 0 1.25rem 0'
              }}
            >
              Produce shouldn't travel 1,500 km when it grows next door.
            </h2>
            <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
              When you sign up, you choose your state and district. The marketplace shows you farmers near you — not produce that has to travel 1,500 km to reach you. Fresher food, faster delivery, less waste.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1B4D3E' }}>District-Scoped</div>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Relevant local growers</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1B4D3E' }}>Same-Week</div>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Harvest-to-door transit</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1B4D3E' }}>0 Middlemen</div>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Direct farm income</div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#F9FBF8',
              border: '1px solid #D1D5DB',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <SproutIcon size={32} color="#1B4D3E" />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.3rem', color: '#1B4D3E', margin: '0 0 0.5rem 0' }}>
              Gujarat & Regional Coverage
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#6B7280', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Connect with certified farmers across Ahmedabad, Surat, Rajkot, Vadodara, and rural agrarian clusters.
            </p>
            <Link
              to="/about"
              style={{
                color: '#1B4D3E',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Read our mission & story →
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: TRUST & FAIRNESS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: '0 0 0.75rem 0'
            }}
          >
            The Four Pillars of Trust
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Built with strict platform safeguards so both growers and commercial buyers can transact with peace of mind.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem'
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B4D3E', marginBottom: '0.5rem' }}>
              1. Verified Farmers
            </div>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Identity documents, farm locations, and agrarian records are reviewed and confirmed by our administration team before blue verification badges are issued.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B4D3E', marginBottom: '0.5rem' }}>
              2. Real Buyer Reviews
            </div>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Only customers with completed, delivered orders can submit crop quality reviews and star ratings. No anonymous reviews or manufactured praise.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B4D3E', marginBottom: '0.5rem' }}>
              3. Fair Price Negotiation
            </div>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Direct negotiation happens transparently inside the platform with 48-hour expirations, counters, and multi-crop bundled offers to protect both parties.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '1.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1B4D3E', marginBottom: '0.5rem' }}>
              4. Dispute Arbitration
            </div>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              If a parcel arrives damaged or fails grade specifications, buyers can raise structured returns and dispute tickets backed by admin mediation and prompt refunds.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: COMMUNITY REVIEWS & MEMBER TENURE STORIES */}
      <TestimonialsSection />

      {/* SECTION 5: CALL TO ACTION GATEWAY (HUMAN-CRAFTED DUAL PERSONA) */}
      <section
        style={{
          backgroundColor: '#F9FBF8',
          padding: '4.5rem 1.5rem 5.5rem',
          borderTop: '1px solid #E5E7EB',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#166534',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.5rem'
              }}
            >
              Start Trading Today
            </span>

            <h2
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
                margin: '0 0 0.85rem 0'
              }}
            >
              Connect directly. Keep the full value.
            </h2>

            <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Whether you are harvesting regional crops or sourcing bulk produce for commercial trade, FarmerBandh eliminates intermediate commission with verified trust and escrow protection.
            </p>
          </div>

          {/* Dual Persona Gateway Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginBottom: '2.5rem'
            }}
          >
            {/* Card 1: For Farmers */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid #E2E8F0',
                borderTop: '4px solid #1B4D3E',
                padding: '2.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px -2px rgba(27, 77, 62, 0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(27, 77, 62, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(27, 77, 62, 0.08)';
              }}
            >
              <div>
                {/* Header with Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#15803D',
                      flexShrink: 0
                    }}
                  >
                    <Tractor size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      For Growers & FPOs · किसान
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      I want to sell my harvest
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                  List your seasonal produce directly, set your minimum expected price, negotiate bids transparently, and receive bank payouts upon delivery.
                </p>

                {/* Benefits List */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span><strong>100% Margin Retained:</strong> Zero mandi commission or arbitrary broker deductions</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span><strong>Guaranteed Escrow Payout:</strong> Buyer funds are locked before dispatch and released to your bank</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span><strong>Live Price Negotiations:</strong> Accept, decline, or counter commercial bulk offers in 48 hours</span>
                  </li>
                </ul>
              </div>

              <div>
                <Link
                  to="/auth"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    padding: '0.85rem 1.4rem',
                    borderRadius: '10px',
                    backgroundColor: '#1B4D3E',
                    color: '#FFFFFF',
                    fontSize: '0.94rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(27, 77, 62, 0.2)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#143B2F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1B4D3E';
                  }}
                >
                  <span>Register as a Farmer</span>
                  <ArrowRight size={16} />
                </Link>
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748B', marginTop: '0.65rem' }}>
                  Free registration · Verification takes under 24 hours
                </div>
              </div>
            </div>

            {/* Card 2: For Commercial Buyers */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid #E2E8F0',
                borderTop: '4px solid #D97706',
                padding: '2.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px -2px rgba(217, 119, 6, 0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(217, 119, 6, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(217, 119, 6, 0.08)';
              }}
            >
              <div>
                {/* Header with Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#B45309',
                      flexShrink: 0
                    }}
                  >
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      For Traders & Businesses · व्यापारी
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      I want to procure fresh produce
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                  Browse harvest-ready lots directly from verified regional farms. Review agrarian credentials, negotiate volume pricing, and inspect produce before releasing payment.
                </p>

                {/* Benefits List */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span><strong>Farm-Gate Sourcing:</strong> Direct procurement from verified farms across Gujarat & India</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span><strong>Inspect Before Releasing Funds:</strong> Payout remains held in escrow until produce passes grade check</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.45 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span><strong>Admin Dispute Mediation:</strong> Structured returns and arbitration if shipment does not match specifications</span>
                  </li>
                </ul>
              </div>

              <div>
                <Link
                  to="/marketplace"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    padding: '0.85rem 1.4rem',
                    borderRadius: '10px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontSize: '0.94rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1E293B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F172A';
                  }}
                >
                  <span>Browse Live Marketplace</span>
                  <ArrowRight size={16} />
                </Link>
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748B', marginTop: '0.65rem' }}>
                  No account needed to browse live lots and mandi rates
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Sign In Footer Bar */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.85rem',
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={16} color="#059669" />
                <span style={{ fontWeight: 500 }}>Bank Escrow Protected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontWeight: 500 }}>Verified Grower Profiles</span>
              </div>
            </div>

            <div>
              <span>Already registered? </span>
              <Link
                to="/auth"
                style={{
                  color: '#15803D',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Sign in to your account →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
