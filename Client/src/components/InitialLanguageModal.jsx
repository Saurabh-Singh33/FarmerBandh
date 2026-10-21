import React, { useState } from 'react';
import { Globe, ArrowRight, Check, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const UkFlag = () => (
  <svg
    width="26"
    height="18"
    viewBox="0 0 60 30"
    style={{
      borderRadius: '4px',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      flexShrink: 0
    }}
  >
    <clipPath id="init-modal-uk-s">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <clipPath id="init-modal-uk-t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <g clipPath="url(#init-modal-uk-s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#init-modal-uk-t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const IndiaFlag = () => (
  <svg
    width="26"
    height="18"
    viewBox="0 0 22 16"
    style={{
      borderRadius: '4px',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      flexShrink: 0
    }}
  >
    <rect width="22" height="5.33" fill="#FF9933" />
    <rect y="5.33" width="22" height="5.33" fill="#FFFFFF" />
    <rect y="10.66" width="22" height="5.34" fill="#138808" />
    <circle cx="11" cy="8" r="2.2" fill="none" stroke="#000080" strokeWidth="0.6" />
    <circle cx="11" cy="8" r="0.6" fill="#000080" />
  </svg>
);

const UI_STRINGS = {
  en: {
    badge: 'Language Selection',
    title: 'Choose your preferred language',
    subtitle: 'Select how you would like to view listings, mandi rates, and seller chats.',
    subtagline: 'Choose your language • अपनी भाषा चुनें • તમારી પસંદગીની ભાષા પસંદ કરો',
    continueBtn: 'Continue in English',
    footerNote: 'Saved on this browser · You can switch anytime in the footer',
    skipBtn: 'Skip for now',
    closeTooltip: 'Close and continue with English'
  },
  hi: {
    badge: 'भाषा चयन',
    title: 'अपनी पसंदीदा भाषा चुनें',
    subtitle: 'फसल लिस्टिंग, मंडी भाव और विक्रेता चैट देखने के लिए अपनी भाषा चुनें।',
    subtagline: 'अपनी भाषा चुनें • તમારી પસંદગીની ભાષા પસંદ કરો • Choose your language',
    continueBtn: 'हिन्दी में जारी रखें',
    footerNote: 'इस ब्राउज़र पर सहेजा जाएगा · आप इसे कभी भी बदल सकते हैं',
    skipBtn: 'अभी छोड़ें',
    closeTooltip: 'बंद करें और आगे बढ़ें'
  },
  gu: {
    badge: 'ભાષા પસંદગી',
    title: 'તમારી પસંદગીની ભાષા પસંદ કરો',
    subtitle: 'પાક લિસ્ટિંગ, બજાર ભાવ અને વેપારી ચેટ જોવા માટે ભાષા પસંદ કરો.',
    subtagline: 'તમારી પસંદગીની ભાષા પસંદ કરો • अपनी भाषा चुनें • Choose your language',
    continueBtn: 'ગુજરાતીમાં આગળ વધો',
    footerNote: 'આ બ્રાઉઝર પર સાચવવામાં આવશે · તમે ફૂટરમાંથી ગમે ત્યારે બદલી શકો છો',
    skipBtn: 'હમણાં માટે રહેવા દો',
    closeTooltip: 'બંધ કરો અને આગળ વધો'
  }
};

export const InitialLanguageModal = () => {
  const { showInitialModal, chooseInitialLanguage, currentLanguage } = useLanguage();
  const [selectedCode, setSelectedCode] = useState(currentLanguage || 'en');

  if (!showInitialModal) return null;

  const currentStrings = UI_STRINGS[selectedCode] || UI_STRINGS.en;

  const options = [
    {
      code: 'en',
      title: 'English',
      subtitle: 'Browse full marketplace in English',
      badge: 'Default',
      flag: <UkFlag />,
      selectedCue: 'Selected',
      selectCue: 'Select'
    },
    {
      code: 'hi',
      title: 'हिन्दी',
      subtitle: 'मंडी भाव और उत्पाद हिंदी में देखें',
      badge: 'अनुशंसित',
      flag: <IndiaFlag />,
      selectedCue: 'चयनित',
      selectCue: 'चुनें'
    },
    {
      code: 'gu',
      title: 'ગુજરાતી',
      subtitle: 'બજાર ભાવ અને ઉત્પાદનો ગુજરાતીમાં જુઓ',
      badge: 'પ્રાદેશિક',
      flag: <IndiaFlag />,
      selectedCue: 'પસંદ કરેલ',
      selectCue: 'પસંદ કરો'
    }
  ];

  const handleConfirm = (codeToApply) => {
    const finalCode = codeToApply || selectedCode;
    chooseInitialLanguage(finalCode);
  };

  const handleDismiss = () => {
    chooseInitialLanguage(currentLanguage || 'en');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
    >
      <div
        className="notranslate"
        translate="no"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.06)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Subtle Brand Accent Bar at the Top */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'linear-gradient(90deg, #1B4D3E 0%, #2E7D32 50%, #E65100 100%)'
          }}
        />

        <div style={{ padding: '2rem 2rem 1.75rem' }}>
          {/* Top Bar: Sprout badge & Close Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                transition: 'all 0.15s ease'
              }}
            >
              <Globe size={14} color="#059669" />
              <span>{currentStrings.badge}</span>
            </div>

            <button
              type="button"
              id="close-language-modal"
              onClick={handleDismiss}
              title={currentStrings.closeTooltip}
              aria-label="Close modal"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E2E8F0';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Heading & Subtitle (Reacts to selected language) */}
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <h2
              id="language-modal-title"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: '0 0 0.35rem 0',
                lineHeight: 1.3
              }}
            >
              {currentStrings.title}
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: '#475569',
                margin: '0 0 0.25rem 0',
                lineHeight: 1.5
              }}
            >
              {currentStrings.subtitle}
            </p>

            <p
              style={{
                fontSize: '0.82rem',
                color: '#64748B',
                margin: 0
              }}
            >
              {currentStrings.subtagline}
            </p>
          </div>

          {/* 3 Modern Language Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.5rem'
            }}
          >
            {options.map((opt) => {
              const isSelected = selectedCode === opt.code;
              return (
                <div
                  key={opt.code}
                  id={`init-lang-${opt.code}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedCode(opt.code);
                  }}
                  onDoubleClick={() => {
                    handleConfirm(opt.code);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCode(opt.code);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.15rem 1rem',
                    borderRadius: '14px',
                    backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                    border: isSelected ? '2px solid #16A34A' : '1.5px solid #E2E8F0',
                    boxShadow: isSelected
                      ? '0 4px 14px -1px rgba(22, 163, 74, 0.18)'
                      : '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    minHeight: '135px',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#10B981';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(16, 185, 129, 0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    }
                  }}
                >
                  {/* Top Row: Flag & Radio Indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {opt.flag}
                      {opt.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? '#DCFCE7' : '#F1F5F9',
                            color: isSelected ? '#15803D' : '#64748B'
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {/* Radio Checkmark Circle */}
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? '#16A34A' : 'transparent',
                        border: isSelected ? 'none' : '1.5px solid #CBD5E1',
                        color: '#FFFFFF',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Middle Content: Title and Subtitle */}
                  <div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: isSelected ? '#14532D' : '#0F172A',
                        marginBottom: '0.2rem'
                      }}
                    >
                      {opt.title}
                    </div>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: isSelected ? '#166534' : '#64748B',
                        lineHeight: 1.4
                      }}
                    >
                      {opt.subtitle}
                    </div>
                  </div>

                  {/* Native Localized Status Cue (No English words on Hindi/Gujarati cards) */}
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: isSelected ? '#15803D' : '#94A3B8',
                      marginTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <span>{isSelected ? opt.selectedCue : opt.selectCue}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Single Unified Primary CTA Button (Dynamic) */}
          <button
            type="button"
            id="confirm-initial-language"
            onClick={() => handleConfirm(selectedCode)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              fontSize: '0.96rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(27, 77, 62, 0.22)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#143B2F';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(27, 77, 62, 0.28)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1B4D3E';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 77, 62, 0.22)';
            }}
          >
            <span>{currentStrings.continueBtn}</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Clean, Fully Localized Footer Note */}
        <div
          style={{
            padding: '0.85rem 2rem',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: '#64748B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>{currentStrings.footerNote}</span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            {currentStrings.skipBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
