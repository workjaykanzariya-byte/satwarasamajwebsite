import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Building2, Users, FileText, Award, DollarSign, Activity, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const [hostelSummary, setHostelSummary] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [appStats, setAppStats] = useState({ total: 0, submitted: 0, selected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [hRes, logRes, appRes] = await Promise.all([
        api.get('/occupancy/summary'),
        api.get('/audit'),
        api.get('/applications?limit=100'),
      ]);

      if (hRes.data.success) setHostelSummary(hRes.data.hostels);
      if (logRes.data.success) setAuditLogs(logRes.data.logs.slice(0, 8));
      if (appRes.data.success) {
        const apps = appRes.data.applications;
        setAppStats({
          total: appRes.data.pagination.total,
          submitted: apps.filter((a) => a.status === 'SUBMITTED').length,
          selected: apps.filter((a) => ['SELECTED', 'HOSTEL_ALLOTTED', 'JOINED'].includes(a.status)).length,
        });
      }
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCapacity = hostelSummary.reduce((acc, h) => acc + h.totalCapacity, 0);
  const totalOccupied = hostelSummary.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const totalAvailable = hostelSummary.reduce((acc, h) => acc + h.availableBeds, 0);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
            Admin Dashboard Overview
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time stats from Hostel Occupancy Engine & Admission System</p>
        </div>

        <Link to="/admin/occupancy" className="btn btn-accent btn-lg">
          <Building2 size={20} /> Open Bed Occupancy Manager
        </Link>
      </div>

      {/* STAT CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-maroon)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Total Applications</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{appStats.total}</div>
          <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '4px' }}>{appStats.submitted} New / Under Review</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #166534' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Live Vacant Beds</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#166534' }}>{totalAvailable} Beds</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Out of {totalCapacity} Total Capacity</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #991b1b' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Occupied Beds</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#991b1b' }}>{totalOccupied} Beds</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0}% Occupancy Rate
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Selected Applicants</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{appStats.selected}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Merit Shortlisted</div>
        </div>
      </div>

      {/* HOSTELS VACANCY BREAKDOWN TABLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.25rem' }}>
              🏢 Hostel Capacity & Occupancy Breakdown
            </h3>
            <Link to="/admin/occupancy" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-maroon)' }}>
              Manage Beds →
            </Link>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Hostel Name</th>
                  <th>Type</th>
                  <th>Total Beds</th>
                  <th>Occupied</th>
                  <th>Available</th>
                  <th>Occupancy %</th>
                </tr>
              </thead>
              <tbody>
                {hostelSummary.map((h) => (
                  <tr key={h.id}>
                    <td><strong>{h.name}</strong></td>
                    <td><span className={`badge ${h.type === 'BOYS' ? 'badge-primary' : 'badge-reserved'}`}>{h.type}</span></td>
                    <td>{h.totalCapacity}</td>
                    <td><span style={{ color: '#991b1b', fontWeight: 700 }}>{h.occupiedBeds}</span></td>
                    <td><span style={{ color: '#166534', fontWeight: 700 }}>🟢 {h.availableBeds}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${h.occupancyRatePct}%`, height: '100%', background: 'var(--primary-maroon)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{h.occupancyRatePct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT AUDIT LOG FEED */}
        <div className="card">
          <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={18} /> Recent Administrative Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ fontSize: '0.82rem', padding: '10px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary-navy)' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{log.adminName} — {log.action}</div>
                <div style={{ color: 'var(--text-muted)' }}>{log.details}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
