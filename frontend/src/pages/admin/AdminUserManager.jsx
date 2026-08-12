import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, Plus, Edit2, Trash2, Check, X, Lock, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

const ADMIN_PAGES = [
  { key: 'dashboard', label: 'Dashboard Overview', desc: 'Main summary metrics & charts' },
  { key: 'occupancy', label: 'Hostel & Bed Occupancy', desc: 'Manage floors, rooms, beds & allotments' },
  { key: 'mahadan', label: 'Maha Dan Portal', desc: 'View collection stats & donor records' },
  { key: 'applications', label: 'Student Applications', desc: 'Review & verify submitted applications' },
  { key: 'merit', label: 'Merit List Engine', desc: 'Generate & publish student merit lists' },
  { key: 'students', label: 'Student Records & Stays', desc: 'Student profile, results & stay expiry' },
  { key: 'fees', label: 'Fees & Accounts', desc: 'Receipts, payments & fee structures' },
  { key: 'cms', label: 'CMS Content & News', desc: 'Manage news, circulars & publications' },
  { key: 'audit', label: 'System Audit Logs', desc: 'View complete system audit logs' },
  { key: 'users', label: 'Admin Roles & Access', desc: 'Manage sub-admin users & page access' },
];

export default function AdminUserManager() {
  const { admin: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'HOSTEL_MANAGER',
    phone: '',
    isActive: true,
    permissions: ['dashboard', 'occupancy'],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin users.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'HOSTEL_MANAGER',
      phone: '',
      isActive: true,
      permissions: ['dashboard', 'occupancy', 'students'],
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // leave empty to keep unchanged
      role: user.role || 'HOSTEL_MANAGER',
      phone: user.phone || '',
      isActive: user.isActive,
      permissions: user.permissions || (user.role === 'SUPER_ADMIN' ? ADMIN_PAGES.map(p => p.key) : []),
    });
    setError('');
    setShowModal(true);
  };

  const handlePermissionToggle = (key) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(key);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== key) };
      } else {
        return { ...prev, permissions: [...prev.permissions, key] };
      }
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: ADMIN_PAGES.map((p) => p.key),
    }));
  };

  const handleClearPermissions = () => {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Please provide Name and Email.');
      return;
    }
    if (!editingUser && !formData.password) {
      setError('Password is required for new admin user.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingUser) {
        const res = await api.put(`/auth/users/${editingUser.id}`, formData);
        if (res.data.success) {
          setSuccessMsg(`Admin user '${formData.name}' updated successfully!`);
          setShowModal(false);
          fetchUsers();
        }
      } else {
        const res = await api.post('/auth/users', formData);
        if (res.data.success) {
          setSuccessMsg(`New admin user '${formData.name}' created successfully!`);
          setShowModal(false);
          fetchUsers();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete admin user '${name}'? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/auth/users/${id}`);
      if (res.data.success) {
        setSuccessMsg(`Admin user '${name}' deleted successfully.`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="admin-page-container" style={{ padding: '24px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Shield size={28} color="#D97706" /> Admin Roles & Access Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Create sub-admins and assign granular page access permissions to keep system operations secure.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchUsers} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} /> Add New Admin User
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Admin Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: '#FFFFFF' }}>
              <th style={{ padding: '14px 18px' }}>Admin Name</th>
              <th style={{ padding: '14px 18px' }}>Role</th>
              <th style={{ padding: '14px 18px' }}>Allowed Page Access</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px' }}>Last Login</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading admin users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No admin users found.</td>
              </tr>
            ) : (
              users.map((u) => {
                const isSuper = u.role === 'SUPER_ADMIN';
                const perms = isSuper ? ['FULL ACCESS (ALL PAGES)'] : (u.permissions || []);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #E2E8F0', background: u.id === currentAdmin?.id ? '#F8FAFC' : 'transparent' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0F172A' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{u.email} {u.phone ? `| ${u.phone}` : ''}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 'bold',
                          background: isSuper ? '#FEF3C7' : '#E0F2FE',
                          color: isSuper ? '#92400E' : '#0369A1',
                          border: isSuper ? '1px solid #F59E0B' : '1px solid #38BDF8',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {isSuper ? (
                        <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#059669', background: '#D1FAE5', padding: '3px 10px', borderRadius: '12px' }}>
                          ⚡ Unrestricted Super Admin
                        </span>
                      ) : perms.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>No pages assigned</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {perms.map((pKey) => {
                            const pageObj = ADMIN_PAGES.find((pg) => pg.key === pKey);
                            return (
                              <span
                                key={pKey}
                                style={{
                                  fontSize: '0.74rem',
                                  background: '#F1F5F9',
                                  border: '1px solid #CBD5E1',
                                  color: '#334155',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                }}
                              >
                                {pageObj ? pageObj.label : pKey}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {u.isActive ? (
                        <span style={{ color: '#166534', fontWeight: 'bold', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} color="#166534" /> Active
                        </span>
                      ) : (
                        <span style={{ color: '#991B1B', fontWeight: 'bold', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <X size={14} color="#991B1B" /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#64748B' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleOpenEditModal(u)} className="btn btn-outline btn-sm" title="Edit Admin & Access Permissions">
                          <Edit2 size={14} /> Edit
                        </button>
                        {u.id !== currentAdmin?.id && (
                          <button onClick={() => handleDeleteUser(u.id, u.name)} className="btn btn-danger btn-sm" title="Delete User">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield color="#D97706" size={22} /> {editingUser ? 'Edit Admin User & Access Permissions' : 'Create New Admin User'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Warden Ramesh Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@satvaramahamandal.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">{editingUser ? 'New Password (Leave blank to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="10 digit mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">Primary Role</label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="SUPER_ADMIN">SUPER ADMIN (Full Unrestricted Access)</option>
                    <option value="HOSTEL_MANAGER">HOSTEL MANAGER</option>
                    <option value="ADMISSION_MANAGER">ADMISSION MANAGER</option>
                    <option value="ACCOUNTS_MANAGER">ACCOUNTS MANAGER</option>
                    <option value="CONTENT_MANAGER">CONTENT MANAGER</option>
                    <option value="WARDEN">WARDEN</option>
                    <option value="VIEWER">VIEWER (Read Only)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Account Active & Allowed Login
                  </label>
                </div>
              </div>

              {/* PERMISSION CHECKBOXES SECTION */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '1rem' }}>
                      🔒 Granular Page Access Permissions
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                      Select which admin pages this user is permitted to see and access.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={handleSelectAllPermissions} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                      Select All
                    </button>
                    <button type="button" onClick={handleClearPermissions} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                      Clear All
                    </button>
                  </div>
                </div>

                {formData.role === 'SUPER_ADMIN' ? (
                  <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', padding: '12px', borderRadius: '8px', color: '#92400E', fontSize: '0.85rem' }}>
                    ⚡ <strong>Super Admin Role Selected:</strong> Super Admins automatically have unrestricted access to all current and future admin pages.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {ADMIN_PAGES.map((page) => {
                      const isChecked = formData.permissions.includes(page.key);
                      return (
                        <label
                          key={page.key}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: isChecked ? '#EFF6FF' : '#FFFFFF',
                            border: isChecked ? '1px solid #3B82F6' : '1px solid #CBD5E1',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(page.key)}
                            style={{ marginTop: '3px', width: '16px', height: '16px' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: isChecked ? '#1E40AF' : '#1E293B' }}>
                              {page.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{page.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingUser ? 'Update Admin User' : 'Create Admin User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
