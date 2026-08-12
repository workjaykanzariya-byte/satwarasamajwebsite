import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Calendar } from 'lucide-react';

export default function NewsPage() {
  const { t, lang } = useLanguage();
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get('/cms/news').then((res) => {
      if (res.data.success) setNews(res.data.news);
    });
  }, []);

  return (
    <div className="container" style={{ padding: '50px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-maroon)', marginBottom: '10px' }}>
          {t('news_section_title')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('news_section_sub')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {news.map((item) => (
          <div key={item.id} className="card card-hover">
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '8px' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {new Date(item.publishedDate).toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN')}
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '12px' }}>
              {lang === 'gu' ? item.titleGu : item.titleEn}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {lang === 'gu' ? item.contentGu : item.contentEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
