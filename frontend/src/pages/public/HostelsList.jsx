import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function HostelsList() {
  const [hostels, setHostels] = useState([]);

  useEffect(() => {
    api.get('/occupancy/summary').then((res) => {
      if (res.data.success) setHostels(res.data.hostels);
    });
  }, []);

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary-maroon)', marginBottom: '12px' }}>
          અમારા છાત્રાલયો (Our Student Hostels)
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore Boys and Girls hostels with real-time bed vacancy numbers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
        {hostels.map((h) => (
          <div key={h.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className={`badge ${h.type === 'BOYS' ? 'badge-primary' : 'badge-reserved'}`}>{h.type} HOSTEL</span>
                <span className="badge badge-vacant">🟢 {h.availableBeds} Live Beds Vacant</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '12px' }}>{h.name}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{h.description}</p>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', marginBottom: '20px' }}>
                <div>📍 <strong>Address:</strong> {h.address}</div>
                <div>👤 <strong>Warden:</strong> {h.wardenName} ({h.wardenContact})</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to={`/hostels/${h.id}`} className="btn btn-outline" style={{ flex: 1 }}>Full Details</Link>
              <Link to={`/apply?hostel=${h.id}`} className="btn btn-primary" style={{ flex: 1 }}>Apply Now</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
