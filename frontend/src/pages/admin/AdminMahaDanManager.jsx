import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MahaDanCreativeCard from '../../components/common/MahaDanCreativeCard';
import { Heart, Search, CheckCircle, XCircle, Eye, Download, ShieldCheck, DollarSign, Award, RefreshCw, User, Image as ImageIcon, X, Palette, Trash2, Power, QrCode, Upload } from 'lucide-react';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/uploads')) {
    return `/api/v1${cleanPath}`;
  }
  return cleanPath;
};

export default function AdminMahaDanManager() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalAmount: 0, totalDonors: 0, pendingVerifications: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Portal Master Status Setting
  const [portalStatus, setPortalStatus] = useState('OPEN');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Screenshot Zoom Modal State
  const [activeScreenshot, setActiveScreenshot] = useState(null);

  // Creative Card Modal State
  const [creativeModalItem, setCreativeModalItem] = useState(null);

  // Rejection Modal State
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Multi-select / Bulk Delete State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // QR Code Management
  const [currentQR, setCurrentQR] = useState(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrFile, setQrFile] = useState(null);

  useEffect(() => {
    fetchDonations();
    fetchPortalStatus();
  }, [filterStatus]);

  useEffect(() => {
    fetchCurrentQR();
  }, []);

  const fetchCurrentQR = async () => {
    try {
      const res = await api.get('/cms/settings');
      if (res.data.success && res.data.settings && res.data.settings.mahadan_qr_image) {
        setCurrentQR(res.data.settings.mahadan_qr_image);
      }
    } catch (err) {
      console.error('Failed to fetch QR setting', err);
    }
  };

  const handleQRUpload = async () => {
    if (!qrFile) { alert('Please select a QR image file first.'); return; }
    setQrUploading(true);
    try {
      const formData = new FormData();
      formData.append('qrImage', qrFile);
      const res = await api.post('/cms/settings/upload-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setCurrentQR(res.data.qrImagePath);
        setQrFile(null);
        alert('QR Code updated successfully! It is now live on the Maha Dan payment page.');
      } else {
        alert(res.data.message || 'Failed to upload QR code.');
      }
    } catch (err) {
      alert('Failed to upload QR code. Please try again.');
    } finally {
      setQrUploading(false);
    }
  };

  const handleClearQR = async () => {
    if (!window.confirm('Remove the custom QR code? The page will fall back to the auto-generated UPI QR.')) return;
    try {
      await api.post('/cms/settings', { mahadan_qr_image: '' });
      setCurrentQR(null);
      alert('Custom QR code removed. Auto-generated QR is now active.');
    } catch (err) {
      alert('Failed to clear QR code.');
    }
  };

  const fetchPortalStatus = async () => {
    try {
      const res = await api.get('/cms/settings');
      if (res.data.success && res.data.settings) {
        setPortalStatus(res.data.settings.mahadan_status || 'OPEN');
      }
    } catch (err) {
      console.error('Failed to fetch portal status setting', err);
    }
  };

  const togglePortalStatus = async () => {
    const newStatus = portalStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    const confirmMsg = newStatus === 'CLOSED'
      ? 'Are you sure you want to CLOSE the Maha Dan Portal? It will be HIDDEN from the header, footer, and entire site.'
      : 'Re-open the Maha Dan Portal site-wide?';
    if (!window.confirm(confirmMsg)) return;
    setUpdatingStatus(true);
    try {
      const res = await api.post('/cms/settings', { mahadan_status: newStatus });
      if (res.data.success) {
        setPortalStatus(newStatus);
        alert(`Maha Dan Portal is now ${newStatus}!`);
      }
    } catch (err) {
      alert('Failed to update portal status setting.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      let url = '/mahadan/admin/all';
      if (filterStatus !== 'ALL') url += `?status=${filterStatus}`;
      const res = await api.get(url);
      if (res.data.success) {
        setDonations(res.data.donations || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch Maha Dan donations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this Maha Dan donation and issue official Honor Certificate Card?')) return;
    try {
      const res = await api.put(`/mahadan/admin/${id}/verify`, { status: 'APPROVED' });
      if (res.data.success) {
        alert('Donation approved successfully!');
        fetchDonations();
      }
    } catch (err) {
      alert('Failed to approve donation.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this donation record?')) return;
    try {
      const res = await api.delete(`/mahadan/admin/${id}`);
      if (res.data.success) {
        alert('Donation record deleted successfully.');
        fetchDonations();
      } else {
        alert(res.data.message || 'Failed to delete donation record.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete donation record. Please try again.';
      alert(msg);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedIds.size} selected donation record(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      const res = await api.delete('/mahadan/admin/bulk', { data: { ids: Array.from(selectedIds) } });
      if (res.data.success) {
        alert(res.data.message);
        fetchDonations();
      } else {
        alert(res.data.message || 'Bulk delete failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Bulk delete failed. Please try again.';
      alert(msg);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    try {
      const res = await api.put(`/mahadan/admin/${rejectModalItem.id}/verify`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'Payment screenshot could not be verified by Trust Admin.',
      });
      if (res.data.success) {
        alert('Donation status updated to Rejected.');
        setRejectModalItem(null);
        setRejectionReason('');
        fetchDonations();
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const filteredDonations = donations.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.donorName || '').toLowerCase().includes(q) ||
      (d.mobile || '').toLowerCase().includes(q) ||
      (d.certificateNo || '').toLowerCase().includes(q) ||
      (d.transactionId || '').toLowerCase().includes(q)
    );
  });

  // Checkbox helpers
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDonations.length && filteredDonations.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDonations.map((d) => d.id)));
    }
  };

  const allSelected = filteredDonations.length > 0 && selectedIds.size === filteredDonations.length;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.1rem', color: 'var(--primary-navy)', margin: 0 }}>
            ❤️ Maha Dan Verification & Creative Card Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Verify payment screenshots, approve contributions, and generate high-res donor creative poster cards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={togglePortalStatus}
            disabled={updatingStatus}
            className="btn"
            style={{ background: portalStatus === 'OPEN' ? '#166534' : '#DC2626', color: '#FFFFFF', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', cursor: 'pointer' }}
          >
            <Power size={18} />
            {portalStatus === 'OPEN' ? '🟢 Portal: OPEN (Click to Close)' : '🔴 Portal: CLOSED (Click to Open)'}
          </button>
          <button className="btn btn-outline" onClick={fetchDonations} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* =================== QR CODE MANAGEMENT PANEL =================== */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px', border: '2px solid #E2E8F0', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={22} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary-navy)', fontWeight: 800 }}>Maha Dan Payment QR Code Manager</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload your trust's official UPI QR code image — it will be displayed live on the Maha Dan payment page.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: currentQR ? '200px 1fr' : '1fr', gap: '24px', alignItems: 'flex-start' }}>
          {/* Current QR Preview */}
          {currentQR && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Current Active QR Code</div>
              <div style={{ background: '#FFFFFF', border: '3px solid #F59E0B', borderRadius: '14px', padding: '12px', display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
                <img
                  src={getImageUrl(currentQR)}
                  alt="Current QR Code"
                  style={{ width: '160px', height: '160px', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <button
                onClick={handleClearQR}
                className="btn btn-outline btn-sm"
                style={{ marginTop: '10px', color: '#DC2626', borderColor: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '4px', margin: '10px auto 0 auto' }}
              >
                <X size={14} /> Remove QR
              </button>
            </div>
          )}

          {/* Upload New QR */}
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '10px' }}>
              {currentQR ? '🔄 Replace with New QR Code Image' : '📤 Upload Maha Dan Payment QR Code'}
            </div>
            <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '20px', marginBottom: '14px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files[0] || null)}
                className="form-control"
                style={{ marginBottom: '8px' }}
              />
              {qrFile && (
                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <CheckCircle size={14} /> Selected: {qrFile.name} ({(qrFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '14px', lineHeight: '1.5' }}>
              💡 <strong>Tip:</strong> Download your QR code from your bank / GPay / PhonePe / Paytm app. Upload as JPG or PNG. The uploaded QR will immediately replace the auto-generated QR on the Maha Dan page.
            </div>
            <button
              onClick={handleQRUpload}
              disabled={qrUploading || !qrFile}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (!qrFile || qrUploading) ? 0.6 : 1 }}
            >
              <Upload size={16} /> {qrUploading ? 'Uploading...' : 'Upload & Set as Active QR Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="card" style={{ borderLeft: '5px solid #F59E0B', padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Verified Maha Dan</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '4px' }}>₹ {stats.totalAmount.toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #2563EB', padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Verified Donors</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '4px' }}>{stats.totalDonors} Donors</div>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #D97706', padding: '20px', background: stats.pendingVerifications > 0 ? '#FFFBEB' : '#FFFFFF' }}>
          <div style={{ fontSize: '0.8rem', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Pending Verifications</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#B45309', marginTop: '4px' }}>{stats.pendingVerifications} Pending</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['ALL', 'UNDER_VERIFICATION', 'APPROVED', 'REJECTED'].map((status) => {
              const labels = { ALL: 'All', UNDER_VERIFICATION: '🟡 Pending', APPROVED: '🟢 Approved', REJECTED: '🔴 Rejected' };
              const colors = { UNDER_VERIFICATION: '#B45309', APPROVED: '#166534', REJECTED: '#991B1B' };
              const count = status === 'ALL' ? donations.length : donations.filter((d) => d.verificationStatus === status).length;
              return (
                <button
                  key={status}
                  className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilterStatus(status)}
                  style={filterStatus !== status && colors[status] ? { color: colors[status], borderColor: colors[status] } : {}}
                >
                  {labels[status]} ({count})
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Search donor name, mobile, Ref ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ minWidth: '280px' }}
          />
        </div>
      </div>

      {/* Bulk Delete Toolbar — shows when items are selected */}
      {selectedIds.size > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #FEF2F2, #FFF5F5)', border: '1.5px solid #FCA5A5', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#DC2626" />
            </div>
            <div>
              <strong style={{ color: '#991B1B', fontSize: '0.95rem' }}>{selectedIds.size} record(s) selected</strong>
              <div style={{ fontSize: '0.78rem', color: '#B91C1C' }}>Click "Delete Selected" to permanently remove these records.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setSelectedIds(new Set())} className="btn btn-outline btn-sm" style={{ color: '#64748B' }}>
              Clear Selection
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="btn btn-sm"
              style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Trash2 size={15} /> {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size} Selected`}
            </button>
          </div>
        </div>
      )}

      {/* Donations Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '44px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#DC2626' }}
                    title="Select All"
                  />
                </th>
                <th>Ref ID / Date</th>
                <th>Donor Details</th>
                <th>Amount (₹)</th>
                <th>Payment Mode / UTR No</th>
                <th>Payment Screenshot</th>
                <th>Status</th>
                <th>Actions & Creative Card</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No donation records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => {
                  const isSelected = selectedIds.has(d.id);
                  return (
                    <tr key={d.id} style={{ background: isSelected ? '#FFF5F5' : 'transparent', outline: isSelected ? '2px solid #FCA5A5' : 'none' }}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(d.id)}
                          style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#DC2626' }}
                        />
                      </td>

                      <td>
                        <strong style={{ color: 'var(--primary-navy)', fontFamily: 'monospace' }}>{d.certificateNo}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(d.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                            {d.photoPath ? (
                              <img src={getImageUrl(d.photoPath)} alt={d.donorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <User size={20} style={{ margin: '8px auto 0 auto', display: 'block', color: '#94A3B8' }} />
                            )}
                          </div>
                          <div>
                            <strong>{d.donorName}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📱 {d.mobile}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-maroon)' }}>
                          ₹ {d.amount.toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>{d.paymentMode || 'UPI_QR'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>UTR: {d.transactionId || 'N/A'}</div>
                      </td>

                      <td>
                        {d.paymentScreenshot ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setActiveScreenshot(d.paymentScreenshot)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                          >
                            <Eye size={14} /> View Screenshot
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Screenshot</span>
                        )}
                      </td>

                      <td>
                        {d.verificationStatus === 'APPROVED' && <span className="badge badge-vacant">🟢 APPROVED</span>}
                        {d.verificationStatus === 'REJECTED' && <span className="badge badge-reserved">🔴 REJECTED</span>}
                        {d.verificationStatus === 'UNDER_VERIFICATION' && (
                          <span className="badge" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>🟡 UNDER VERIFICATION</span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button className="btn btn-sm" onClick={() => setCreativeModalItem(d)} style={{ background: 'linear-gradient(135deg, #EA580C, #D97706)', color: '#FFFFFF', fontWeight: 'bold', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Palette size={14} /> Creative Card
                          </button>

                          {d.verificationStatus !== 'APPROVED' && (
                            <button className="btn btn-sm" onClick={() => handleApprove(d.id)} style={{ background: '#166534', color: '#FFF', fontWeight: 'bold', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={14} /> Approve
                            </button>
                          )}

                          {d.verificationStatus !== 'REJECTED' && (
                            <button className="btn btn-outline btn-sm" onClick={() => setRejectModalItem(d)} style={{ color: '#DC2626', borderColor: '#FCA5A5' }}>
                              <XCircle size={14} /> Reject
                            </button>
                          )}

                          <button className="btn btn-outline btn-sm" onClick={() => handleDelete(d.id)} style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCREENSHOT ZOOM MODAL */}
      {activeScreenshot && (
        <div className="modal-overlay" onClick={() => setActiveScreenshot(null)}>
          <div className="modal-content" style={{ maxWidth: '650px', padding: '24px', background: '#FFFFFF' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon color="var(--primary-maroon)" size={20} /> Payment Screenshot Proof
              </h3>
              <button onClick={() => setActiveScreenshot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto', textAlign: 'center', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <img src={getImageUrl(activeScreenshot)} alt="Payment Proof" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <a href={getImageUrl(activeScreenshot)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} /> Open Full Resolution
              </a>
              <button className="btn btn-primary" onClick={() => setActiveScreenshot(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CREATIVE CARD MODAL */}
      {creativeModalItem && (
        <div className="modal-overlay" onClick={() => setCreativeModalItem(null)}>
          <div className="modal-content" style={{ maxWidth: '720px', padding: '24px', background: '#F8FAFC' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', margin: 0, fontWeight: 'bold' }}>
                🎨 Creative Card — {creativeModalItem.donorName}
              </h3>
              <button onClick={() => setCreativeModalItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <MahaDanCreativeCard donation={creativeModalItem} showActions={true} />
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>
              Reject Maha Dan Payment ({rejectModalItem.certificateNo})
            </h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Specify Rejection Reason for Donor *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Transaction UTR mismatch or invalid payment screenshot."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setRejectModalItem(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn" style={{ background: '#DC2626', color: '#FFF', fontWeight: 'bold', flex: 1 }}>Confirm Reject</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
