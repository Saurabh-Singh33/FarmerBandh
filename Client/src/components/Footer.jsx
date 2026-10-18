import React from 'react';
import { Link } from 'react-router-dom';
import { SproutIcon, InstagramIcon, FacebookIcon, TwitterIcon } from './SocialIcons';
import { FooterLanguageSelector } from './FooterLanguageSelector';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0D261E',
        color: '#E8F5E9',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingTop: '3.5rem',
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
                backgroundColor: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0D261E',
                boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
              }}
            >
              <SproutIcon size={22} color="#0D261E" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  display: 'block'
                }}
              >
                FarmerBandh
              </span>
              <span style={{ fontSize: '0.72rem', color: '#A7F3D0', letterSpacing: '0.06em', fontWeight: 600 }}>
                DIRECT LOCAL PRODUCE
              </span>
            </div>
          </Link>

          <p
            style={{
              fontSize: '0.9rem',
              color: '#A7F3D0',
              lineHeight: 1.6,
              margin: '0 0 1.25rem 0'
            }}
          >
            Direct farm-to-buyer agricultural marketplace. Connecting verified regional growers with commercial buyers through transparent negotiation, fair pricing, and escrow protection.
          </p>

          <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', color: '#BBF7D0' }}>
            Built for farmers across Gujarat & India
          </div>
        </div>

        {/* Column 2 — Platform */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94A3B8',
              marginBottom: '1.25rem'
            }}
          >
            Platform
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link to="/" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/marketplace" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
                About FarmerBandh
              </Link>
            </li>
            <li>
              <Link to="/help" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
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
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94A3B8',
              marginBottom: '1.25rem'
            }}
          >
            Legal & Trust
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a href="/help#terms" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/help#privacy" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/help#security" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
                Data Security Standards
              </a>
            </li>
            <li>
              <a href="/help#faq" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.15s' }}>
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
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94A3B8',
              marginBottom: '1.25rem'
            }}
          >
            Connect
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <a
              href="https://instagram.com/farmerbandh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow FarmerBandh on Instagram"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'all 0.15s ease'
              }}
            >
              <InstagramIcon size={19} color="#FFFFFF" />
            </a>

            <a
              href="https://facebook.com/farmerbandh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect with FarmerBandh on Facebook"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'all 0.15s ease'
              }}
            >
              <FacebookIcon size={19} color="#FFFFFF" />
            </a>

            <a
              href="https://twitter.com/farmerbandh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow FarmerBandh on X"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'all 0.15s ease'
              }}
            >
              <TwitterIcon size={19} color="#FFFFFF" />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
            <div style={{ color: '#94A3B8' }}>
              Email:{' '}
              <a href="mailto:support@farmerbandh.com" style={{ color: '#F8FAFC', textDecoration: 'none', fontWeight: 500 }}>
                support@farmerbandh.com
              </a>
            </div>
            <div style={{ color: '#94A3B8' }}>
              Toll-Free:{' '}
              <a href="tel:1800123456" style={{ color: '#F8FAFC', textDecoration: 'none', fontWeight: 600 }}>
                1800-123-456
              </a>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6EE7B7', marginTop: '2px' }}>
              Mon – Sat: 9:00 AM – 6:00 PM IST
            </div>
          </div>
        </div>
      </div>

      {/* Language Selection Option */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <FooterLanguageSelector />
      </div>

      {/* Bottom Copyright */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1.5rem 1.5rem 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#86EFAC'
        }}
      >
        © 2026 FarmerBandh · Made in India · All rights reserved.
      </div>
    </footer>
  );
};
