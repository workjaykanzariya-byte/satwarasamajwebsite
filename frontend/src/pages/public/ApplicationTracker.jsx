import React, { useState } from 'react';
import api from '../../services/api';
import { Search, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export default function ApplicationTracker() {
  const [appNo, setAppNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!appNo && !mobile) {
      setError('Please enter Application Number or Registered Mobile Number.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/applications/track', {
        applicationNumber: appNo,
        mobile: mobile,
      });

      if (res.data.success) {
        setResult(res.data.application);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No application found for provided details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '850px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary-maroon)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold' }}>
          LIVE TRACKING PORTAL
        </span>
        <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary-maroon)', marginTop: '8px', marginBottom: '8px' }}>
          Track Application Status
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Enter your Application Number (e.g. SAT-2026-1001) or registered Mobile Number.
        </p>
      </div>

      <div className="card" style={{ padding: '30px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleTrack}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Application Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. SAT-2026-1001"
                value={appNo}
                onChange={(e) => setAppNo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. 7043704446"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
            <Search size={18} /> {loading ? 'Searching Record...' : 'Track Application Status'}
          </button>
        </form>
      </div>

      {/* TRACKING RESULTS VIEW */}
      {result && (
        <div className="card" style={{ padding: '32px', border: '1px solid var(--border-light)', boxShadow: '0 15px 30px rgba(0,0,0,0.08)' }}>
          {/* Header Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>APPLICATION #{result.applicationNumber}</span>
              <h2 style={{ color: 'var(--primary-navy)', fontSize: '1.6rem', margin: '4px 0' }}>{result.applicantName}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                🎓 {result.course} — {result.college} ({result.city})
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-vacant" style={{ fontSize: '0.9rem', padding: '8px 18px', display: 'inline-block', marginBottom: '6px' }}>
                CURRENT STATUS: {result.status}
              </span>
              {result.submittedAt && (
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Submitted on {new Date(result.submittedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>MERIT RANK</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0F172A', marginTop: '2px' }}>
                {result.meritRank ? `#${result.meritRank}` : 'In Evaluation'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>FEE PAYMENT</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: result.feePaid ? '#166534' : '#991B1B', marginTop: '4px' }}>
                {result.feePaid ? '✅ PAID' : '⏳ PENDING'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>DOCUMENTS VERIFIED</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0F172A', marginTop: '4px' }}>
                {result.documentsCount} Files Attached
              </div>
            </div>
          </div>

          {/* Seat Allotment Banner */}
          {result.allocatedHostel ? (
            <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#ffffff', borderRadius: '12px', padding: '20px', marginBottom: '28px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)' }}>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎉 Hostel Seat Allotted Successfully!
              </h3>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.95 }}>
                <strong>Hostel:</strong> {result.allocatedHostel} | <strong>Room:</strong> Room {result.allocatedRoom} | <strong>Bed:</strong> Bed {result.allocatedBed}
              </p>
              {result.wardenContact && (
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#D1FAE5' }}>
                  📞 Warden Contact: {result.wardenContact}
                </p>
              )}
            </div>
          ) : (
            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px', padding: '14px 18px', marginBottom: '28px', color: '#92400E', fontSize: '0.9rem' }}>
              ℹ️ <strong>Hostel Seat Status:</strong> Your application is currently moving through verification and merit list evaluation. Seat allotment will appear here once finalized by the Mandal.
            </div>
          )}

          {/* Timeline Steps */}
          <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.15rem', marginBottom: '16px' }}>
            Admission Progress Flow
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.progressSteps.map((st, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: st.done ? '#F0FDF4' : '#F8FAFC',
                  border: `1px solid ${st.done ? '#86EFAC' : '#CBD5E1'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                {st.done ? (
                  <CheckCircle size={22} style={{ color: '#166534', flexShrink: 0 }} />
                ) : (
                  <Clock size={22} style={{ color: '#94A3B8', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: st.done ? 700 : 500, color: st.done ? '#166534' : '#475569', fontSize: '0.95rem' }}>
                    {st.title}
                  </div>
                  {st.date && (
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      Completed on {new Date(st.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {st.done && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#166534', background: '#DCFCE7', padding: '3px 10px', borderRadius: '12px' }}>
                    COMPLETED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
