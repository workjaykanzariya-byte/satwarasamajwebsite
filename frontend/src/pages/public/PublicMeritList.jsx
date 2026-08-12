import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Award, Search } from 'lucide-react';

export default function PublicMeritList() {
  const [meritLists, setMeritLists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/merit/public').then((res) => {
      if (res.data.success) setMeritLists(res.data.meritLists);
    });
  }, []);

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary-maroon)', marginBottom: '12px' }}>
          Published Merit Lists 2026-2027
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Official merit list rankings released by Shree Satwara Maha Mandal Admission Desk.</p>
      </div>

      <div className="form-group" style={{ maxWidth: '400px', margin: '0 auto 30px auto' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by Application No..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {meritLists.map((ml) => {
        const filteredEntries = ml.entries.filter((entry) => {
          const appNo = entry.application?.applicationNumber || '';
          return appNo.toLowerCase().includes(searchTerm.toLowerCase());
        });

        return (
          <div key={ml.id} className="card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>{ml.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Hostel Type: {ml.hostelType} | Academic Year: {ml.academicYear} | Published On: {new Date(ml.publishedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className="badge badge-vacant">Published Official List</span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank #</th>
                    <th>App Number</th>
                    <th>Applicant Name</th>
                    <th>City</th>
                    <th>Merit Marks %</th>
                    <th>Selection Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td><strong>#{entry.rank}</strong></td>
                      <td>{entry.application?.applicationNumber}</td>
                      <td>{entry.application?.applicantDetails?.firstName} {entry.application?.applicantDetails?.lastName}</td>
                      <td>{entry.application?.applicantDetails?.city}</td>
                      <td><strong>{entry.totalMarksPct}%</strong></td>
                      <td>
                        <span className={`badge ${entry.status === 'SELECTED' ? 'badge-vacant' : 'badge-reserved'}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
