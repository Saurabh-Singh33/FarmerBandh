import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Clock, ShieldCheck } from 'lucide-react';
import { SproutIcon, InstagramIcon, FacebookIcon, TwitterIcon } from './SocialIcons';
import { FooterLanguageSelector } from './FooterLanguageSelector';

export const Footer = () => {
  return (
    <footer
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #0F1C16 0%, #070D0A 100%)',
        color: '#E2E8F0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 12px rgba(16, 185, 129, 0.25)'
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
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                  display: 'block',
                  lineHeight: 1.15
                }}
              >
                FarmerBandh
              </span>
              <span style={{ fontSize: '0.7rem', color: '#34D399', letterSpacing: '0.08em', fontWeight: 700 }}>
                DIRECT LOCAL PRODUCE
              </span>
            </div>
          </Link>

          <p
            style={{
              fontSize: '0.88rem',
              color: '#94A3B8',
              lineHeight: 1.65,
              margin: '0 0 1.25rem 0'
            }}
          >
            Direct farm-to-buyer agricultural marketplace. Connecting verified regional growers with commercial buyers through transparent negotiation, fair pricing, and escrow protection.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#94A3B8'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)'
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
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F8FAFC',
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
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F8FAFC',
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
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#F8FAFC',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
              <Mail size={15} color="#10B981" style={{ flexShrink: 0 }} />
              <span>Email:</span>
              <a
                href="mailto:support@farmerbandh.com"
                style={{ color: '#F1F5F9', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#F1F5F9')}
              >
                support@farmerbandh.com
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
              <Phone size={15} color="#10B981" style={{ flexShrink: 0 }} />
              <span>Toll-Free:</span>
              <a
                href="tel:1800123456"
                style={{ color: '#F1F5F9', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#F1F5F9')}
              >
                1800-123-456
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
              <Clock size={14} color="#10B981" style={{ flexShrink: 0 }} />
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
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748B'
        }}
      >
        <div>
          © {new Date().getFullYear()} FarmerBandh · All rights reserved.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94A3B8', fontSize: '0.78rem' }}>
          <ShieldCheck size={15} color="#10B981" />
          <span>Direct Farm-to-Buyer Escrow Protection</span>
        </div>

        <div style={{ color: '#64748B', fontSize: '0.78rem' }}>
          Proudly crafted for Indian Agriculture 🇮🇳
        </div>
      </div>
    </footer>
  );
};
