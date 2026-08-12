import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserCheck, MapPin, Search, Edit2, Calendar, Clock, AlertTriangle, RefreshCw, Check } from 'lucide-react';

export default function StudentsManager() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    result: '',
    joiningDate: '',
    expiringDate: '',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: { search } });
      if (res.data.success) setStudents(res.data.students);
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckExpiryNow = async () => {
    setActionMsg('');
    try {
      const res = await api.post('/students/check-expiry');
      if (res.data.success) {
        setActionMsg(`✅ Expired Stay Check Processed! ${res.data.deallocatedCount} expired stay(s) automatically vacated.`);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process expiry check.');
    }
  };

  const handleOpenEditModal = (st) => {
    setEditingStudent(st);
    setEditFormData({
      result: st.result || '',
      joiningDate: st.joiningDate ? new Date(st.joiningDate).toISOString().split('T')[0] : '',
      expiringDate: st.expiringDate ? new Date(st.expiringDate).toISOString().split('T')[0] : '',
      status: st.status || 'ACTIVE',
    });
    setActionMsg('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/students/${editingStudent.id}`, editFormData);
      if (res.data.success) {
        setActionMsg(`Student ${editingStudent.studentCode} details updated successfully.`);
        setEditingStudent(null);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
            Active Hostel Students & Stay Expiry Engine
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage student academic results, joining dates, stay expiry dates, and auto-deallocate expired stays.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchStudents} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleCheckExpiryNow} className="btn btn-primary" style={{ background: '#D97706', borderColor: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} /> Check & Auto-Vacate Expired Stays
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {actionMsg}
        </div>
      )}

      <div className="form-group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by Student Code, Name, App No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table" style={{ width: '100%', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: '#FFFFFF' }}>
                <th>Student Code</th>
                <th>App Number</th>
                <th>Full Name</th>
                <th>Academic Result</th>
                <th>Assigned Hostel & Bed</th>
                <th>Joining Date</th>
                <th>Expiring Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Loading student records...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>No students found.</td>
                </tr>
              ) : (
                students.map((st) => {
                  const now = new Date();
                  const isExpired = st.expiringDate && new Date(st.expiringDate) <= now && st.status === 'ACTIVE';

                  return (
                    <tr key={st.id} style={{ background: isExpired ? '#FEF2F2' : 'transparent' }}>
                      <td><strong>{st.studentCode}</strong></td>
                      <td>{st.application?.applicationNumber}</td>
                      <td>
                        <div style={{ fontWeight: 'bold' }}>{st.application?.applicantDetails?.firstName} {st.application?.applicantDetails?.lastName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{st.application?.academicDetails?.courseName}</div>
                      </td>
                      <td>
                        {st.result ? (
                          <span style={{ fontWeight: 'bold', color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '6px' }}>
                            {st.result}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Pending Update</span>
                        )}
                      </td>
                      <td>
                        {st.bed ? (
                          <div>
                            <span className="badge badge-vacant" style={{ display: 'inline-block', marginBottom: '2px' }}>
                              Room {st.bed.room?.roomNumber} ({st.bed.bedLabel})
                            </span>
                            <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{st.hostel ? st.hostel.name : ''}</div>
                          </div>
                        ) : (
                          <span className="badge badge-reserved">Bed Vacated / Unassigned</span>
                        )}
                      </td>
                      <td>{st.joiningDate ? new Date(st.joiningDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {st.expiringDate ? (
                          <span style={{ fontWeight: isExpired ? 'bold' : 'normal', color: isExpired ? '#DC2626' : '#1E293B' }}>
                            {new Date(st.expiringDate).toLocaleDateString()} {isExpired && '⚠️ (EXPIRED)'}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Not set</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${st.status === 'ACTIVE' ? 'badge-vacant' : 'badge-maintenance'}`}>
                          {st.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenEditModal(st)} className="btn btn-outline btn-sm" title="Edit Result & Stay Expiry">
                          <Edit2 size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '550px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--primary-navy)' }}>
              Edit Student Stay & Academic Details ({editingStudent.studentCode})
            </h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Academic Result / Percentage / Semester Rank</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Passed Sem 4 (82.5%) or 1st Class Distinction"
                  value={editFormData.result}
                  onChange={(e) => setEditFormData({ ...editFormData, result: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editFormData.joiningDate}
                    onChange={(e) => setEditFormData({ ...editFormData, joiningDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stay Expiring Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editFormData.expiringDate}
                    onChange={(e) => setEditFormData({ ...editFormData, expiringDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Student Status</label>
                <select
                  className="form-control"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE (In Hostel)</option>
                  <option value="ALUMNI">ALUMNI (Passed Out)</option>
                  <option value="EXITED">EXITED (Bed Vacated)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setEditingStudent(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Student Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
