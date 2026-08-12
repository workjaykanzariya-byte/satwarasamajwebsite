import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Activity } from 'lucide-react';

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/audit').then((res) => {
      if (res.data.success) setLogs(res.data.logs);
    });
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
          Administrative Audit Trail Logs
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete accountability log of all admin operations.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin Name</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                  <td><strong>{log.adminName || 'System'}</strong></td>
                  <td><span className="badge badge-primary">{log.action}</span></td>
                  <td>{log.entity} #{log.entityId || ''}</td>
                  <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                  <td><code>{log.ipAddress || '127.0.0.1'}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
