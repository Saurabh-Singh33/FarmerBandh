import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Clock, ShieldCheck } from 'lucide-react';
import { SproutIcon, InstagramIcon, FacebookIcon, TwitterIcon } from './SocialIcons';
import { FooterLanguageSelector } from './FooterLanguageSelector';

export const Footer = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #EBF3EB 0%, #DCE8DC 100%)',
        color: '#24382C',
        borderTop: '3px solid #1B4D3E',
        boxShadow: '0 -4px 20px rgba(27, 77, 62, 0.05)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingTop: '3.75rem',
        paddingBottom: '2.5rem'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}
      >
        {/* Column 1 — Brand */}
        <div style={{ maxWidth: '320px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1B4D3E 0%, #2D6A4F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 12px rgba(27, 77, 62, 0.25)'
              }}
            >
              <SproutIcon size={22} color="#FFFFFF" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#1B4D3E',
                  letterSpacing: '-0.025em',
                  display: 'block',
                  lineHeight: 1.15
                }}
              >
                FarmerBandh
              </span>
              <span style={{ fontSize: '0.7rem', color: '#2D6A4F', letterSpacing: '0.08em', fontWeight: 800 }}>
                DIRECT LOCAL PRODUCE
              </span>
            </div>
          </Link>

          <p
            style={{
              fontSize: '0.88rem',
              color: '#2C4235',
              lineHeight: 1.65,
              margin: '0 0 1.25rem 0',
              fontWeight: 450
            }}
          >
            Direct farm-to-buyer agricultural marketplace. Connecting verified regional growers with commercial buyers through transparent negotiation, fair pricing, and escrow protection.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #C4D9C4',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#1B4D3E',
              boxShadow: '0 2px 8px rgba(27, 77, 62, 0.06)'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.55)'
              }}
            />
            Built for farmers across Gujarat & India
          </div>
        </div>

        {/* Column 2 — Platform */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              color: '#1B4D3E',
              marginBottom: '1.25rem'
            }}
          >
            Platform
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link to="/" className="footer-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/marketplace" className="footer-link">
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/about" className="footer-link">
                About FarmerBandh
              </Link>
            </li>
            <li>
              <Link to="/help" className="footer-link">
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="footer-link">
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 — Legal */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              color: '#1B4D3E',
              marginBottom: '1.25rem'
            }}
          >
            Legal & Trust
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a href="/help#terms" className="footer-link">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/help#privacy" className="footer-link">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/help#security" className="footer-link">
                Data Security Standards
              </a>
            </li>
            <li>
              <a href="/help#faq" className="footer-link">
                Dispute & Return Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4 — Connect */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              color: '#1B4D3E',
              marginBottom: '1.25rem'
            }}
          >
            Connect
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.35rem' }}>
            <a
              href="https://instagram.com/farmerbandh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow FarmerBandh on Instagram"
              className="footer-social-btn"
            >
              <InstagramIcon size={18} />
            </a>

            <a
              href="https://facebook.com/farmerbandh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect with FarmerBandh on Facebook"
              className="footer-social-btn"
            >
              <FacebookIcon size={18} />
            </a>

            <a
              href="https://twitter.com/farmerbandh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow FarmerBandh on X"
              className="footer-social-btn"
            >
              <TwitterIcon size={18} />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#425C4D' }}>
              <Mail size={15} color="#1B4D3E" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>Email:</span>
              <a
                href="mailto:support@farmerbandh.com"
                style={{ color: '#1B4D3E', textDecoration: 'none', fontWeight: 700, transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2D6A4F')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#1B4D3E')}
              >
                support@farmerbandh.com
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#425C4D' }}>
              <Phone size={15} color="#1B4D3E" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>Toll-Free:</span>
              <a
                href="tel:1800123456"
                style={{ color: '#1B4D3E', textDecoration: 'none', fontWeight: 800, fontSize: '0.92rem', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2D6A4F')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#1B4D3E')}
              >
                1800-123-456
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.78rem', color: '#425C4D', marginTop: '2px', fontWeight: 500 }}>
              <Clock size={14} color="#1B4D3E" style={{ flexShrink: 0 }} />
              <span>Mon – Sat: 9:00 AM – 6:00 PM IST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selection Option */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <FooterLanguageSelector />
      </div>

      {/* Bottom Copyright & Trust Strip */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1.5rem 1.5rem 0',
          borderTop: '1.5px solid #C4D9C4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#425C4D'
        }}
      >
        <div style={{ fontWeight: 500 }}>
          © {new Date().getFullYear()} FarmerBandh · All rights reserved.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#1B4D3E', fontSize: '0.8rem', fontWeight: 700 }}>
          <ShieldCheck size={16} color="#1B4D3E" />
          <span>Direct Farm-to-Buyer Escrow Protection</span>
        </div>

        <div style={{ color: '#425C4D', fontSize: '0.78rem', fontWeight: 500 }}>
          Proudly crafted for Indian Agriculture 🇮🇳
        </div>
      </div>
    </footer>
  );
};
