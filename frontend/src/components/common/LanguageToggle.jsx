import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn-sm"
      style={{
        padding: '5px 12px',
        fontSize: '0.82rem',
        fontWeight: 700,
        borderRadius: '20px',
        background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
        transition: 'all 0.2s ease',
      }}
      title={lang === 'en' ? 'ગુજરાતીમાં જુઓ (Switch to Gujarati)' : 'Switch to English'}
    >
      🌐 {lang === 'en' ? 'ગુજરાતી' : 'English'}
    </button>
  );
}
