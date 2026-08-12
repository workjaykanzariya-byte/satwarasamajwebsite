import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Wifi, ShieldCheck, Coffee, BookOpen, UserCheck, Phone, Mail, MapPin } from 'lucide-react';

export default function HostelDetail() {
  const { id } = useParams();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/occupancy/summary').then((res) => {
      if (res.data.success) {
        const found = res.data.hostels.find((h) => h.id === parseInt(id, 10));
        setHostel(found);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '80px 20px' }}>Loading hostel profile...</div>;
  if (!hostel) return <div className="container" style={{ padding: '80px 20px' }}>Hostel profile not found.</div>;

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-maroon))', color: '#ffffff', padding: '40px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="badge badge-vacant" style={{ fontSize: '0.9rem', padding: '6px 14px', marginBottom: '12px' }}>
              🟢 {hostel.availableBeds} Available Beds Right Now
            </span>
            <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: '#ffffff', marginTop: '10px' }}>
              {hostel.name}
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '8px' }}>
              <MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} /> {hostel.address}
            </p>
          </div>
          <Link to={`/apply?hostel=${hostel.id}`} className="btn btn-accent btn-lg">
            Apply For This Hostel
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column: Description, Facilities, Rules */}
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '12px' }}>Overview</h3>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.7 }}>{hostel.description}</p>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>Hostel Facilities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Wifi style={{ color: 'var(--accent-gold)' }} /> High-Speed Wi-Fi</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Coffee style={{ color: 'var(--accent-gold)' }} /> Nutritious Mess</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck style={{ color: 'var(--accent-gold)' }} /> 24/7 CCTV & Security</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen style={{ color: 'var(--accent-gold)' }} /> Peaceful Study Room</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '12px' }}>Rules & Guidelines</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: 1.8, fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              <li>Curfew timing is strictly 9:30 PM for all hostellers.</li>
              <li>Attendance mark-in is mandatory before night curfew.</li>
              <li>No external guests allowed inside residential room corridors.</li>
              <li>Ragging or alcohol consumption will lead to immediate expulsion.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Capacity Card & Fee Breakdown */}
        <div>
          <div className="card" style={{ marginBottom: '24px', borderTop: '4px solid var(--accent-gold)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>Live Occupancy Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Beds Capacity:</span>
                <strong>{hostel.totalCapacity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Occupied Beds:</span>
                <strong style={{ color: 'var(--status-occupied-text)' }}>{hostel.occupiedBeds}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vacant Beds:</span>
                <strong style={{ color: 'var(--status-vacant-text)' }}>{hostel.availableBeds}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Occupancy Rate:</span>
                <strong>{hostel.occupancyRatePct}%</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', marginBottom: '14px' }}>Warden Desk Contact</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '8px' }}>👤 <strong>{hostel.wardenName}</strong></p>
            <p style={{ fontSize: '0.88rem', marginBottom: '8px' }}>📞 {hostel.wardenContact}</p>
            <p style={{ fontSize: '0.88rem' }}>✉️ {hostel.wardenEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
