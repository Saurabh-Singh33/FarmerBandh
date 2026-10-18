import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SproutIcon } from '../../components/SocialIcons';
import { FarmerBuyerScene } from '../../components/FarmerBuyerScene';
import { TestimonialsSection } from '../../components/TestimonialsSection';
import { Tractor, ShoppingBag, ShieldCheck, CheckCircle2, Zap, Sprout } from 'lucide-react';

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

      {/* SECTION 5: CALL TO ACTION BANNER (CONTAINED FLOATING CARD) */}
      <section
        style={{
          backgroundColor: '#F9FBF8',
          padding: '3.5rem 1.5rem 5rem',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div
            style={{
              background: 'linear-gradient(140deg, #12372A 0%, #16423C 55%, #0B251B 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(52, 211, 153, 0.22)',
              boxShadow: '0 24px 60px -15px rgba(18, 55, 42, 0.38)',
              padding: '3.75rem 2.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Subtle Top Ambient Light */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '140px',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.18) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto' }}>
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#A7F3D0',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                  letterSpacing: '0.02em'
                }}
              >
                <Sprout size={15} color="#4ADE80" />
                <span>Direct Farm-to-Buyer Marketplace · Zero Middlemen</span>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  margin: '0 0 1rem 0'
                }}
              >
                Ready to trade farm produce directly?
              </h2>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#D1FAE5',
                  lineHeight: 1.6,
                  margin: '0 auto 2.25rem',
                  maxWidth: '640px'
                }}
              >
                Join verified growers, APMC traders, and retail procurement teams trading seasonal harvests with transparent counter-offers and escrow safety.
              </p>

              {/* Dual Action Buttons: Farmer & Buyer */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  marginBottom: '1.75rem'
                }}
              >
                <Link
                  to="/auth"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    backgroundColor: '#22C55E',
                    color: '#0B251B',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '12px',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#16A34A';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#22C55E';
                    e.currentTarget.style.color = '#0B251B';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Tractor size={18} />
                  <span>Start as a Farmer</span>
                </Link>

                <Link
                  to="/marketplace"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: '#FFFFFF',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '12px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Explore Marketplace</span>
                </Link>
              </div>

              {/* Already registered sign-in link */}
              <div style={{ fontSize: '0.88rem', color: '#A7F3D0', marginBottom: '2.5rem' }}>
                Already registered?{' '}
                <Link
                  to="/auth"
                  style={{
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px'
                  }}
                >
                  Sign in here
                </Link>
              </div>

              {/* Three Pillars Trust Strip */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  paddingTop: '1.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4ADE80',
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                      Escrow-Protected
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#A7F3D0', lineHeight: 1.4 }}>
                      Funds released only after buyer inspection
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4ADE80',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                      Verified Profiles
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#A7F3D0', lineHeight: 1.4 }}>
                      Identity and agrarian records verified
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4ADE80',
                      flexShrink: 0
                    }}
                  >
                    <Zap size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                      Zero Hidden Markup
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#A7F3D0', lineHeight: 1.4 }}>
                      Direct counter-offers with 48h locks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
