import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Newspaper, Users, BookOpen, Settings as SettingsIcon, Trash2, Edit3, ArrowUp, ArrowDown, Save, ShieldAlert, Upload, FileText, Image as ImageIcon, Check, Loader2, X } from 'lucide-react';
import { getMediaUrl, DEFAULT_DARPAN_COVER } from '../../utils/mediaHelper';

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState('admission');

  // News State
  const [newsList, setNewsList] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [savingNews, setSavingNews] = useState(false);
  const [newsForm, setNewsForm] = useState({ titleGu: '', titleEn: '', contentGu: '', contentEn: '', featuredImage: '' });

  // Committee State
  const [committeeList, setCommitteeList] = useState([]);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [savingCommittee, setSavingCommittee] = useState(false);
  const [committeeForm, setCommitteeForm] = useState({
    nameGu: '',
    nameEn: '',
    designationGu: '',
    designationEn: '',
    bioGu: '',
    bioEn: '',
    photoPath: '',
    displayOrder: 1,
    isActive: true,
  });

  // Darpan State
  const [darpanList, setDarpanList] = useState([]);
  const [showDarpanModal, setShowDarpanModal] = useState(false);
  const [editingDarpanId, setEditingDarpanId] = useState(null);
  const [savingDarpan, setSavingDarpan] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [darpanForm, setDarpanForm] = useState({
    titleGu: '',
    titleEn: '',
    month: 'August / ઓગસ્ટ',
    year: '2026',
    coverImage: '',
    pdfFile: '',
    isPublished: true,
  });

  // Site & Admission Settings State
  const [settings, setSettings] = useState({
    admission_status: 'OPEN',
    admission_closed_notice_gu: '',
    admission_closed_notice_en: '',
    merit_list_status: 'PUBLISHED',
    contact_phone: '+91 7043704446',
    contact_email: 'info@satvaramahamandal.org',
    office_address: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad - 380013',
    office_hours: '10:00 AM – 6:00 PM (Mon-Sat)',
    president_name_gu: 'રાજેશભાઈ કે. મકવાણા',
    president_title_gu: 'પ્રમુખશ્રીની કલમે',
    president_desig_gu: 'પ્રમુખશ્રી (ધંધુકા, અમદાવાદ)',
    president_motto_gu: 'શિક્ષણ અને સંસ્કારથી સમાજનો સર્વાંગી વિકાસ.',
    president_msg_gu: '',
    secretary_name_gu: 'ગીરીશભાઈ એસ. લકુમ',
    secretary_title_gu: 'મહામંત્રીશ્રીની કલમે',
    secretary_desig_gu: 'મહામંત્રીશ્રી (હળવદ, સુરેન્દ્રનગર)',
    secretary_motto_gu: 'ટ્રેડિશનના સંકલ્પ સાથે ટેકનોલોજીને આવકારતી આપણી સંસ્થા',
    secretary_msg_gu: '',
  });

  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [nRes, cRes, dRes, sRes] = await Promise.all([
        api.get('/cms/news'),
        api.get('/cms/committee'),
        api.get('/cms/publications'),
        api.get('/cms/settings'),
      ]);

      if (nRes.data.success) setNewsList(nRes.data.news);
      if (cRes.data.success) setCommitteeList(cRes.data.members);
      if (dRes.data.success) setDarpanList(dRes.data.publications);
      if (sRes.data.success) setSettings((prev) => ({ ...prev, ...sRes.data.settings }));
    } catch (err) {
      console.error('Failed to load CMS data', err);
    }
  };

  // Helper for reading or directly uploading files with auto-detection
  const handleFileSelect = async (e, callback, onUploadingChange = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // For PDF documents or files > 1MB, upload directly via multipart form to avoid JSON payload size limits
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.size > 1024 * 1024) {
      if (onUploadingChange) onUploadingChange(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/cms/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success && res.data.fileUrl) {
          callback(res.data.fileUrl);
          if (onUploadingChange) onUploadingChange(false);
          return;
        }
      } catch (uploadErr) {
        console.warn('Direct multipart upload failed, falling back to base64 reader:', uploadErr);
      } finally {
        if (onUploadingChange) onUploadingChange(false);
      }
    }

    // If it's an image, optimize and resize to max 1200px for speed
    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed JPEG or WebP data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          callback(compressedDataUrl);
        };
        img.onerror = () => {
          callback(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs or other documents, read directly
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to convert base64 strings into direct uploaded files prior to save
  const ensureUploadedUrl = async (dataOrUrl, prefix = 'file') => {
    if (!dataOrUrl || typeof dataOrUrl !== 'string') return dataOrUrl;
    if (dataOrUrl.startsWith('/api/') || dataOrUrl.startsWith('http://') || dataOrUrl.startsWith('https://')) {
      return dataOrUrl;
    }
    if (dataOrUrl.startsWith('data:')) {
      try {
        const parts = dataOrUrl.split(',');
        const mime = parts[0].split(':')[1].split(';')[0];
        const b64Data = parts[1];
        const byteCharacters = atob(b64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        let ext = '.png';
        if (mime.includes('pdf')) ext = '.pdf';
        else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
        else if (mime.includes('webp')) ext = '.webp';

        const blob = new Blob([byteArray], { type: mime });
        const file = new File([blob], `${prefix}_${Date.now()}${ext}`, { type: mime });
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/cms/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success && res.data.fileUrl) {
          return res.data.fileUrl;
        }
      } catch (err) {
        console.warn('Auto upload of base64 failed, keeping as is:', err);
      }
    }
    return dataOrUrl;
  };

  // --- SETTINGS HANDLERS ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload = { ...settings };
      if (payload.president_photo && payload.president_photo.startsWith('data:')) {
        payload.president_photo = await ensureUploadedUrl(payload.president_photo, 'president');
      }
      if (payload.secretary_photo && payload.secretary_photo.startsWith('data:')) {
        payload.secretary_photo = await ensureUploadedUrl(payload.secretary_photo, 'secretary');
      }
      const res = await api.post('/cms/settings', payload);
      if (res.data.success) {
        alert('Site & Admission Settings saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- COMMITTEE HANDLERS ---
  const handleSaveCommitteeMember = async (e) => {
    e.preventDefault();
    setSavingCommittee(true);
    try {
      const payload = { ...committeeForm };
      if (payload.photoPath && payload.photoPath.startsWith('data:')) {
        payload.photoPath = await ensureUploadedUrl(payload.photoPath, 'committee');
      }
      if (editingMemberId) {
        await api.put(`/cms/committee/${editingMemberId}`, payload);
        alert('Committee member updated successfully!');
      } else {
        await api.post('/cms/committee', payload);
        alert('Committee member added successfully!');
      }
      setShowCommitteeModal(false);
      resetCommitteeForm();
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save committee member.');
    } finally {
      setSavingCommittee(false);
    }
  };

  const handleEditMember = (m) => {
    setEditingMemberId(m.id);
    setCommitteeForm({
      nameGu: m.nameGu,
      nameEn: m.nameEn,
      designationGu: m.designationGu,
      designationEn: m.designationEn,
      bioGu: m.bioGu || '',
      bioEn: m.bioEn || '',
      photoPath: m.photoPath || '',
      displayOrder: m.displayOrder || 1,
      isActive: m.isActive,
    });
    setShowCommitteeModal(true);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this committee member?')) return;
    try {
      await api.delete(`/cms/committee/${id}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete member.');
    }
  };

  const handleOrderChange = async (member, newOrder) => {
    try {
      await api.put(`/cms/committee/${member.id}`, { displayOrder: Math.max(1, newOrder) });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetCommitteeForm = () => {
    setEditingMemberId(null);
    setCommitteeForm({
      nameGu: '',
      nameEn: '',
      designationGu: '',
      designationEn: '',
      bioGu: '',
      bioEn: '',
      photoPath: '',
      displayOrder: committeeList.length + 1,
      isActive: true,
    });
  };

  // --- DARPAN HANDLERS ---
  const handleSaveDarpan = async (e) => {
    e.preventDefault();
    setSavingDarpan(true);
    try {
      const payload = { ...darpanForm };
      if (payload.coverImage && payload.coverImage.startsWith('data:')) {
        payload.coverImage = await ensureUploadedUrl(payload.coverImage, 'darpan_cover');
      }
      if (payload.pdfFile && payload.pdfFile.startsWith('data:')) {
        payload.pdfFile = await ensureUploadedUrl(payload.pdfFile, 'darpan_doc');
      }

      if (editingDarpanId) {
        await api.put(`/cms/publications/${editingDarpanId}`, payload);
        alert('Darpan publication updated successfully!');
      } else {
        await api.post('/cms/publications', payload);
        alert('Darpan publication created successfully!');
      }
      setShowDarpanModal(false);
      resetDarpanForm();
      fetchAllData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : err.message) || 'Failed to save publication.';
      alert(msg);
    } finally {
      setSavingDarpan(false);
    }
  };

  const handleEditDarpan = (d) => {
    setEditingDarpanId(d.id);
    setDarpanForm({
      titleGu: d.titleGu,
      titleEn: d.titleEn,
      month: d.month,
      year: d.year,
      coverImage: d.coverImage || '',
      pdfFile: d.pdfFile || '',
      isPublished: d.isPublished,
    });
    setShowDarpanModal(true);
  };

  const handleDeleteDarpan = async (id) => {
    if (!window.confirm('Delete this Darpan issue?')) return;
    try {
      await api.delete(`/cms/publications/${id}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete publication.');
    }
  };

  const resetDarpanForm = () => {
    setEditingDarpanId(null);
    setDarpanForm({
      titleGu: '',
      titleEn: '',
      month: 'August / ઓગસ્ટ',
      year: '2026',
      coverImage: '',
      pdfFile: '',
      isPublished: true,
    });
  };

  // --- NEWS HANDLERS (WITH DELETE & EDIT) ---
  const handleSaveNews = async (e) => {
    e.preventDefault();
    setSavingNews(true);
    try {
      const payload = { ...newsForm };
      if (payload.featuredImage && payload.featuredImage.startsWith('data:')) {
        payload.featuredImage = await ensureUploadedUrl(payload.featuredImage, 'news');
      }
      if (editingNewsId) {
        await api.put(`/cms/news/${editingNewsId}`, payload);
        alert('News announcement updated successfully!');
      } else {
        await api.post('/cms/news', payload);
        alert('News announcement published successfully!');
      }
      setShowNewsModal(false);
      resetNewsForm();
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save news.');
    } finally {
      setSavingNews(false);
    }
  };

  const handleEditNews = (n) => {
    setEditingNewsId(n.id);
    setNewsForm({
      titleGu: n.titleGu,
      titleEn: n.titleEn,
      contentGu: n.contentGu,
      contentEn: n.contentEn,
      featuredImage: n.featuredImage || '',
    });
    setShowNewsModal(true);
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news circular?')) return;
    try {
      await api.delete(`/cms/news/${id}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete news item.');
    }
  };

  const resetNewsForm = () => {
    setEditingNewsId(null);
    setNewsForm({ titleGu: '', titleEn: '', contentGu: '', contentEn: '', featuredImage: '' });
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
          CMS & Site Operations Control Panel
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage Admission Status, Committee Members, Darpan Publications, and News Announcements.
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'admission' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('admission')}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <SettingsIcon size={18} /> Admission & Contact Controls
        </button>

        <button
          className={`btn ${activeTab === 'committee' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('committee')}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Users size={18} /> Committee Members ({committeeList.length})
        </button>

        <button
          className={`btn ${activeTab === 'darpan' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('darpan')}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <BookOpen size={18} /> Satvara Darpan Archive ({darpanList.length})
        </button>

        <button
          className={`btn ${activeTab === 'news' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('news')}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Newspaper size={18} /> News & Circulars ({newsList.length})
        </button>
      </div>

      {/* TAB 1: ADMISSION & SITE SETTINGS */}
      {activeTab === 'admission' && (
        <form onSubmit={handleSaveSettings}>
          <div className="card" style={{ marginBottom: '24px', borderLeft: '6px solid var(--accent-gold)' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Admission Status & Merit List Control
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Master Admission Portal Status *</label>
                <select
                  className="form-control"
                  style={{
                    fontWeight: 'bold',
                    color: settings.admission_status === 'OPEN' ? '#166534' : '#991b1b',
                    background: settings.admission_status === 'OPEN' ? '#f0fdf4' : '#fef2f2',
                  }}
                  value={settings.admission_status}
                  onChange={(e) => setSettings({ ...settings, admission_status: e.target.value })}
                >
                  <option value="OPEN">🟢 ALL OPEN — Master Portal Enabled</option>
                  <option value="CLOSED">🔴 ALL CLOSED — Display Closed Screen for All</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Merit List Status *</label>
                <select
                  className="form-control"
                  value={settings.merit_list_status}
                  onChange={(e) => setSettings({ ...settings, merit_list_status: e.target.value })}
                >
                  <option value="PUBLISHED">🟢 PUBLISHED — Publicly Visible</option>
                  <option value="CLOSED">🔴 CLOSED / UNDER PROCESS</option>
                </select>
              </div>
            </div>

            {/* PER-HOSTEL SPECIFIC ADMISSION STATUS TOGGLES */}
            <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-maroon)', marginTop: '20px', marginBottom: '14px', fontWeight: 'bold' }}>
              🏢 Particular Hostel Specific Admission Status Toggles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.88rem', color: 'var(--primary-navy)' }}>
                  1. Ahmedabad Boys Hostel (Old Wadaj)
                </label>
                <select
                  className="form-control"
                  style={{
                    fontWeight: 'bold',
                    color: (settings.admission_status_boys_ahmedabad || 'OPEN') === 'OPEN' ? '#166534' : '#991b1b',
                    background: (settings.admission_status_boys_ahmedabad || 'OPEN') === 'OPEN' ? '#f0fdf4' : '#fef2f2',
                  }}
                  value={settings.admission_status_boys_ahmedabad || 'OPEN'}
                  onChange={(e) => setSettings({ ...settings, admission_status_boys_ahmedabad: e.target.value })}
                >
                  <option value="OPEN">🟢 OPEN — Accept Applications</option>
                  <option value="CLOSED">🔴 CLOSED — Admissions Closed</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.88rem', color: 'var(--primary-navy)' }}>
                  2. Ahmedabad Girls Hostel (Naranpura)
                </label>
                <select
                  className="form-control"
                  style={{
                    fontWeight: 'bold',
                    color: (settings.admission_status_girls_ahmedabad || 'OPEN') === 'OPEN' ? '#166534' : '#991b1b',
                    background: (settings.admission_status_girls_ahmedabad || 'OPEN') === 'OPEN' ? '#f0fdf4' : '#fef2f2',
                  }}
                  value={settings.admission_status_girls_ahmedabad || 'OPEN'}
                  onChange={(e) => setSettings({ ...settings, admission_status_girls_ahmedabad: e.target.value })}
                >
                  <option value="OPEN">🟢 OPEN — Accept Applications</option>
                  <option value="CLOSED">🔴 CLOSED — Admissions Closed</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.88rem', color: 'var(--primary-navy)' }}>
                  3. Anand (V.V. Nagar) Hostel
                </label>
                <select
                  className="form-control"
                  style={{
                    fontWeight: 'bold',
                    color: (settings.admission_status_boys_anand || 'OPEN') === 'OPEN' ? '#166534' : '#991b1b',
                    background: (settings.admission_status_boys_anand || 'OPEN') === 'OPEN' ? '#f0fdf4' : '#fef2f2',
                  }}
                  value={settings.admission_status_boys_anand || 'OPEN'}
                  onChange={(e) => setSettings({ ...settings, admission_status_boys_anand: e.target.value })}
                >
                  <option value="OPEN">🟢 OPEN — Accept Applications</option>
                  <option value="CLOSED">🔴 CLOSED — Admissions Closed</option>
                </select>
              </div>

            </div>

            <div className="form-group">
              <label className="form-label">Admission Closed Notice Message (Gujarati)</label>
              <textarea
                className="form-control"
                rows={2}
                value={settings.admission_closed_notice_gu || ''}
                onChange={(e) => setSettings({ ...settings, admission_closed_notice_gu: e.target.value })}
                placeholder="Message shown to users when admission form is closed..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admission Closed Notice Message (English)</label>
              <textarea
                className="form-control"
                rows={2}
                value={settings.admission_closed_notice_en || ''}
                onChange={(e) => setSettings({ ...settings, admission_closed_notice_en: e.target.value })}
              />
            </div>
          </div>

          {/* Leadership Desk Settings */}
          <div className="card" style={{ marginBottom: '24px', borderLeft: '6px solid var(--primary-navy)' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>
              👑 Main Managing Body Leadership Messages (મુખ્ય સંચાલક મંડળ)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* President Desk */}
              <div style={{ background: '#fffbe6', padding: '16px', borderRadius: '10px', border: '1px solid #fef08a' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#b45309', marginBottom: '12px' }}>1. President Desk (પ્રમુખશ્રીનો સંદેશ)</h3>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Upload President Photo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => handleFileSelect(e, (base64) => setSettings({ ...settings, president_photo: base64 }))}
                  />
                  {settings.president_photo && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={settings.president_photo} alt="President" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #b45309' }} />
                      <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 'bold' }}>✓ Photo Loaded</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">President Name (Gujarati / English)</label>
                  <input type="text" className="form-control" value={settings.president_name_gu || ''} onChange={(e) => setSettings({ ...settings, president_name_gu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation & Location</label>
                  <input type="text" className="form-control" value={settings.president_desig_gu || ''} onChange={(e) => setSettings({ ...settings, president_desig_gu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">President Motto / Quote</label>
                  <input type="text" className="form-control" value={settings.president_motto_gu || ''} onChange={(e) => setSettings({ ...settings, president_motto_gu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Message Paragraph</label>
                  <textarea className="form-control" rows={3} value={settings.president_msg_gu || ''} onChange={(e) => setSettings({ ...settings, president_msg_gu: e.target.value })} />
                </div>
              </div>

              {/* General Secretary Desk */}
              <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#0369a1', marginBottom: '12px' }}>2. General Secretary Desk (મહામંત્રીશ્રીનો સંદેશ)</h3>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Upload General Secretary Photo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => handleFileSelect(e, (base64) => setSettings({ ...settings, secretary_photo: base64 }))}
                  />
                  {settings.secretary_photo && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={settings.secretary_photo} alt="Secretary" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0369a1' }} />
                      <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 'bold' }}>✓ Photo Loaded</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Secretary Name (Gujarati / English)</label>
                  <input type="text" className="form-control" value={settings.secretary_name_gu || ''} onChange={(e) => setSettings({ ...settings, secretary_name_gu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation & Location</label>
                  <input type="text" className="form-control" value={settings.secretary_desig_gu || ''} onChange={(e) => setSettings({ ...settings, secretary_desig_gu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Secretary Motto / Quote</label>
                  <input type="text" className="form-control" value={settings.secretary_motto_gu || ''} onChange={(e) => setSettings({ ...settings, secretary_motto_gu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Message Paragraph</label>
                  <textarea className="form-control" rows={3} value={settings.secretary_msg_gu || ''} onChange={(e) => setSettings({ ...settings, secretary_msg_gu: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Home Screen Dynamic Content Settings */}
          <div className="card" style={{ marginBottom: '24px', borderLeft: '6px solid #2563EB' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏠 Home Screen Hero & Sections Content Controls
            </h2>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Hero Banner Top Badge Text</label>
              <input
                type="text"
                className="form-control"
                placeholder="Official Community Trust Portal | Trust Reg. No. E-8499..."
                value={settings.home_hero_badge || ''}
                onChange={(e) => setSettings({ ...settings, home_hero_badge: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Hero Main Title Text</label>
              <input
                type="text"
                className="form-control"
                placeholder="સતવારા સમાજ વિદ્યાર્થી કલ્યાણ અને છાત્રાલય પોર્ટલ"
                value={settings.home_hero_title || ''}
                onChange={(e) => setSettings({ ...settings, home_hero_title: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Hero Subtitle Paragraph</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="અમદાવાદ અને આણંદ છાત્રાલય પ્રવેશ, મેરિટ લિસ્ટ..."
                value={settings.home_hero_sub || ''}
                onChange={(e) => setSettings({ ...settings, home_hero_sub: e.target.value })}
              />
            </div>

            <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-maroon)', marginBottom: '12px', fontWeight: 'bold' }}>
              📊 Trust Summary Metrics Strip (5 Metric Cards)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.82rem' }}>Metric 2: Service Years</label>
                <input type="text" className="form-control" placeholder="30+ Years" value={settings.home_trust_metric2_val || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric2_val: e.target.value })} style={{ marginBottom: '6px' }} />
                <input type="text" className="form-control" placeholder="Community Service" value={settings.home_trust_metric2_label || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric2_label: e.target.value })} />
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.82rem' }}>Metric 3: Students Housed</label>
                <input type="text" className="form-control" placeholder="2,500+" value={settings.home_trust_metric3_val || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric3_val: e.target.value })} style={{ marginBottom: '6px' }} />
                <input type="text" className="form-control" placeholder="Students Housed" value={settings.home_trust_metric3_label || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric3_label: e.target.value })} />
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.82rem' }}>Metric 4: Hostel Complexes</label>
                <input type="text" className="form-control" placeholder="2 Hostels" value={settings.home_trust_metric4_val || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric4_val: e.target.value })} style={{ marginBottom: '6px' }} />
                <input type="text" className="form-control" placeholder="Boys & Girls Complexes" value={settings.home_trust_metric4_label || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric4_label: e.target.value })} />
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '0.82rem' }}>Metric 5: Transparent Admission</label>
                <input type="text" className="form-control" placeholder="100% Merit" value={settings.home_trust_metric5_val || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric5_val: e.target.value })} style={{ marginBottom: '6px' }} />
                <input type="text" className="form-control" placeholder="Transparent Admission" value={settings.home_trust_metric5_label || ''} onChange={(e) => setSettings({ ...settings, home_trust_metric5_label: e.target.value })} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', marginBottom: '12px', fontWeight: 'bold' }}>
              🏢 Hostel Section Titles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Hostel Section Title</label>
                <input type="text" className="form-control" placeholder="લાઈવ છાત્રાલય સ્થિતિ અને ખાલી પથારીઓ" value={settings.home_hostel_title || ''} onChange={(e) => setSettings({ ...settings, home_hostel_title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Hostel Section Subtitle</label>
                <input type="text" className="form-control" placeholder="રિયલ ટાઈમમાં અપડેટ થતી છાત્રાલય પથારીઓની ઉપલબ્ધતા..." value={settings.home_hostel_sub || ''} onChange={(e) => setSettings({ ...settings, home_hostel_sub: e.target.value })} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', color: '#B45309', marginBottom: '12px', fontWeight: 'bold' }}>
              ✨ Upcoming Girls Hostel & Naming Donor (નામકરણ દાતા) Settings
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Project Section Title</label>
                <input type="text" className="form-control" placeholder="🎓 તખુબા કન્યા છાત્રાલય સંકુલ" value={settings.home_new_girls_hostel_title || ''} onChange={(e) => setSettings({ ...settings, home_new_girls_hostel_title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Project Subtitle</label>
                <input type="text" className="form-control" placeholder="સતવારા સમાજ દીકરીઓના ઉજ્જવળ ભવિષ્ય..." value={settings.home_new_girls_hostel_sub || ''} onChange={(e) => setSettings({ ...settings, home_new_girls_hostel_sub: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Naming Donor Name (મુખ્ય નામકરણ દાતા)</label>
                <input type="text" className="form-control" placeholder="શ્રીમતી ગૌરીબેન તથા નરેશભાઈ કરશનભાઈ કણઝરીયા" value={settings.home_donor_name || ''} onChange={(e) => setSettings({ ...settings, home_donor_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Donation Amount (દાન રકમ)</label>
                <input type="text" className="form-control" placeholder="₹૧,૦૦,૧૧,૧૧૧/-" value={settings.home_donor_amount || ''} onChange={(e) => setSettings({ ...settings, home_donor_amount: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Donor Native Place (મૂળ વતન)</label>
                <input type="text" className="form-control" placeholder="(મૂળ વતન - જાળીલા, તા. રાણપુર, જી. બોટાદ)" value={settings.home_donor_native || ''} onChange={(e) => setSettings({ ...settings, home_donor_native: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Donor Current Residence (હાલ રહેઠાણ)</label>
                <input type="text" className="form-control" placeholder="(હાલ - સતવારા સોસાયટી, ધંધુકા)" value={settings.home_donor_current || ''} onChange={(e) => setSettings({ ...settings, home_donor_current: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Contact Details Settings */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>
              📞 Registered Office & Contact Settings
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Official Phone Number</label>
                <input type="text" className="form-control" value={settings.contact_phone || ''} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email Address</label>
                <input type="email" className="form-control" value={settings.contact_email || ''} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Registered Office Address</label>
              <textarea className="form-control" rows={2} value={settings.office_address || ''} onChange={(e) => setSettings({ ...settings, office_address: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Office Timings</label>
              <input type="text" className="form-control" value={settings.office_hours || ''} onChange={(e) => setSettings({ ...settings, office_hours: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={savingSettings} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {savingSettings ? <><Loader2 className="animate-spin" size={18} /> Saving Settings...</> : <><Save size={18} /> Save All Settings</>}
          </button>
        </form>
      )}

      {/* TAB 2: COMMITTEE MEMBERS MANAGER */}
      {activeTab === 'committee' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>Trustees & Committee Members Directory</h2>
            <button className="btn btn-primary" onClick={() => { resetCommitteeForm(); setShowCommitteeModal(true); }}>
              <Plus size={16} /> Add Committee Member
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            💡 Specify exact <strong>Display Order</strong> (e.g. 1 for top position). Members are displayed in public strictly based on order.
          </p>

          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Order #</th>
                    <th>Name (Gujarati / English)</th>
                    <th>Designation</th>
                    <th>Bio / Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {committeeList.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.9rem' }}>#{m.displayOrder}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{m.nameEn || m.nameGu}</strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.nameGu}</div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--primary-maroon)', fontWeight: 'bold', fontSize: '0.88rem' }}>{m.designationEn || m.designationGu}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.designationGu}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '300px' }}>{m.bioEn || m.bioGu || '—'}</td>
                      <td>
                        <span className={`badge ${m.isActive ? 'badge-vacant' : 'badge-reserved'}`}>
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleOrderChange(m, m.displayOrder - 1)} title="Move Up">
                            <ArrowUp size={14} />
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleOrderChange(m, m.displayOrder + 1)} title="Move Down">
                            <ArrowDown size={14} />
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleEditMember(m)} title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleDeleteMember(m.id)} style={{ color: 'red' }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DARPAN PUBLICATIONS MANAGER */}
      {activeTab === 'darpan' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>Satvara Darpan Publications Archive</h2>
            <button className="btn btn-primary" onClick={() => { resetDarpanForm(); setShowDarpanModal(true); }}>
              <Plus size={16} /> Add Darpan Issue
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {darpanList.map((d) => (
              <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ height: '140px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {d.coverImage ? (
                      <img
                        src={getMediaUrl(d.coverImage) || DEFAULT_DARPAN_COVER}
                        alt={d.titleEn || d.titleGu}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_DARPAN_COVER;
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <BookOpen size={48} color="var(--primary-navy)" />
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-navy)', marginBottom: '4px' }}>{d.titleEn || d.titleGu}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Month: {d.month} {d.year}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEditDarpan(d)} style={{ flex: 1 }}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDeleteDarpan(d.id)} style={{ color: 'red' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NEWS MANAGER (WITH EDIT & DELETE) */}
      {activeTab === 'news' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>News & Circular Announcements</h2>
            <button className="btn btn-primary" onClick={() => { resetNewsForm(); setShowNewsModal(true); }}>
              <Plus size={16} /> Add News Item
            </button>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title (English)</th>
                    <th>Title (Gujarati)</th>
                    <th>Published Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.map((n) => (
                    <tr key={n.id}>
                      <td><strong>{n.titleEn || n.titleGu}</strong></td>
                      <td>{n.titleGu}</td>
                      <td>{new Date(n.publishedDate).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleEditNews(n)} title="Edit News">
                            <Edit3 size={14} /> Edit
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleDeleteNews(n.id)} style={{ color: 'red' }} title="Delete News">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMMITTEE MODAL (WITH FILE UPLOAD & PREVIEW) */}
      {showCommitteeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-navy)' }}>
              {editingMemberId ? 'Edit Committee Member' : 'Add New Committee Member'}
            </h3>
            <form onSubmit={handleSaveCommitteeMember}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Name (English) *</label>
                  <input type="text" className="form-control" value={committeeForm.nameEn} onChange={(e) => setCommitteeForm({ ...committeeForm, nameEn: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Name (Gujarati) *</label>
                  <input type="text" className="form-control" value={committeeForm.nameGu} onChange={(e) => setCommitteeForm({ ...committeeForm, nameGu: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Designation (English) *</label>
                  <input type="text" className="form-control" value={committeeForm.designationEn} onChange={(e) => setCommitteeForm({ ...committeeForm, designationEn: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation (Gujarati) *</label>
                  <input type="text" className="form-control" value={committeeForm.designationGu} onChange={(e) => setCommitteeForm({ ...committeeForm, designationGu: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Display Order # (e.g. 1 for Top) *</label>
                  <input type="number" min="1" className="form-control" value={committeeForm.displayOrder} onChange={(e) => setCommitteeForm({ ...committeeForm, displayOrder: e.target.value })} required />
                </div>
                
                {/* PHOTO FILE UPLOAD */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} /> Upload Photo Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => handleFileSelect(e, (base64) => setCommitteeForm({ ...committeeForm, photoPath: base64 }))}
                  />
                  {committeeForm.photoPath && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={committeeForm.photoPath} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>✓ Photo Ready</span>
                      </div>
                      <button type="button" onClick={() => setCommitteeForm({ ...committeeForm, photoPath: '' })} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio / Description</label>
                <textarea className="form-control" rows={2} value={committeeForm.bioEn || committeeForm.bioGu} onChange={(e) => setCommitteeForm({ ...committeeForm, bioEn: e.target.value, bioGu: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCommitteeModal(false)} disabled={savingCommittee} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingCommittee} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {savingCommittee ? <><Loader2 className="animate-spin" size={16} /> Saving Member...</> : (editingMemberId ? 'Update Member' : 'Save Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DARPAN MODAL (WITH FILE UPLOADS & PREVIEW) */}
      {showDarpanModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-navy)' }}>
              {editingDarpanId ? 'Edit Darpan Issue' : 'Add New Darpan Publication Issue'}
            </h3>
            <form onSubmit={handleSaveDarpan}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Title (English) *</label>
                  <input type="text" className="form-control" placeholder="e.g. Satvara Darpan - August 2026" value={darpanForm.titleEn} onChange={(e) => setDarpanForm({ ...darpanForm, titleEn: e.target.value, titleGu: darpanForm.titleGu || e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Title (Gujarati)</label>
                  <input type="text" className="form-control" placeholder="e.g. સતવારા દર્પણ-ઓગસ્ટ ૨૦૨૬" value={darpanForm.titleGu} onChange={(e) => setDarpanForm({ ...darpanForm, titleGu: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Month *</label>
                  <input type="text" className="form-control" placeholder="e.g. August / ઓગસ્ટ" value={darpanForm.month} onChange={(e) => setDarpanForm({ ...darpanForm, month: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input type="text" className="form-control" placeholder="e.g. 2026 / ૨૦૨૬" value={darpanForm.year} onChange={(e) => setDarpanForm({ ...darpanForm, year: e.target.value })} required />
                </div>
              </div>

              {/* COVER IMAGE FILE UPLOAD */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} /> Upload Magazine Cover Image File *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => handleFileSelect(e, (base64) => setDarpanForm({ ...darpanForm, coverImage: base64 }))}
                />
                {darpanForm.coverImage && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={darpanForm.coverImage} alt="Cover Preview" style={{ width: '28px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>✓ Cover Image Ready</span>
                    </div>
                    <button type="button" onClick={() => setDarpanForm({ ...darpanForm, coverImage: '' })} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* PDF FILE UPLOAD */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Upload Darpan PDF Document File *
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="form-control"
                  disabled={uploadingPdf}
                  onChange={(e) => handleFileSelect(e, (urlOrBase64) => setDarpanForm({ ...darpanForm, pdfFile: urlOrBase64 }), setUploadingPdf)}
                />
                {uploadingPdf && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fde047', color: '#b45309', fontSize: '0.82rem', fontWeight: 'bold' }}>
                    <Loader2 className="animate-spin" size={16} /> Attaching & Uploading PDF File (Please wait)...
                  </div>
                )}
                {!uploadingPdf && darpanForm.pdfFile && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 'bold' }}>✓ PDF Document File Attached</span>
                    <button type="button" onClick={() => setDarpanForm({ ...darpanForm, pdfFile: '' })} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowDarpanModal(false)} disabled={savingDarpan || uploadingPdf} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingDarpan || uploadingPdf} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {savingDarpan ? <><Loader2 className="animate-spin" size={16} /> Saving Issue...</> : (editingDarpanId ? 'Update Issue' : 'Save Issue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEWS MODAL (WITH FILE UPLOAD & PREVIEW) */}
      {showNewsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-navy)' }}>
              {editingNewsId ? 'Edit News Circular' : 'Add News Circular'}
            </h3>
            <form onSubmit={handleSaveNews}>
              <div className="form-group">
                <label className="form-label">Title (English) *</label>
                <input type="text" className="form-control" value={newsForm.titleEn} onChange={(e) => setNewsForm({ ...newsForm, titleEn: e.target.value, titleGu: newsForm.titleGu || e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Title (Gujarati)</label>
                <input type="text" className="form-control" value={newsForm.titleGu} onChange={(e) => setNewsForm({ ...newsForm, titleGu: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Content Description *</label>
                <textarea className="form-control" rows={3} value={newsForm.contentEn || newsForm.contentGu} onChange={(e) => setNewsForm({ ...newsForm, contentEn: e.target.value, contentGu: e.target.value })} required />
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={14} /> Upload Circular / Announcement Image
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="form-control"
                  onChange={(e) => handleFileSelect(e, (base64) => setNewsForm({ ...newsForm, featuredImage: base64 }))}
                />
                {newsForm.featuredImage && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={newsForm.featuredImage} alt="News Preview" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>✓ Image Ready</span>
                    </div>
                    <button type="button" onClick={() => setNewsForm({ ...newsForm, featuredImage: '' })} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewsModal(false)} disabled={savingNews} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingNews} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {savingNews ? <><Loader2 className="animate-spin" size={16} /> Saving News...</> : (editingNewsId ? 'Update News' : 'Save News')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
