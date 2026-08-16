import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, AlertTriangle, FileText, Calendar, Building2, MapPin } from 'lucide-react';

const DEFAULT_HOSTELS = [
  {
    id: 1,
    name: 'Shree Satwara Boys Hostel',
    type: 'BOYS',
    city: 'Ahmedabad',
    address: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad',
    description: 'Modern hostel facility for male Satwara students with Wi-Fi, mess, CCTV, and study library.',
  },
  {
    id: 2,
    name: 'Shree Satwara Kanya Chhatralaya (Girls Hostel)',
    type: 'GIRLS',
    city: 'Ahmedabad',
    address: 'Satwara Kanya Bhavan, Nr. Naranpura Bus Stop, Naranpura, Ahmedabad',
    description: 'Secure and peaceful hostel environment for female Satwara students with 24/7 security and home-style nutritious mess.',
  },
  {
    id: 3,
    name: 'Shree Satwara Hostel, Anand (V.V. Nagar)',
    type: 'BOYS',
    city: 'Anand / V.V. Nagar',
    address: 'Satwara Chhatralaya, Near Railway Station / Campus Area, Vallabh Vidyanagar, Anand - 388120',
    description: 'Modern hostel facility in Vallabh Vidyanagar (Anand) for Satwara students pursuing Higher Education, Engineering, and Pharmacy.',
  },
];

export default function AdmissionOverview() {
  const [settings, setSettings] = useState({
    admission_status: 'OPEN',
    admission_status_boys_ahmedabad: 'OPEN',
    admission_status_girls_ahmedabad: 'OPEN',
    admission_status_boys_anand: 'OPEN',
    admission_closed_notice_gu: '',
  });

  const [hostels, setHostels] = useState(DEFAULT_HOSTELS);

  useEffect(() => {
    api.get('/cms/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    }).catch(() => {});

    api.get('/occupancy/summary').then((res) => {
      if (res.data.success && res.data.hostels && res.data.hostels.length > 0) {
        setHostels(res.data.hostels);
      }
    }).catch(() => {});
  }, []);

  const getHostelAdmissionStatus = (hostel) => {
    if (settings.admission_status === 'CLOSED') return 'CLOSED';
    const name = (hostel.name || '').toLowerCase();
    if (name.includes('girls') || name.includes('kanya')) {
      return settings.admission_status_girls_ahmedabad || 'OPEN';
    }
    if (name.includes('anand') || name.includes('v.v. nagar')) {
      return settings.admission_status_boys_anand || 'OPEN';
    }
    return settings.admission_status_boys_ahmedabad || 'OPEN';
  };

  const isAllClosed = settings.admission_status === 'CLOSED' || (
    settings.admission_status_boys_ahmedabad === 'CLOSED' &&
    settings.admission_status_girls_ahmedabad === 'CLOSED' &&
    settings.admission_status_boys_anand === 'CLOSED'
  );

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', marginBottom: '10px' }}>
          <span className={`badge ${!isAllClosed ? 'badge-vacant' : 'badge-reserved'}`} style={{ fontSize: '0.95rem', padding: '6px 14px' }}>
            {!isAllClosed ? '🟢 Online Admission Portal Active (AY 2026-2027)' : '🔴 Admissions Currently Closed'}
          </span>
        </div>
        <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary-maroon)', marginBottom: '12px' }}>
          Hostel Admission Portal 2026-2027
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Transparent merit-based admissions for Samast Satwara Mahamandal Hostels in Ahmedabad & Anand (V.V. Nagar).</p>
      </div>

      {isAllClosed && (
        <div className="card" style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '20px', marginBottom: '36px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#991b1b', fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '8px' }}>
            <AlertTriangle size={22} /> Notice: Online Admission Form is Temporarily Closed
          </div>
          <p style={{ fontSize: '0.92rem', color: '#7f1d1d', margin: 0, lineHeight: 1.6 }}>
            {settings.admission_closed_notice_gu || 'શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭ માટે ઓનલાઇન છાત્રાલય પ્રવેશ પ્રક્રિયા પૂર્ણ થઈ ગયેલ છે અથવા હાલ પૂરતી બંધ રાખવામાં આવી છે.'}
          </p>
        </div>
      )}

      {/* Hostel Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        {hostels.map((h) => {
          const status = getHostelAdmissionStatus(h);
          const isOpen = status === 'OPEN';

          return (
            <div key={h.id} className="card card-hover" style={{ borderTop: `5px solid ${h.type === 'GIRLS' ? 'var(--primary-maroon)' : 'var(--primary-navy)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                  <span className={`badge ${h.type === 'BOYS' ? 'badge-primary' : 'badge-reserved'}`}>{h.type} HOSTEL</span>
                  <span className={`badge ${isOpen ? 'badge-vacant' : 'badge-reserved'}`}>
                    {isOpen ? '🟢 Admissions OPEN' : '🔴 Admissions CLOSED'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-navy)', marginBottom: '10px' }}>{h.name}</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{h.description}</p>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {h.address}
                </div>
              </div>
              
              {isOpen ? (
                <Link to={`/apply?hostel=${h.id}`} className={`btn ${h.type === 'GIRLS' ? 'btn-accent' : 'btn-primary'}`} style={{ width: '100%' }}>
                  Apply for {h.name}
                </Link>
              ) : (
                <button className="btn btn-outline" disabled style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}>
                  Admissions Closed for {h.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tracker & Merit Quick Links */}
      <div className="card" style={{ background: '#f8fafc', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '4px' }}>Already Submitted an Application?</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Track your real-time verification and bed allotment status using your Application Number.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admission/track" className="btn btn-primary">Track My Application</Link>
          <Link to="/admission/merit-list" className="btn btn-outline">View Published Merit Lists</Link>
        </div>
      </div>
    </div>
  );
}
