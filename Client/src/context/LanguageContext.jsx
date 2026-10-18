import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    label: 'English',
    badge: 'Original'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    label: 'हिन्दी',
    badge: 'Hindi'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    label: 'ગુજરાતી',
    badge: 'Gujarati'
  }
];

function getStoredLanguage() {
  try {
    const saved = localStorage.getItem('farmerbandh_lang');
    if (saved && ['en', 'hi', 'gu'].includes(saved)) {
      return saved;
    }
    // Inspect googtrans cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && ['en', 'hi', 'gu'].includes(match[1])) {
      return match[1];
    }
  } catch (err) {
    console.error('Error reading saved language:', err);
  }
  return 'en';
}

function setCookie(name, value, days) {
  let expires = '';
  if (days !== undefined) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/;`;
  try {
    const host = window.location.hostname;
    document.cookie = `${name}=${value || ''}${expires}; path=/; domain=${host};`;
    const parts = host.split('.');
    if (parts.length > 1) {
      const rootDomain = '.' + parts.slice(-2).join('.');
      document.cookie = `${name}=${value || ''}${expires}; path=/; domain=${rootDomain};`;
    }
  } catch (e) {
    // Ignore domain cookie issues
  }
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(getStoredLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(() => {
    try {
      const chosen = localStorage.getItem('farmerbandh_lang_chosen');
      return !chosen;
    } catch {
      return false;
    }
  });

  // Poll for Google Translate combo readiness
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        setIsGoogleReady(true);
        const stored = getStoredLanguage();
        if (stored && stored !== 'en' && combo.value !== stored) {
          combo.value = stored;
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }
        clearInterval(interval);
      }
      if (attempts >= 30) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (langCode) => {
    if (!['en', 'hi', 'gu'].includes(langCode)) return;
    if (langCode === currentLanguage) return;

    setIsTranslating(true);
    setCurrentLanguage(langCode);

    try {
      localStorage.setItem('farmerbandh_lang', langCode);
      localStorage.setItem('farmerbandh_lang_chosen', 'true');
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }

    if (langCode === 'en') {
      // Clear cookies
      setCookie('googtrans', '', -1);
      setCookie('googtrans', '/en/en', 1);

      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = 'en';
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Revert completely to clean un-translated DOM
      setTimeout(() => {
        window.location.reload();
      }, 250);
      return;
    }

    // Set cookie for Hindi or Gujarati
    const cookieVal = `/en/${langCode}`;
    setCookie('googtrans', cookieVal, 30);

    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      setTimeout(() => {
        setIsTranslating(false);
      }, 700);
    } else {
      // Reload so Google script boots with the cookie
      setTimeout(() => {
        window.location.reload();
      }, 250);
    }
  };

  const chooseInitialLanguage = (langCode) => {
    try {
      localStorage.setItem('farmerbandh_lang_chosen', 'true');
      localStorage.setItem('farmerbandh_lang', langCode);
    } catch (e) {
      console.warn('Error storing initial language selection', e);
    }

    setShowInitialModal(false);

    if (langCode === 'en' && currentLanguage === 'en') {
      // Already English, no translation action needed
      return;
    }

    changeLanguage(langCode);
  };

  const openInitialPrompt = () => {
    setShowInitialModal(true);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        showInitialModal,
        setShowInitialModal,
        chooseInitialLanguage,
        openInitialPrompt,

        isTranslating,
        isGoogleReady,
        languages: LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
