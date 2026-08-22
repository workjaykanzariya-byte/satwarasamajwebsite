import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { BookOpen, Download, ExternalLink, Sparkles, Library } from 'lucide-react';
import { getMediaUrl, DEFAULT_DARPAN_COVER } from '../../utils/mediaHelper';

const samplePublications = [
  {
    id: 1,
    titleGu: 'સતવારા દર્પણ-ઓગસ્ટ ૨૦૨૬',
    titleEn: 'Satvara Darpan - August 2026',
    month: 'August',
    year: '2026',
    monthGu: 'ઓગસ્ટ',
    yearGu: '૨૦૨૬',
    descGu: 'આ અંકમાં સતવારા જ્ઞાતિ મંડળ સુરત આયોજિત ઉર્મી ગૌરવ સ્નેહમિલન તથા સિદ્ધનાથ મહાદેવ ધર્માદા ટ્રસ્ટ વિરમગામ આયોજિત સામેયા મહોત્સવ સમાજના સમાચાર, કાર્યક્રમો.',
    descEn: 'This issue covers community news and highlights from the Satvara Gnati Mandal Surat Urmi Gaurav Sneh Milan and the Siddhnath Mahadev Dharmada Trust Viramgam Sameya Mahotsav.',
    coverImage: DEFAULT_DARPAN_COVER,
    pdfFile: '/documents/darpan-august-2026.pdf',
  },
  {
    id: 2,
    titleGu: 'સતવારા દર્પણ-જુલાઈ ૨૦૨૬',
    titleEn: 'Satvara Darpan - July 2026',
    month: 'July',
    year: '2026',
    monthGu: 'જુલાઈ',
    yearGu: '૨૦૨૬',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
    pdfFile: '/documents/darpan-july-2026.pdf',
  },
  {
    id: 3,
    titleGu: 'સતવારા દર્પણ-જૂન ૨૦૨૬',
    titleEn: 'Satvara Darpan - June 2026',
    month: 'June',
    year: '2026',
    monthGu: 'જૂન',
    yearGu: '૨૦૨૬',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
    pdfFile: '/documents/darpan-june-2026.pdf',
  },
  {
    id: 4,
    titleGu: 'સતવારા દર્પણ-મે ૨૦૨૬',
    titleEn: 'Satvara Darpan - May 2026',
    month: 'May',
    year: '2026',
    monthGu: 'મે',
    yearGu: '૨૦૨૬',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    pdfFile: '/documents/darpan-may-2026.pdf',
  },
  {
    id: 5,
    titleGu: 'સતવારા દર્પણ-એપ્રિલ ૨૦૨૬',
    titleEn: 'Satvara Darpan - April 2026',
    month: 'April',
    year: '2026',
    monthGu: 'એપ્રિલ',
    yearGu: '૨૦૨૬',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
    pdfFile: '/documents/darpan-april-2026.pdf',
  },
  {
    id: 6,
    titleGu: 'સતવારા દર્પણ-માર્ચ ૨૦૨૬',
    titleEn: 'Satvara Darpan - March 2026',
    month: 'March',
    year: '2026',
    monthGu: 'માર્ચ',
    yearGu: '૨૦૨૬',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
    pdfFile: '/documents/darpan-march-2026.pdf',
  },
  {
    id: 7,
    titleGu: 'સતવારા દર્પણ-ફેબ્રુઆરી ૨૦૨૬',
    titleEn: 'Satvara Darpan - February 2026',
    month: 'February',
    year: '2026',
    monthGu: 'ફેબ્રુઆરી',
    yearGu: '૨૦૨૬',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    pdfFile: '/documents/darpan-february-2026.pdf',
  },
];

