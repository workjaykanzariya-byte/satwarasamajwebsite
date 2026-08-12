import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function GalleryPage() {
  const { t, lang } = useLanguage();
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    api.get('/cms/gallery').then((res) => {
      if (res.data.success) setAlbums(res.data.albums);
    });
  }, []);

  return (
    <div className="container" style={{ padding: '50px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-maroon)', marginBottom: '10px' }}>
          {t('gallery_title')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('gallery_sub')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {albums.map((al) => (
          <div key={al.id} className="card card-hover">
            <div style={{ height: '180px', background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-maroon))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '1.4rem', fontWeight: 800, marginBottom: '14px' }}>
              🖼️ {lang === 'gu' ? al.titleGu : al.titleEn}
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
              {lang === 'gu' ? al.titleGu : al.titleEn}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{al.items?.length || 0} Photos & Videos</p>
          </div>
        ))}
      </div>
    </div>
  );
}
