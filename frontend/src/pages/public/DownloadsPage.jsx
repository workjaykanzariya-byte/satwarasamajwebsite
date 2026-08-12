import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Download, FileText } from 'lucide-react';

export default function DownloadsPage() {
  const { t, lang } = useLanguage();
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    api.get('/cms/downloads').then((res) => {
      if (res.data.success) setDownloads(res.data.downloads);
    });
  }, []);

  return (
    <div className="container" style={{ padding: '50px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-maroon)', marginBottom: '10px' }}>
          {t('downloads_title')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('downloads_sub')}</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Published Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>
                      <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} />
                      {lang === 'gu' ? d.titleGu : d.titleEn}
                    </strong>
                  </td>
                  <td><span className="badge badge-primary">{d.category}</span></td>
                  <td>{new Date(d.publishedDate).toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN')}</td>
                  <td>
                    <a href={d.filePath} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                      <Download size={14} /> Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
