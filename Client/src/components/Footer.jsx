import React from 'react';
import { Link } from 'react-router-dom';
import { SproutIcon, InstagramIcon, FacebookIcon, TwitterIcon } from './SocialIcons';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#143B2F',
        color: '#E8F5E9',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'Inter, sans-serif',
        paddingTop: '3.5rem',
        paddingBottom: '2rem'
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
                color: '#143B2F',
                boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
              }}
            >
              <SproutIcon size={22} color="#143B2F" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  display: 'block'
                }}
              >
                FarmerBandh
              </span>
              <span style={{ fontSize: '0.72rem', color: '#86EFAC', letterSpacing: '0.04em' }}>
                DIRECT LOCAL PRODUCE
              </span>
            </div>
          </Link>

          <p
            style={{
              fontSize: '0.92rem',
              color: '#A7F3D0',
              lineHeight: 1.6,
              margin: '0 0 1.25rem 0'
            }}
          >
            Trade directly. Grow together. Connecting regional farmers and commercial buyers with transparent negotiation, verified profiles, and escrow-style protection.
          </p>

          <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#BBF7D0' }}>
            Built for farmers across Gujarat & India
          </div>
        </div>

        {/* Column 2 — Platform */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#86EFAC',
              marginBottom: '1.25rem'
            }}
          >
            Platform
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link to="/" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/marketplace" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                About FarmerBandh
              </Link>
            </li>
            <li>
              <Link to="/help" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 — Legal */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#86EFAC',
              marginBottom: '1.25rem'
            }}
          >
            Legal & Trust
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a href="/help#terms" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/help#privacy" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/help#security" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Data Security Standards
              </a>
            </li>
            <li>
              <a href="/help#faq" style={{ color: '#E8F5E9', textDecoration: 'none', fontSize: '0.92rem', transition: 'color 0.15s' }}>
                Dispute & Return Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4 — Connect */}
        <div>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#86EFAC',
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
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'background-color 0.15s ease'
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
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'background-color 0.15s ease'
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
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'background-color 0.15s ease'
              }}
            >
              <TwitterIcon size={19} color="#FFFFFF" />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
            <div style={{ color: '#BBF7D0' }}>
              Email:{' '}
              <a href="mailto:support@farmerbandh.com" style={{ color: '#FFFFFF', textDecoration: 'underline' }}>
                support@farmerbandh.com
              </a>
            </div>
            <div style={{ color: '#BBF7D0' }}>
              Toll-Free:{' '}
              <a href="tel:1800123456" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>
                1800-123-456
              </a>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#86EFAC', marginTop: '2px' }}>
              Mon – Sat: 9:00 AM – 6:00 PM IST
            </div>
          </div>
        </div>
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
