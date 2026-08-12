import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import LanguageToggle from './LanguageToggle';
import { Menu, X, Shield, Phone, Mail, FileText, Award, Heart } from 'lucide-react';

export default function Header() {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mahadanStatus, setMahadanStatus] = useState('OPEN');

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    api.get('/cms/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setMahadanStatus(res.data.settings.mahadan_status || 'OPEN');
      }
    }).catch(() => {});
  }, []);

  return (
    <header className="site-header">
      {/* Top Utility Bar */}
      <div className="top-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.78rem' }}>
            <span><Phone size={12} style={{ display: 'inline', marginRight: '3px' }} /> +91 7043704446</span>
            <span><Mail size={12} style={{ display: 'inline', marginRight: '3px' }} /> info@satwaramahamandal.org</span>
            <span className="top-bar-reg">
              {t('trust_reg')}
            </span>
            {/* Social Media Links */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginLeft: '6px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '10px' }}>
              <a href="https://www.facebook.com/shreesamastsatvaramahamandal" target="_blank" rel="noopener noreferrer" title="Facebook Page" style={{ color: '#ffffff', display: 'flex', alignItems: 'center', opacity: 0.9, transition: 'opacity 0.2s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/samast_satvara_mahamandal" target="_blank" rel="noopener noreferrer" title="Instagram Profile" style={{ color: '#ffffff', display: 'flex', alignItems: 'center', opacity: 0.9, transition: 'opacity 0.2s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://api.whatsapp.com/send/?phone=917043704446&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" title="WhatsApp Contact" style={{ color: '#25D366', display: 'flex', alignItems: 'center', opacity: 0.95, transition: 'opacity 0.2s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {mahadanStatus !== 'CLOSED' && (
              <Link to="/mahadan" style={{ color: '#FFD700', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 215, 0, 0.15)', padding: '2px 8px', borderRadius: '12px', border: '1px solid #FFD700' }}>
                <Heart size={13} fill="#FFD700" /> {t('nav_mahadan') || 'મહા દાન'}
              </Link>
            )}
            <Link to="/admission/merit-list" style={{ color: 'var(--accent-amber)', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={13} /> {t('nav_merit_list') || 'Merit List'}
            </Link>
            <Link to="/admission/track" style={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={12} /> {t('track_application')}
            </Link>
            <Link to="/admin/login" style={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} /> {t('admin_panel')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container">
        <div className="main-nav-bar">
          <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Satvara Samaj Logo" style={{ width: '54px', height: '54px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }} />
            <div className="brand-text">
              <h1 className="heading-serif" style={{ fontSize: '1.05rem', lineHeight: '1.1', color: 'var(--primary-maroon)', whiteSpace: 'nowrap' }}>
                {t('org_name')}
              </h1>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t('org_sub')}</p>
            </div>
          </Link>

          {/* Desktop Nav Links with Comfortable Spacing */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ul className="nav-links">
              <li><Link to="/" className={isActive('/') ? 'active' : ''}>{t('nav_home')}</Link></li>
              <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>{t('nav_about')}</Link></li>
              {mahadanStatus !== 'CLOSED' && (
                <li><Link to="/mahadan" className={isActive('/mahadan') ? 'active' : ''} style={{ color: '#B8860B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}><Heart size={14} fill="#B8860B" /> {t('nav_mahadan')}</Link></li>
              )}
              <li><Link to="/committee" className={isActive('/committee') ? 'active' : ''}>{t('nav_committee')}</Link></li>
              <li><Link to="/hostels" className={isActive('/hostels') ? 'active' : ''}>{t('nav_hostels')}</Link></li>
              <li><Link to="/admission" className={isActive('/admission') ? 'active' : ''}>{t('nav_admission')}</Link></li>
              <li><Link to="/admission/merit-list" className={isActive('/admission/merit-list') ? 'active' : ''}>Merit List</Link></li>
              <li><Link to="/news" className={isActive('/news') ? 'active' : ''}>{t('nav_news')}</Link></li>
              <li><Link to="/darpan" className={isActive('/darpan') ? 'active' : ''}>{t('nav_publications')}</Link></li>
              <li><Link to="/gallery" className={isActive('/gallery') ? 'active' : ''}>{t('nav_gallery')}</Link></li>
              <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>{t('nav_contact')}</Link></li>
            </ul>

            <Link to="/apply" className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              {t('apply_now')}
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#ffffff', borderTop: '1px solid var(--border-light)', padding: '16px 20px' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>{t('nav_home')}</Link></li>
            <li><Link to="/mahadan" onClick={() => setMobileMenuOpen(false)} style={{ color: '#B8860B', fontWeight: 700 }}>❤️ {t('nav_mahadan')}</Link></li>
            <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>{t('nav_about')}</Link></li>
            <li><Link to="/committee" onClick={() => setMobileMenuOpen(false)}>{t('nav_committee')}</Link></li>
            <li><Link to="/hostels" onClick={() => setMobileMenuOpen(false)}>{t('nav_hostels')}</Link></li>
            <li><Link to="/admission" onClick={() => setMobileMenuOpen(false)}>{t('nav_admission')}</Link></li>
            <li><Link to="/admission/merit-list" onClick={() => setMobileMenuOpen(false)}>Merit List</Link></li>
            <li><Link to="/news" onClick={() => setMobileMenuOpen(false)}>{t('nav_news')}</Link></li>
            <li><Link to="/darpan" onClick={() => setMobileMenuOpen(false)}>{t('nav_publications')}</Link></li>
            <li><Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>{t('nav_gallery')}</Link></li>
            <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>{t('nav_contact')}</Link></li>
            <li style={{ marginTop: '8px' }}>
              <Link to="/apply" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                {t('apply_now')}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
