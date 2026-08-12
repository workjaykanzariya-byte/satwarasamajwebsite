import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    contact_phone: '+91 7043704446',
    contact_email: 'info@satwaramahamandal.org',
    office_address: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad - 380013',
    office_hours: '10:00 AM – 6:00 PM (Mon-Sat)',
  });

  useEffect(() => {
    api.get('/cms/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    }).catch(() => {});
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Trust Profile */}
          <div className="footer-col" style={{ textAlign: 'center' }}>
            <img src="/logo.png" alt="Satvara Samaj Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '50%', marginBottom: '14px', background: '#ffffff', padding: '3px', boxShadow: '0 6px 16px rgba(0,0,0,0.3)', margin: '0 auto 14px auto', display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff', marginTop: 0, marginBottom: '8px' }}>
              {t('org_name')}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '16px', lineHeight: '1.5' }}>
              Dedicated community trust serving Satwara students with modern hostel facilities, merit scholarships, and academic support.
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--accent-gold)', fontWeight: 'bold', background: 'rgba(245, 158, 11, 0.12)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-block', marginBottom: '14px' }}>
              {t('trust_reg')}
            </p>
            {/* Social Media Links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
              <a href="https://www.facebook.com/shreesamastsatvaramahamandal" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1877F2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }} title="Facebook Page">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/samast_satvara_mahamandal" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }} title="Instagram Profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://api.whatsapp.com/send/?phone=917043704446&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25D366', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }} title="WhatsApp Contact">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2: Hostels & Contact */}
          <div className="footer-col">
            <h3>Our Hostels</h3>
            <ul>
              <li><Link to="/hostels/1">Shree Satwara Boys Hostel (Old Wadaj)</Link></li>
              <li><Link to="/hostels/2">Shree Satwara Girls Hostel (Naranpura)</Link></li>
              <li><Link to="/hostels/3">Shree Satwara Hostel (Anand V.V. Nagar)</Link></li>
              <li><Link to="/admission">Check Available Beds</Link></li>
              <li><Link to="/admission/merit-list">Published Merit Lists</Link></li>
            </ul>
          </div>

          {/* Col 3: Important Links */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Mandal & Trustees</Link></li>
              {settings.mahadan_status !== 'CLOSED' && (
                <li><Link to="/mahadan" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>❤️ Maha Dan Portal</Link></li>
              )}
              <li><Link to="/committee">Committee Desk</Link></li>
              <li><Link to="/news">Latest News & Circulars</Link></li>
              <li><Link to="/darpan">Darpan Publication Archive</Link></li>
              <li><Link to="/policy/terms-of-use">Terms of Use (નિયમો અને શરતો)</Link></li>
              <li><Link to="/policy/privacy-policy">Privacy Policy (ગોપનીયતા નીતિ)</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Office */}
          <div className="footer-col">
            <h3>Registered Office</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <MapPin size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                <span>{settings.office_address}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>{settings.contact_phone}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Mail size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>{settings.contact_email}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--accent-gold)' }} />
                <span>Office Hours: {settings.office_hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Shree Satwara Maha Mandal, Ahmedabad. All Rights Reserved.</p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Built with dynamic Bed Occupancy Engine & Merit Admission Management System.
          </p>
        </div>
      </div>
    </footer>
  );
}
