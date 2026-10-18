import React from 'react';
import { Globe, Check, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const UkFlag = () => (
  <svg
    width="22"
    height="16"
    viewBox="0 0 60 30"
    style={{ borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', flexShrink: 0 }}
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
    width="22"
    height="16"
    viewBox="0 0 22 16"
    style={{ borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', flexShrink: 0 }}
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
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2.5rem',
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
        {/* Left Side: Title & Description */}
        <div style={{ maxWidth: '440px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#86EFAC',
                border: '1px solid rgba(134, 239, 172, 0.3)'
              }}
            >
              <Globe size={18} />
            </div>
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                margin: 0
              }}
            >
              Website Language / भाषा चुनें / ભાષા પસંદ કરો
            </h3>
          </div>
          <p
            style={{
              fontSize: '0.84rem',
              color: '#A7F3D0',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Translate the entire website instantly to your preferred regional language (Products, Prices, Chat & Orders).
          </p>
        </div>

        {/* Right Side: Language Switcher Buttons (marked notranslate so button text remains distinct) */}
        <div
          className="notranslate"
          translate="no"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem'
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '12px',
                  border: isActive
                    ? '1.5px solid #4ADE80'
                    : '1px solid rgba(255, 255, 255, 0.16)',
                  backgroundColor: isActive
                    ? 'rgba(74, 222, 128, 0.16)'
                    : 'rgba(255, 255, 255, 0.05)',
                  boxShadow: isActive
                    ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                    : 'none',
                  color: '#FFFFFF',
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {lang.code === 'en' ? <UkFlag /> : <IndiaFlag />}
                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? '#FFFFFF' : '#E8F5E9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{lang.nativeName}</span>
                    {lang.code !== 'en' && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: isActive ? '#BBF7D0' : '#86EFAC',
                          fontWeight: 400
                        }}
                      >
                        ({lang.name})
                      </span>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#22C55E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#143B2F',
                      marginLeft: '0.25rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Status Badge */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: '#86EFAC'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {isTranslating ? (
            <>
              <Loader2 size={13} className="spin-animate" color="#4ADE80" />
              <span style={{ color: '#BBF7D0', fontWeight: 500 }}>
                Translating full website... કૃપા કરીને રાહ જુઓ... कृपया प्रतीक्षा करें...
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#4ADE80',
                  display: 'inline-block'
                }}
              />
              <span>
                Active Language:{' '}
                <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#A7F3D0' }}>
          <ShieldCheck size={14} color="#4ADE80" />
          <span>Regional Language Support for Gujarat & India</span>
        </div>
      </div>
    </div>
  );
};
