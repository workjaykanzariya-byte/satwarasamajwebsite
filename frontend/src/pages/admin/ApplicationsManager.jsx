import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Eye, CheckCircle, XCircle, FileText, Download, X } from 'lucide-react';

export default function ApplicationsManager() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hostelTypeFilter, setHostelTypeFilter] = useState('');

  // Selected Application Detail View Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter, hostelTypeFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications', {
        params: {
          search: searchTerm,
          status: statusFilter,
          hostelType: hostelTypeFilter,
        },
      });
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Fetch applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        alert(`Application status updated to ${newStatus}`);
        fetchApplications();
        if (selectedApp) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleVerifyDocument = async (docId, verificationStatus) => {
    const rejectionReason = verificationStatus === 'REJECTED' ? prompt('Enter reason for document rejection:') : null;
    try {
      const res = await api.put(`/applications/documents/${docId}/verify`, {
        verificationStatus,
        rejectionReason,
      });

      if (res.data.success) {
        alert(`Document status updated to ${verificationStatus}`);
        // Refresh selected app details
        const appRes = await api.get(`/applications/${selectedApp.id}`);
        if (appRes.data.success) setSelectedApp(appRes.data.application);
      }
    } catch (err) {
      alert('Failed to update document status.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
            Applications Management Desk
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Review submitted student applications and verify documents.</p>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '300px' }}
          placeholder="Search by Name, Mobile, App No..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select className="form-control" style={{ maxWidth: '200px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="SELECTED">SELECTED</option>
          <option value="HOSTEL_ALLOTTED">HOSTEL_ALLOTTED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <select className="form-control" style={{ maxWidth: '180px' }} value={hostelTypeFilter} onChange={(e) => setHostelTypeFilter(e.target.value)}>
          <option value="">All Hostels</option>
          <option value="BOYS">Boys Hostel</option>
          <option value="GIRLS">Girls Hostel</option>
        </select>
      </div>

      {/* APPLICATIONS TABLE */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>App No</th>
                <th>Applicant Name</th>
                <th>Hostel Type</th>
                <th>Mobile</th>
                <th>Course</th>
                <th>Last Exam %</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td><strong>{app.applicationNumber}</strong></td>
                  <td>{app.applicantDetails?.firstName} {app.applicantDetails?.lastName}</td>
                  <td><span className={`badge ${app.hostelType === 'BOYS' ? 'badge-primary' : 'badge-reserved'}`}>{app.hostelType}</span></td>
                  <td>{app.applicantDetails?.mobile}</td>
                  <td>{app.academicDetails?.courseName}</td>
                  <td><strong>{app.academicDetails?.lastExamPercentage}%</strong></td>
                  <td>
                    <span className="badge badge-vacant">{app.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => setSelectedApp(app)}>
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICATION DETAIL VIEW MODAL */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedApp(null)}><X /></button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>
                  Application #{selectedApp.applicationNumber}
                </h3>
                <span className="badge badge-vacant">Status: {selectedApp.status}</span>
              </div>

              {/* Status State Machine Switcher */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Change Status:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                  value={selectedApp.status}
                  onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                  disabled={updatingStatus}
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="CORRECTION_REQUESTED">CORRECTION_REQUESTED</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="HOSTEL_ALLOTTED">HOSTEL_ALLOTTED</option>
                  <option value="JOINED">JOINED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            {/* Applicant Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ color: 'var(--primary-navy)', marginBottom: '8px' }}>Personal Info</h4>
                <div><strong>Full Name:</strong> {selectedApp.applicantDetails?.firstName} {selectedApp.applicantDetails?.middleName} {selectedApp.applicantDetails?.lastName}</div>
                <div><strong>DOB:</strong> {new Date(selectedApp.applicantDetails?.dob).toLocaleDateString('en-IN')}</div>
                <div><strong>Mobile:</strong> {selectedApp.applicantDetails?.mobile}</div>
                <div><strong>Address:</strong> {selectedApp.applicantDetails?.permanentAddress}, {selectedApp.applicantDetails?.city}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ color: 'var(--primary-navy)', marginBottom: '8px' }}>Academic Info</h4>
                <div><strong>Course:</strong> {selectedApp.academicDetails?.courseName}</div>
                <div><strong>College:</strong> {selectedApp.academicDetails?.collegeName}</div>
                <div><strong>SSC %:</strong> {selectedApp.academicDetails?.sscPercentage}% | <strong>HSC %:</strong> {selectedApp.academicDetails?.hscPercentage}%</div>
                <div><strong>Last Exam %:</strong> <strong style={{ color: 'var(--primary-maroon)' }}>{selectedApp.academicDetails?.lastExamPercentage}%</strong></div>
              </div>
            </div>

            {/* Documents Verification Section */}
            <h4 style={{ color: 'var(--primary-navy)', marginBottom: '12px' }}>Submitted Documents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedApp.documents?.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong>{doc.docType}:</strong> {doc.fileName}
                    <span className={`badge ${doc.verificationStatus === 'VERIFIED' ? 'badge-vacant' : doc.verificationStatus === 'REJECTED' ? 'badge-occupied' : 'badge-reserved'}`} style={{ marginLeft: '10px' }}>
                      {doc.verificationStatus}
                    </span>
                    {doc.rejectionReason && <span style={{ color: '#991b1b', fontSize: '0.8rem', marginLeft: '8px' }}>({doc.rejectionReason})</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/api/v1/applications/documents/${doc.id}/file`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                      <FileText size={14} /> View File
                    </a>
                    <button className="btn btn-sm btn-primary" style={{ background: '#166534' }} onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}>
                      Verify
                    </button>
                    <button className="btn btn-sm btn-primary" style={{ background: '#dc2626' }} onClick={() => handleVerifyDocument(doc.id, 'REJECTED')}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