export default function DarpanPublications() {
  const { lang } = useLanguage();
  const [publications, setPublications] = useState(samplePublications);

  useEffect(() => {
    api.get('/cms/publications').then((res) => {
      if (res.data.success && res.data.publications && res.data.publications.length > 0) {
        setPublications(res.data.publications);
      }
    }).catch(() => {});
  }, []);

  const sortedPublications = [...publications].sort((a, b) => {
    const orderA = a.displayOrder !== undefined ? Number(a.displayOrder) : 999;
    const orderB = b.displayOrder !== undefined ? Number(b.displayOrder) : 999;
    return orderA - orderB;
  });

  const latestIssue = sortedPublications.length > 0 ? sortedPublications[0] : samplePublications[0];
  const pastIssues = sortedPublications.length > 1 ? sortedPublications.slice(1) : samplePublications.slice(1);

  const latestCover = getMediaUrl(latestIssue?.coverImage) || DEFAULT_DARPAN_COVER;
  const latestPdf = getMediaUrl(latestIssue?.pdfFile) || '/documents/sample.pdf';

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Page Title Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', color: '#ffffff', padding: '50px 0', borderBottom: '4px solid #F59E0B' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.4rem', color: '#FFFFFF', margin: '0 0 10px 0', fontWeight: 800, fontFamily: 'serif, sans-serif' }}>
            DARPAN PUBLICATION ARCHIVE
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', color: '#E2E8F0', fontSize: '1.05rem' }}>
            Community monthly magazine issues and annual publication archive.
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '40px' }}>

        {/* 1. LATEST ISSUE SECTION */}
        {latestIssue && (
          <div style={{ marginBottom: '50px' }}>
            <div className="card" style={{ background: '#FFFFFF', padding: '36px', borderRadius: '20px', boxShadow: '0 12px 35px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', maxWidth: '860px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#0F172A', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles color="#F59E0B" fill="#F59E0B" size={28} /> Current Issue / વર્તમાન અંક
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '36px', alignItems: 'center' }}>
                {/* Magazine Cover Image Preview Frame */}
                <div style={{ width: '220px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.18)', border: '4px solid #1E3A8A', margin: '0 auto', background: '#e2e8f0', minHeight: '300px' }}>
                  <img
                    src={latestCover}
                    alt={latestIssue.titleEn || latestIssue.titleGu}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_DARPAN_COVER;
                    }}
                    style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                {/* Right Description & Action */}
                <div>
                  <h3 style={{ fontSize: '1.7rem', color: '#1E3A8A', fontWeight: 800, marginBottom: '14px', lineHeight: 1.3 }}>
                    {latestIssue.titleEn || latestIssue.titleGu}
                  </h3>

                  <div style={{ fontSize: '0.92rem', color: '#B45309', fontWeight: 700, marginBottom: '12px' }}>
                    {latestIssue.titleGu}
                  </div>

                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
                    {latestIssue.descEn || latestIssue.descGu || 'આ અંકમાં સતવારા જ્ઞાતિ મંડળ સુરત આયોજિત ઉર્મી ગૌરવ સ્નેહમિલન તથા સિદ્ધનાથ મહાદેવ ધર્માદા ટ્રસ્ટ વિરમગામ આયોજિત સામેયા મહોત્સવ સમાજના સમાચાર, કાર્યક્રમો.'}
                  </p>

                  <a
                    href={latestPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '1.05rem',
                      fontWeight: 'bold',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 6px 18px rgba(220, 38, 38, 0.3)',
                      transition: 'transform 0.2s',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={20} /> PDF Download / View
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PAST ISSUES ARCHIVE SECTION */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#0F172A', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Library color="#2563EB" size={28} /> Past Issues / અગાઉના અંકો
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            {pastIssues.map((issue) => (
              <div
                key={issue.id}
                className="card card-hover"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.35rem', color: '#1E293B', fontWeight: 800, marginBottom: '4px' }}>
                    {issue.monthGu ? `${issue.monthGu} - ${issue.yearGu}` : `${issue.month} - ${issue.year}`}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {issue.month} {issue.year}
                  </div>
                </div>

                <div>
                  <a
                    href={getMediaUrl(issue.pdfFile) || '/documents/sample.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#DC2626',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FEF2F2',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: '1px solid #FCA5A5',
                    }}
                  >
                    View PDF <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
