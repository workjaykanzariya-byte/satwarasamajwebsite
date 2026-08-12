import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Award, CheckCircle, RefreshCw, Send, Plus, Trash2, Upload, Eye } from 'lucide-react';

export default function MeritEngine() {
  const [meritLists, setMeritLists] = useState([]);
  const [hostelType, setHostelType] = useState('BOYS');
  const [cutoffCount, setCutoffCount] = useState(20);
  const [loading, setLoading] = useState(false);

  // Custom Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customHostelType, setCustomHostelType] = useState('BOYS');
  const [customYear, setCustomYear] = useState('2026-2027');
  const [customPdfFile, setCustomPdfFile] = useState(null);
  const [autoPublish, setAutoPublish] = useState(true);

  useEffect(() => {
    fetchMeritLists();
  }, []);

  const fetchMeritLists = async () => {
    try {
      const res = await api.get('/merit/admin');
      if (res.data.success) setMeritLists(res.data.meritLists);
    } catch (err) {
      console.error('Fetch merit lists error:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/merit/generate', {
        title: `${hostelType} Hostel Official Merit List 2026-2027`,
        hostelType,
        academicYear: '2026-2027',
        cutoffCount: parseInt(cutoffCount, 10),
      });

      if (res.data.success) {
        alert('Merit list generated successfully!');
        fetchMeritLists();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate merit list.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCustomMerit = async (e) => {
    e.preventDefault();
    if (!customTitle) {
      alert('Please enter Merit List Title.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', customTitle);
      formData.append('hostelType', customHostelType);
      formData.append('academicYear', customYear);
      formData.append('isPublished', autoPublish);

      if (customPdfFile) {
        formData.append('pdfFile', customPdfFile);
      }

      const res = await api.post('/merit/custom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        alert('New Merit List created and published successfully!');
        setShowUploadModal(false);
        setCustomTitle('');
        setCustomPdfFile(null);
        fetchMeritLists();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload merit list.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.put(`/merit/${id}/publish`);
      if (res.data.success) {
        alert(res.data.message);
        fetchMeritLists();
      }
    } catch (err) {
      alert('Failed to update publish status.');
    }
  };

  const handleDeleteMeritList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merit list?')) return;
    try {
      const res = await api.delete(`/merit/${id}`);
      if (res.data.success) {
        alert('Merit list deleted.');
        fetchMeritLists();
      }
    } catch (err) {
      alert('Failed to delete merit list.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
            Merit List Engine & Management
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Auto-generate merit ranks or upload custom merit list PDFs to publish on the public website.</p>
        </div>

        <button className="btn btn-accent btn-lg" onClick={() => setShowUploadModal(true)}>
          <Upload size={18} /> Upload New Merit List (PDF / Custom)
        </button>
      </div>

      {/* AUTO-GENERATE MERIT FORM */}
      <div className="card" style={{ padding: '24px', marginBottom: '30px', background: '#f8fafc' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>
          ⚡ Option 1: Auto-Calculate Ranked List From Applicants
        </h3>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Hostel Type</label>
            <select className="form-control" value={hostelType} onChange={(e) => setHostelType(e.target.value)}>
              <option value="BOYS">Boys Hostel</option>
              <option value="GIRLS">Girls Hostel</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Selection Cut-off Seat Count</label>
            <input type="number" className="form-control" value={cutoffCount} onChange={(e) => setCutoffCount(e.target.value)} min={1} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Award size={18} /> Auto-Generate Ranked List
          </button>
        </form>
      </div>

      {/* MERIT LISTS DISPLAY */}
      <h3 style={{ color: 'var(--primary-navy)', marginBottom: '16px' }}>Published & Draft Merit Lists</h3>

      {meritLists.map((ml) => (
        <div key={ml.id} className="card" style={{ marginBottom: '24px', borderLeft: ml.isPublished ? '5px solid #166534' : '5px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.25rem' }}>{ml.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Hostel: <strong>{ml.hostelType}</strong> | Academic Year: <strong>{ml.academicYear}</strong> | Total Entries: <strong>{ml.entries?.length || 0}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className={`btn btn-sm ${ml.isPublished ? 'btn-outline' : 'btn-accent'}`}
                onClick={() => handleTogglePublish(ml.id)}
              >
                <Send size={14} /> {ml.isPublished ? 'Unpublish' : 'Publish to Public Site'}
              </button>
              <button
                className="btn btn-sm"
                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
                onClick={() => handleDeleteMeritList(ml.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>

          {ml.entries && ml.entries.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>App No</th>
                    <th>Applicant Name</th>
                    <th>Last Exam %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ml.entries.slice(0, 10).map((entry) => (
                    <tr key={entry.id}>
                      <td><strong>#{entry.rank}</strong></td>
                      <td>{entry.application?.applicationNumber}</td>
                      <td>{entry.application?.applicantDetails?.firstName} {entry.application?.applicantDetails?.lastName}</td>
                      <td><strong>{entry.totalMarksPct}%</strong></td>
                      <td>
                        <span className={`badge ${entry.status === 'SELECTED' ? 'badge-vacant' : 'badge-reserved'}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '4px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              📄 Uploaded Merit List PDF / Published Announcement Notice
            </div>
          )}
        </div>
      ))}

      {/* UPLOAD CUSTOM MERIT LIST MODAL */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-navy)' }}>
              Upload New Merit List / Notice
            </h3>
            <form onSubmit={handleUploadCustomMerit}>
              <div className="form-group">
                <label className="form-label">Merit List Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Boys Hostel First Merit List 2026-2027"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hostel Type</label>
                <select className="form-control" value={customHostelType} onChange={(e) => setCustomHostelType(e.target.value)}>
                  <option value="BOYS">Boys Hostel</option>
                  <option value="GIRLS">Girls Hostel</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input type="text" className="form-control" value={customYear} onChange={(e) => setCustomYear(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Upload PDF Document (Optional)</label>
                <input type="file" className="form-control" accept=".pdf,image/*" onChange={(e) => setCustomPdfFile(e.target.files[0])} />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="pubChk" checked={autoPublish} onChange={(e) => setAutoPublish(e.target.checked)} />
                <label htmlFor="pubChk">Publish Immediately to Public Website</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Uploading...' : 'Save & Publish Merit List'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
