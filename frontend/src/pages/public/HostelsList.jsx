import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DEFAULT_HOSTELS = [
  {
    id: 1,
    name: 'Shree Satwara Boys Hostel',
    type: 'BOYS',
    city: 'Ahmedabad',
    address: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad',
    wardenName: 'Rameshbhai Satvara',
    wardenContact: '+91 98250 12345',
    totalCapacity: 30,
    occupiedBeds: 1,
    availableBeds: 29,
    description: 'Modern hostel facility for male Satwara students with Wi-Fi, mess, CCTV, and study library.',
  },
  {
    id: 2,
    name: 'Shree Satwara Kanya Chhatralaya (Girls Hostel)',
    type: 'GIRLS',
    city: 'Ahmedabad',
    address: 'Satwara Kanya Bhavan, Nr. Naranpura Bus Stop, Naranpura, Ahmedabad',
    wardenName: 'Kanchanben Satvara',
    wardenContact: '+91 98250 67890',
    totalCapacity: 12,
    occupiedBeds: 0,
    availableBeds: 12,
    description: 'Secure and peaceful hostel environment for female Satwara students with 24/7 security and home-style nutritious mess.',
  },
  {
    id: 3,
    name: 'Shree Satwara Hostel, Anand (V.V. Nagar)',
    type: 'BOYS',
    city: 'Anand / V.V. Nagar',
    address: 'Satwara Chhatralaya, Near Railway Station / Campus Area, Vallabh Vidyanagar, Anand - 388120',
    wardenName: 'Pravinbhai Satvara',
    wardenContact: '+91 98790 54321',
    totalCapacity: 12,
    occupiedBeds: 0,
    availableBeds: 12,
    description: 'Modern hostel facility in Vallabh Vidyanagar (Anand) for Satwara students pursuing Higher Education, Engineering, and Pharmacy.',
  },
];

export default function HostelsList() {
  const [hostels, setHostels] = useState(DEFAULT_HOSTELS);

  useEffect(() => {
    api.get('/occupancy/summary').then((res) => {
      if (res.data.success && res.data.hostels && res.data.hostels.length > 0) {
        setHostels(res.data.hostels);
      }
    }).catch(() => {});
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
