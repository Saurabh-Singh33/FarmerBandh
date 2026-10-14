import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Truck,
  Wallet,
  FileCheck,
  ArrowRight,
  Quote,
  HeartHandshake,
  Award,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import { SproutIcon } from '../../components/SocialIcons';

export const About = () => {
  return (
    <div
      style={{
        backgroundColor: '#FAF8F5',
        color: '#2C3E35',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.6
      }}
    >
      {/* 1. CLASSIC HERO SECTION WITH INDIAN FARMER PORTRAIT */}
      <section
        style={{
          borderBottom: '1px solid #E7E0D3',
          background: 'linear-gradient(180deg, #F4EFEA 0%, #FAF8F5 100%)',
          padding: '4.5rem 1.5rem 4rem'
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}
        >
          {/* Left Editorial Text Column */}
          <div>
            {/* Bilingual Classic Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#EDE5D8',
                border: '1px solid #D5C7B2',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1B4D3E',
                letterSpacing: '0.04em',
                marginBottom: '1.25rem'
              }}
            >
              <span style={{ fontSize: '1rem' }}>🇮🇳</span>
              <span>हमारा संकल्प · OUR SACRED PURPOSE</span>
            </div>

            {/* Main Title with Hindi and English */}
            <h1
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(2.4rem, 4.2vw, 3.4rem)',
                fontWeight: 700,
                color: '#1B4D3E',
                lineHeight: 1.18,
                letterSpacing: '-0.02em',
                margin: '0 0 0.75rem 0'
              }}
            >
              अन्नदाता से सीधे बाज़ार तक।
              <br />
              <span
                style={{
                  fontStyle: 'italic',
                  color: '#B45309',
                  fontWeight: 600,
                  fontSize: 'clamp(2rem, 3.6vw, 2.9rem)'
                }}
              >
                Restoring the bond between farmer & buyer.
              </span>
            </h1>

            {/* Motto Subtitle */}
            <p
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#047857',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🌾</span>
              <span>"सीधा व्यापार, पूरा अधिकार — खेत की मिट्टी से शहर की थाली तक"</span>
            </p>

            {/* Classic Editorial Body with Drop Cap */}
            <div style={{ color: '#4B5563', fontSize: '1.02rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              <p style={{ margin: '0 0 1.25rem 0' }}>
                <span
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    float: 'left',
                    fontSize: '3.6rem',
                    lineHeight: '0.8',
                    paddingRight: '12px',
                    paddingTop: '4px',
                    color: '#1B4D3E',
                    fontWeight: 700
                  }}
                >
                  F
                </span>
                or generations across India, our <strong>Kisans (किसान)</strong> have poured their sweat and soul into the soil, only to watch multiple tiers of middlemen and brokers (दलाल/आढ़ती) siphon away up to 30-40% of their crop value. Meanwhile, city merchants and families pay elevated prices for harvest that languished in transit for days.
              </p>
              <p style={{ margin: 0 }}>
                <strong>FarmerBandh</strong> was born from a simple, unshakeable conviction: <em>The true custodian of the land deserves the full value of the harvest.</em> By uniting farmers and bulk wholesale buyers on a transparent digital platform, we replace speculation with mutual respect, direct negotiation, and authentic harvest traceability.
              </p>
            </div>

            {/* Classic Trust Pillars Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #E7E0D3'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1B4D3E' }}>
                  0% Middlemen Commission
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1B4D3E' }}>
                  सीधा बैंक खाता भुगतान (Direct NEFT/UPI)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1B4D3E' }}>
                  प्रमाणित किसान (KYC Verified)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Framed Classic Photo with Seal */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                padding: '12px',
                border: '1.5px solid #D5C7B2',
                boxShadow: '0 16px 36px -10px rgba(27,77,62,0.18)'
              }}
            >
              {/* Photo Image */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  aspectRatio: '4 / 3'
                }}
              >
                <img
                  src="/images/about/farmer-hero.jpg"
                  alt="Ramesh Patel, Indian farmer holding golden wheat harvest"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                {/* Vintage Vignette Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(27,77,62,0.7) 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Bottom Overlay Label */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    left: '16px',
                    right: '16px',
                    color: '#FFFFFF'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                    आनंद, गुजरात · Anand, Gujarat
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.15rem', fontWeight: 700 }}>
                    रमेश भाई पटेल · Ramesh Bhai Patel
                  </div>
                </div>
              </div>

              {/* Photo Caption & Note */}
              <div
                style={{
                  padding: '12px 6px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{ fontStyle: 'italic', fontSize: '0.86rem', color: '#6B7280' }}>
                  "खेत से निकली फसल, बिना किसी दलाल के सीधे ग्राहक तक।"
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#92400E',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Award size={12} />
                  <span>प्रमाणित उत्पादक</span>
                </div>
              </div>
            </div>

            {/* Decorative Classic Heritage Stamp */}
            <div
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-12px',
                backgroundColor: '#1B4D3E',
                color: '#FEF3C7',
                border: '3px solid #FDFBF7',
                borderRadius: '50%',
                width: '84px',
                height: '84px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
                transform: 'rotate(12deg)'
              }}
            >
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em' }}>100% DIRECT</span>
              <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>🌾</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 700 }}>किसान मुहर</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FULL-WIDTH HARVEST BOUNTY PHOTO BANNER */}
      <section style={{ position: 'relative', borderBottom: '1px solid #E7E0D3' }}>
        <div style={{ position: 'relative', width: '100%', height: '340px', overflow: 'hidden' }}>
          <img
            src="/images/about/harvest-bounty.jpg"
            alt="Freshly harvested produce bounty from Indian farms"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(27,77,62,0.4) 0%, rgba(15,23,42,0.85) 100%)'
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 1.5rem',
              color: '#FFFFFF'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}
            >
              <Sparkles size={14} color="#FDE68A" />
              <span>खेत की ताज़गी, आपका विश्वास</span>
            </div>

            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: '820px',
                margin: '0 0 0.75rem 0'
              }}
            >
              "जय जवान, जय किसान" — Feeding the Nation with Dignity
            </h2>

            <p style={{ fontSize: '1rem', color: '#E2E8F0', maxWidth: '640px', margin: 0 }}>
              From Sharbati wheat of Madhya Pradesh to Kesar mangoes of Junagadh and Nashik onions, FarmerBandh champions the authentic regional heritage of Indian agriculture.
            </p>
          </div>
        </div>

        {/* 4 Classic Agrarian Census Stats */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '-36px auto 0',
            position: 'relative',
            zIndex: 10,
            padding: '0 1.5rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #D5C7B2',
              borderRadius: '16px',
              boxShadow: '0 12px 28px -5px rgba(27,77,62,0.15)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              overflow: 'hidden'
            }}
          >
            {[
              {
                stat: '₹0 Cut',
                labelHindi: 'शून्य बिचौलिया शुल्क',
                desc: '100% of negotiated price goes directly to the farmer.'
              },
              {
                stat: '24-48h',
                labelHindi: 'खेत से सीधी रवानगी',
                desc: 'Direct farm dispatch with no intermediary warehouse delays.'
              },
              {
                stat: 'Grade-A',
                labelHindi: 'गुणवत्ता व फोटो प्रमाण',
                desc: 'High-resolution harvest images and moisture test disclosures.'
              },
              {
                stat: 'Direct Bandhan',
                labelHindi: 'सीधा मोलभाव व समझौता',
                desc: 'Negotiate volume and rate directly, backed by digital contracts.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.5rem 1.25rem',
                  borderRight: idx < 3 ? '1px solid #E7E0D3' : 'none',
                  textAlign: 'center',
                  backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAF8F5'
                }}
              >
                <div
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#1B4D3E',
                    marginBottom: '0.2rem'
                  }}
                >
                  {item.stat}
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#B45309', marginBottom: '0.35rem' }}>
                  {item.labelHindi}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION: WHAT FARMERBANDH DELIVERS — "खेत से दुकान तक" */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '5rem 1.5rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem'
            }}
          >
            खेती और व्यापार की नई सोच · MODERN INFRASTRUCTURE
          </div>
          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
              fontWeight: 700,
              color: '#1B4D3E',
              lineHeight: 1.2,
              margin: '0 0 0.75rem 0'
            }}
          >
            खेत से दुकान तक — What FarmerBandh Delivers
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Built specifically for India's agricultural reality: transparent, region-focused, and completely free from broker exploitation.
          </p>
        </div>

        {/* 6 Classic Parchment Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {[
            {
              icon: MapPin,
              titleEnglish: 'Location-Scoped Catalog',
              titleHindi: 'ज़िलावार मंडी कैटलॉग',
              text: 'Produce listings filtered by district and state. Keeps trade regional, saves freight costs, and ensures fresh harvest reaches city kitchens within hours of picking.'
            },
            {
              icon: Scale,
              titleEnglish: 'Direct Price Negotiation',
              titleHindi: 'सीधा मोलभाव व समझौता',
              text: 'Buyers and growers propose, counter, and finalize customized rates and volume discounts directly. Built-in 48h validity timelines keep deals honest and prompt.'
            },
            {
              icon: Truck,
              titleEnglish: 'Transparent Fulfillment',
              titleHindi: 'पारदर्शी ढुलाई व ट्रैकिंग',
              text: 'End-to-end milestone tracking across harvesting, sorting, vehicle loading, and delivery sign-off with clear digital receipt invoices.'
            },
            {
              icon: Wallet,
              titleEnglish: 'Protected Escrow Payouts',
              titleHindi: 'सुरक्षित बैंक खाता भुगतान',
              text: 'Farmer payments are safeguarded upon dispatch and paid out via direct bank NEFT/RTGS or UPI directly into their account — no delays, no commission cuts.'
            },
            {
              icon: FileCheck,
              titleEnglish: 'Kisan KYC & Land Verification',
              titleHindi: 'किसान पहचान व भूमि सत्यापन',
              text: 'Farmer credentials, land holdings (खतौनी/7-12), and organic certifications are verified by our team to protect buyers from bogus middlemen.'
            },
            {
              icon: ShieldCheck,
              titleEnglish: 'Fair Mediated Dispute Care',
              titleHindi: 'निष्पक्ष समाधान व सहायता',
              text: 'Structured quality inspections and neutral dispute review ensure both farmer and buyer are protected if moisture or grade ever differs.'
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2D9CB',
                  borderRadius: '14px',
                  padding: '2rem 1.6rem',
                  boxShadow: '0 4px 14px rgba(27,77,62,0.04)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#E8F5E9',
                    color: '#1B4D3E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#B45309',
                    marginBottom: '0.2rem'
                  }}
                >
                  {feature.titleHindi}
                </div>

                <h3
                  style={{
                    fontFamily: 'Playfair Display, Georgia, serif',
                    fontSize: '1.22rem',
                    fontWeight: 700,
                    color: '#1B4D3E',
                    margin: '0 0 0.75rem 0'
                  }}
                >
                  {feature.titleEnglish}
                </h3>

                <p style={{ fontSize: '0.92rem', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION: COMMUNITY — "किसान, व्यापारी और देश का विश्वास" */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E7E0D3',
          borderBottom: '1px solid #E7E0D3',
          padding: '5rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center'
            }}
          >
            {/* Left: Trade Handshake Documentary Photo */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#FAF8F5',
                  padding: '12px',
                  border: '1.5px solid #D5C7B2',
                  boxShadow: '0 16px 36px -10px rgba(27,77,62,0.18)'
                }}
              >
                <div
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    aspectRatio: '4 / 3'
                  }}
                >
                  <img
                    src="/images/about/trade-handshake.jpg"
                    alt="Direct trade agreement handshake between Indian farmer and wholesale buyer"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
                <div style={{ padding: '12px 6px 4px' }}>
                  <div
                    style={{
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#1B4D3E'
                    }}
                  >
                    मंडी में सीधा हाथ मिलाना · The Traditional Handshake
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '4px 0 0', fontStyle: 'italic' }}>
                    "When farmer and buyer look each other in the eye, quality is authentic and pricing is fair."
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Who It Is Built For */}
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#059669',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.5rem'
                }}
              >
                हमारा समुदाय · WHO WE SERVE
              </div>

              <h2
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 'clamp(2rem, 3.4vw, 2.6rem)',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  lineHeight: 1.2,
                  margin: '0 0 1.5rem 0'
                }}
              >
                Designed for every pillar of Indian agriculture.
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div
                  style={{
                    backgroundColor: '#FAF8F5',
                    border: '1px solid #E2D9CB',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🌾</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
                      Farmers & FPOs (किसान व उत्पादक संघ)
                    </h3>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                    From smallholders in village hamlets to modern cooperatives, producers use FarmerBandh to showcase crop varieties (Grade A, B, Organic), publish fair rates, negotiate directly, and receive prompt bank payouts.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#FAF8F5',
                    border: '1px solid #E2D9CB',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🛒</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0369A1', margin: 0 }}>
                      Wholesalers & Businesses (व्यापारी व थोक खरीदार)
                    </h3>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                    Wholesale merchants, retailers, food processors, and restaurant chains discover farm-fresh lots directly from verified growers, inspect batch photos, negotiate volume pricing, and track verified transit.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#FAF8F5',
                    border: '1px solid #E2D9CB',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#047857', margin: 0 }}>
                      Platform Custodians (प्रशासन व सुरक्षा दल)
                    </h3>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                    Our dedicated team verifies farmer land documentation, audits payout disbursements, and protects mutual trust without interfering in commercial negotiations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: OUR 4 PILLARS — "हमारे चार सिद्धांत" */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem'
            }}
          >
            हमारे चार मूल सिद्धांत · GUIDING PRINCIPLES
          </div>
          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
              fontWeight: 700,
              color: '#1B4D3E',
              margin: '0 0 0.75rem 0'
            }}
          >
            सत्य, निष्ठा और विश्वास — What We Stand For
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
            Four foundational values that guide every feature we engineer on FarmerBandh.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {[
            {
              badge: 'सिद्धांत १',
              hindiTitle: 'सच्चा मोल (Fair Price)',
              engTitle: 'Price Belongs to the Soil',
              desc: 'Price discovery belongs purely between the grower and the buyer — never diluted by hidden middleman cuts.'
            },
            {
              badge: 'सिद्धांत २',
              hindiTitle: 'सीधा नाता (Direct Bond)',
              engTitle: 'Know Who Nourishes You',
              desc: 'Food is sacred. When a buyer knows the farmer who tilled the field, every harvest carries mutual honor and care.'
            },
            {
              badge: 'सिद्धांत ३',
              hindiTitle: 'स्थानीय प्राथमिकता (Local First)',
              engTitle: 'Rooted in the Region',
              desc: 'Prioritizing district and state trade minimizes transit emissions, eliminates spoilage, and builds self-reliant rural economies.'
            },
            {
              badge: 'सिद्धांत ४',
              hindiTitle: 'पक्का विश्वास (Earned Trust)',
              engTitle: 'Integrity through Verification',
              desc: 'Trust is not a marketing slogan. It is verified through physical harvest photos, KYC authentication, and prompt payouts.'
            }
          ].map((principle, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2D9CB',
                borderRadius: '14px',
                padding: '2rem 1.5rem',
                boxShadow: '0 4px 12px rgba(27,77,62,0.04)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#EDE5D8',
                  color: '#1B4D3E',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}
              >
                {principle.badge}
              </div>

              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#B45309', marginBottom: '0.25rem' }}>
                {principle.hindiTitle}
              </div>

              <h3
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  margin: '0 0 0.75rem 0'
                }}
              >
                {principle.engTitle}
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CLASSIC INVITATION FOOTER — "आइए, इस बदलाव का हिस्सा बनें" */}
      <section
        style={{
          backgroundColor: '#1B4D3E',
          color: '#FFFFFF',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative background watermark */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '16rem',
            opacity: 0.04,
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          🌾
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#059669',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            <SproutIcon size={28} color="#059669" />
          </div>

          <div
            style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#A7F3D0',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.75rem'
            }}
          >
            खेती का नया सवेरा · JOIN THE MOVEMENT
          </div>

          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2.2rem, 4vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              margin: '0 0 1.25rem 0'
            }}
          >
            आइए, इस बदलाव का हिस्सा बनें।
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#D1FAE5',
              lineHeight: 1.7,
              maxWidth: '620px',
              margin: '0 auto 2.5rem'
            }}
          >
            Whether you cultivate fertile acres or run a wholesale business, FarmerBandh connects you directly. Zero brokers. Pure trust. Direct harvest.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap'
            }}
          >
            <Link
              to="/auth"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1B4D3E',
                padding: '0.9rem 2.4rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Join as Farmer or Buyer</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/"
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                padding: '0.9rem 2rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
