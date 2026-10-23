import React from 'react';
import { Globe, Check, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const UkFlag = () => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 60 30"
    style={{ borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', flexShrink: 0 }}
  >
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const IndiaFlag = () => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 22 16"
    style={{ borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', flexShrink: 0 }}
  >
    <rect width="22" height="5.33" fill="#FF9933" />
    <rect y="5.33" width="22" height="5.33" fill="#FFFFFF" />
    <rect y="10.66" width="22" height="5.34" fill="#138808" />
    <circle cx="11" cy="8" r="2.2" fill="none" stroke="#000080" strokeWidth="0.6" />
    <circle cx="11" cy="8" r="0.6" fill="#000080" />
  </svg>
);

export const FooterLanguageSelector = () => {
  const { currentLanguage, changeLanguage, isTranslating } = useLanguage();

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.025)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '16px',
        padding: '1.25rem 1.6rem',
        marginBottom: '2.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        position: 'relative'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Left Side: Clean Icon, Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', maxWidth: '480px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
              flexShrink: 0
            }}
          >
            <Globe size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                  margin: 0
                }}
              >
                Regional Language
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                ભાષા / भाषा
              </span>
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#94A3B8',
                lineHeight: 1.45,
                margin: '3px 0 0'
              }}
            >
              Instant translation across listings, negotiations, and orders
            </p>
          </div>
        </div>

        {/* Right Side: Language Switcher Buttons */}
        <div
          className="notranslate"
          translate="no"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          {LANGUAGES.map((lang) => {
            const isActive = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                id={`footer-lang-${lang.code}`}
                onClick={() => changeLanguage(lang.code)}
                disabled={isTranslating && isActive}
                title={`Switch website language to ${lang.name}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: isActive
                    ? '1.5px solid #10B981'
                    : '1px solid rgba(255, 255, 255, 0.09)',
                  backgroundColor: isActive
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  boxShadow: isActive
                    ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                    : 'none',
                  color: '#FFFFFF',
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {lang.code === 'en' ? <UkFlag /> : <IndiaFlag />}
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span>{lang.nativeName}</span>
                  {lang.code !== 'en' && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: isActive ? '#A7F3D0' : '#64748B',
                        fontWeight: 400
                      }}
                    >
                      ({lang.name})
                    </span>
                  )}
                </span>

                {isActive && (
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      marginLeft: '0.2rem'
                    }}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Status Strip */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.76rem',
          color: '#64748B'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {isTranslating ? (
            <>
              <Loader2 size={13} className="spin-animate" color="#10B981" />
              <span style={{ color: '#94A3B8', fontWeight: 500 }}>
                Translating marketplace... કૃપા કરીને રાહ જુઓ... कृपया प्रतीक्षा करें...
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  display: 'inline-block'
                }}
              />
              <span style={{ color: '#94A3B8' }}>
                Active Language:{' '}
                <strong style={{ color: '#E2E8F0', fontWeight: 600 }}>
                  {currentLanguage === 'hi'
                    ? 'हिन्दी (Hindi)'
                    : currentLanguage === 'gu'
                    ? 'ગુજરાતી (Gujarati)'
                    : 'English'}
                </strong>
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>Regional Language Support for Gujarat & India</span>
        </div>
      </div>
    </div>
  );
};
