import React, { useState } from 'react';
import api from '../../services/api';
import { UserCheck, LogOut, Wrench, Shield, CheckCircle, Search, AlertCircle, X, Building2, Plus, Layers, BedDouble } from 'lucide-react';

export default function VisualOccupancyGrid({ floors = [], hostelId, onRefresh, unallocatedStudents = [], onAddFloor, onAddRoom }) {
  const [selectedBed, setSelectedBed] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState(null);

  const handleBedClick = (bed, roomNumber, floorName) => {
    setSelectedBed({ ...bed, roomNumber, floorName });
    setAssignStudentId('');
    setSearchStudentTerm('');
    setRemarks('');
    setMessage(null);
  };

  const handleAssignStudent = async () => {
    if (!assignStudentId) return;
    setLoadingAction(true);
    setMessage(null);
    try {
      const res = await api.post('/occupancy/assign-student', {
        bedId: selectedBed.id,
        studentId: assignStudentId,
        remarks,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        setTimeout(() => {
          setSelectedBed(null);
          if (onRefresh) onRefresh();
        }, 1200);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to assign student.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVacateBed = async () => {
    if (!window.confirm(`Are you sure you want to vacate Bed ${selectedBed.bedLabel}?`)) return;
    setLoadingAction(true);
    setMessage(null);
    try {
      const res = await api.post('/occupancy/vacate-bed', { bedId: selectedBed.id });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        setTimeout(() => {
          setSelectedBed(null);
          if (onRefresh) onRefresh();
        }, 1200);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to vacate bed.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setLoadingAction(true);
    try {
      const res = await api.put(`/occupancy/beds/${selectedBed.id}/status`, { status: newStatus });
      if (res.data.success) {
        setMessage({ type: 'success', text: `Bed status updated to ${newStatus}` });
        setTimeout(() => {
          setSelectedBed(null);
          if (onRefresh) onRefresh();
        }, 1000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update bed status.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredUnallocated = unallocatedStudents.filter((st) => {
    const name = `${st.application?.applicantDetails?.firstName || ''} ${st.application?.applicantDetails?.lastName || ''}`.toLowerCase();
    const code = st.studentCode?.toLowerCase() || '';
    const term = searchStudentTerm.toLowerCase();
    return name.includes(term) || code.includes(term);
  });

  const handleDeleteFloor = async (floorId, floorName) => {
    if (!window.confirm(`Are you sure you want to delete floor '${floorName}'? All empty rooms on this floor will be deleted.`)) return;
    try {
      const res = await api.delete(`/occupancy/floors/${floorId}`);
      if (res.data.success) {
        alert(res.data.message);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete floor.');
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete Room '${roomNumber}' and its beds?`)) return;
    try {
      const res = await api.delete(`/occupancy/rooms/${roomId}`);
      if (res.data.success) {
        alert(res.data.message);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  return (
    <div className="occupancy-grid-container">
      {/* Legend Header */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', background: '#ffffff', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>Bed Status Legend:</span>
        <span className="badge badge-vacant">🟢 Vacant Bed</span>
        <span className="badge badge-occupied">🔴 Occupied Bed</span>
        <span className="badge badge-reserved">🟡 Reserved</span>
        <span className="badge badge-maintenance">⚪ Maintenance</span>
      </div>

      {/* Empty State when no floors exist */}
      {floors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', background: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#2563EB' }}>
            <Building2 size={40} />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>
            No Floors or Rooms Set Up for this Hostel Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Create floors (e.g. Ground Floor, 1st Floor) and add rooms to auto-generate beds and start managing student occupancy.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {onAddFloor && (
              <button className="btn btn-outline" onClick={onAddFloor}>
                <Layers size={16} /> Add First Floor
              </button>
            )}
            {onAddRoom && (
              <button className="btn btn-primary" onClick={onAddRoom}>
                <Plus size={16} /> Add Room & Generate Beds
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Floors Render */
        floors.map((floor) => (
        <div key={floor.id} className="floor-card">
          <div className="floor-header">
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                🏢 {floor.name} ({floor.buildingName})
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                Floor #{floor.floorNumber} — {floor.rooms.length} Rooms
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-maroon)' }}>
                Total Beds: {floor.rooms.reduce((acc, r) => acc + r.beds.length, 0)}
              </div>
              <button
                onClick={() => handleDeleteFloor(floor.id, floor.name)}
                style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 'bold' }}
                title="Delete Floor"
              >
                🗑️ Delete Floor
              </button>
            </div>
          </div>

          <div className="rooms-flex-grid">
            {floor.rooms.map((room) => (
              <div key={room.id} className="room-tile">
                <div className="room-tile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Room {room.roomNumber}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                      {room.roomType}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id, room.roomNumber); }}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem', padding: '0 2px' }}
                      title="Delete Room"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="beds-row">
                  {room.beds.map((bed) => (
                    <div
                      key={bed.id}
                      className={`bed-box ${bed.status.toLowerCase()}`}
                      onClick={() => handleBedClick(bed, room.roomNumber, floor.name)}
                      title={`Click to manage Bed ${bed.bedLabel}`}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{bed.bedLabel}</div>
                      <div style={{ fontSize: '0.72rem', marginTop: '2px', opacity: 0.9 }}>
                        {bed.status === 'OCCUPIED' ? (bed.assignedStudent ? bed.assignedStudent.fullName.split(' ')[0] : 'Occupied') : bed.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        ))
      )}

      {/* Bed Action Side Panel Modal */}
      {selectedBed && (
        <div className="modal-overlay" onClick={() => setSelectedBed(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBed(null)}><X /></button>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--primary-navy)' }}>
              🛏️ Manage Bed: <span style={{ color: 'var(--primary-maroon)' }}>{selectedBed.bedLabel}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {selectedBed.floorName} — Room {selectedBed.roomNumber}
            </p>

            {message && (
              <div className={`card`} style={{ padding: '12px', marginBottom: '16px', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                {message.text}
              </div>
            )}

            {/* OCCUPIED BED PANEL */}
            {selectedBed.status === 'OCCUPIED' && (
              <div>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--primary-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={18} style={{ color: '#166534' }} /> Assigned Student Details
                  </h4>
                  {selectedBed.assignedStudent ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem' }}>
                      <div><strong>Student Name:</strong> {selectedBed.assignedStudent.fullName}</div>
                      <div><strong>Student Code:</strong> {selectedBed.assignedStudent.studentCode}</div>
                      <div><strong>App Number:</strong> {selectedBed.assignedStudent.applicationNumber}</div>
                      <div><strong>Mobile:</strong> {selectedBed.assignedStudent.mobile}</div>
                      <div><strong>Course:</strong> {selectedBed.assignedStudent.course}</div>
                      <div><strong>City:</strong> {selectedBed.assignedStudent.city}</div>
                      <div><strong>Academic Result:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>{selectedBed.assignedStudent.result || 'Not updated'}</span></div>
                      <div><strong>Joining Date:</strong> {selectedBed.assignedStudent.joiningDate ? new Date(selectedBed.assignedStudent.joiningDate).toLocaleDateString() : 'N/A'}</div>
                      <div style={{ gridColumn: 'span 2', background: '#FEF3C7', padding: '6px 10px', borderRadius: '6px', color: '#92400E', fontWeight: 'bold' }}>
                        📅 Stay Expiring Date: {selectedBed.assignedStudent.expiringDate ? new Date(selectedBed.assignedStudent.expiringDate).toLocaleDateString() : 'Not Set'}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Student details assigned to this bed.</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" style={{ background: '#dc2626', width: '100%' }} onClick={handleVacateBed} disabled={loadingAction}>
                    <LogOut size={16} /> Vacate Bed & Checkout Student
                  </button>
                </div>
              </div>
            )}

            {/* VACANT BED PANEL */}
            {selectedBed.status === 'VACANT' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--primary-navy)' }}>
                  Assign Student to Bed {selectedBed.bedLabel}
                </h4>

                <div className="form-group">
                  <label className="form-label">Search Unallocated Student</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type student name or code..."
                      value={searchStudentTerm}
                      onChange={(e) => setSearchStudentTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Student</label>
                  <select
                    className="form-control"
                    value={assignStudentId}
                    onChange={(e) => setAssignStudentId(e.target.value)}
                  >
                    <option value="">-- Choose Student --</option>
                    {filteredUnallocated.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.studentCode} - {st.application?.applicantDetails?.firstName} {st.application?.applicantDetails?.lastName} ({st.application?.academicDetails?.courseName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks / Allotment Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Merit Rank #3 allotment"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                  onClick={handleAssignStudent}
                  disabled={!assignStudentId || loadingAction}
                >
                  <CheckCircle size={16} /> Confirm Allotment
                </button>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Other Bed Status Options:</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => handleStatusChange('RESERVED')}>Mark Reserved</button>
                    <button className="btn btn-sm btn-outline" onClick={() => handleStatusChange('MAINTENANCE')}>Mark Maintenance</button>
                  </div>
                </div>
              </div>
            )}

            {/* RESERVED / MAINTENANCE PANEL */}
            {['RESERVED', 'MAINTENANCE'].includes(selectedBed.status) && (
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Current status: <strong>{selectedBed.status}</strong></p>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleStatusChange('VACANT')} disabled={loadingAction}>
                  Mark Bed as Vacant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
