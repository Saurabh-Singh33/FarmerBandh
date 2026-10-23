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
        background: '#FFFFFF',
        border: '1.5px solid #C4D9C4',
        borderRadius: '16px',
        padding: '1.25rem 1.6rem',
        marginBottom: '2.5rem',
        boxShadow: '0 6px 24px rgba(27, 77, 62, 0.08)',
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
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#EAF3EA',
              border: '1.5px solid #C4D9C4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1B4D3E',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(27, 77, 62, 0.05)'
            }}
          >
            <Globe size={21} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: '#1B4D3E',
                  letterSpacing: '-0.01em',
                  margin: 0
                }}
              >
                Regional Language
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  backgroundColor: '#EAF3EA',
                  border: '1px solid #B8D0B8',
                  padding: '2px 9px',
                  borderRadius: '9999px'
                }}
              >
                ભાષા / भाषा
              </span>
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#3D5447',
                lineHeight: 1.45,
                margin: '3px 0 0',
                fontWeight: 500
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
                    ? '1.5px solid #1B4D3E'
                    : '1.5px solid #C4D9C4',
                  backgroundColor: isActive
                    ? '#1B4D3E'
                    : '#FFFFFF',
                  boxShadow: isActive
                    ? '0 3px 10px rgba(27, 77, 62, 0.28)'
                    : '0 1px 3px rgba(0, 0, 0, 0.04)',
                  color: isActive ? '#FFFFFF' : '#1E293B',
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F0F7F0';
                    e.currentTarget.style.borderColor = '#1B4D3E';
                    e.currentTarget.style.color = '#1B4D3E';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#C4D9C4';
                    e.currentTarget.style.color = '#1E293B';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {lang.code === 'en' ? <UkFlag /> : <IndiaFlag />}
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#FFFFFF' : '#1E293B',
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
                        fontWeight: 500
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
          borderTop: '1px solid #DCE6DC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.76rem',
          color: '#425C4D'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {isTranslating ? (
            <>
              <Loader2 size={13} className="spin-animate" color="#1B4D3E" />
              <span style={{ color: '#1B4D3E', fontWeight: 600 }}>
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
              <span style={{ color: '#425C4D' }}>
                Active Language:{' '}
                <strong style={{ color: '#1B4D3E', fontWeight: 800 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1B4D3E', fontWeight: 600 }}>
          <ShieldCheck size={15} color="#1B4D3E" />
          <span>Regional Language Support for Gujarat & India</span>
        </div>
      </div>
    </div>
  );
};
