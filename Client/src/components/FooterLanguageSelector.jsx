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
        background: 'linear-gradient(135deg, rgba(20, 56, 44, 0.55) 0%, rgba(10, 30, 23, 0.75) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(74, 222, 128, 0.16)',
        borderRadius: '16px',
        padding: '1.25rem 1.6rem',
        marginBottom: '2.5rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
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
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(16, 185, 129, 0.08))',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4ADE80',
              boxShadow: '0 2px 10px rgba(34, 197, 94, 0.15)',
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
                  color: '#86EFAC',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
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
                    ? '1.5px solid #22C55E'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: isActive
                    ? 'rgba(34, 197, 94, 0.18)'
                    : 'rgba(255, 255, 255, 0.04)',
                  boxShadow: isActive
                    ? '0 0 14px rgba(34, 197, 94, 0.22), 0 2px 6px rgba(0, 0, 0, 0.25)'
                    : 'none',
                  color: '#FFFFFF',
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {lang.code === 'en' ? <UkFlag /> : <IndiaFlag />}
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : '#E2E8F0',
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
                        color: isActive ? '#86EFAC' : '#94A3B8',
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
                      backgroundColor: '#22C55E',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#081B15',
                      marginLeft: '0.2rem',
                      boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
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
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.76rem',
          color: '#94A3B8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {isTranslating ? (
            <>
              <Loader2 size={13} className="spin-animate" color="#4ADE80" />
              <span style={{ color: '#86EFAC', fontWeight: 500 }}>
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
                  backgroundColor: '#22C55E',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #22C55E'
                }}
              />
              <span>
                Active Language:{' '}
                <strong style={{ color: '#F1F5F9', fontWeight: 600 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6EE7B7' }}>
          <ShieldCheck size={14} color="#4ADE80" />
          <span>Regional Language Support for Gujarat & India</span>
        </div>
      </div>
    </div>
  );
};
