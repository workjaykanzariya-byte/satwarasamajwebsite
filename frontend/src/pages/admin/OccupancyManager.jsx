import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import VisualOccupancyGrid from '../../components/admin/VisualOccupancyGrid';
import { Building2, Search, Plus, Layers, BedDouble, RefreshCw, X, MapPin, Edit3 } from 'lucide-react';

export default function OccupancyManager() {
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState(1);
  const [floors, setFloors] = useState([]);
  const [unallocatedStudents, setUnallocatedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search "Where is student X"
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Dynamic Structure Forms
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditHostelModal, setShowEditHostelModal] = useState(false);

  const [newFloorName, setNewFloorName] = useState('');
  const [newFloorNum, setNewFloorNum] = useState('');

  const [selectedFloorIdForRoom, setSelectedFloorIdForRoom] = useState('');
  const [newRoomNum, setNewRoomNum] = useState('');
  const [newRoomType, setNewRoomType] = useState('DOUBLE');
  const [newBedCount, setNewBedCount] = useState(2);

  // Edit Hostel Form State
  const [editHostelForm, setEditHostelForm] = useState({
    id: '',
    name: '',
    wardenName: '',
    wardenContact: '',
    wardenEmail: '',
    totalCapacity: 0,
    city: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    fetchHostels();
    fetchUnallocatedStudents();
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      fetchVisualGrid(selectedHostelId);
    }
  }, [selectedHostelId]);

  const fetchHostels = async () => {
    try {
      const res = await api.get('/occupancy/summary');
      if (res.data.success) {
        setHostels(res.data.hostels);
        if (res.data.hostels.length > 0 && !selectedHostelId) {
          setSelectedHostelId(res.data.hostels[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch hostels summary error:', err);
    }
  };

  const fetchVisualGrid = async (hId) => {
    setLoading(true);
    try {
      const res = await api.get(`/occupancy/hostel/${hId}/visual-grid`);
      if (res.data.success) {
        setFloors(res.data.floors);
      }
    } catch (err) {
      console.error('Fetch visual grid error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnallocatedStudents = async () => {
    try {
      const res = await api.get('/students/unallocated');
      if (res.data.success) {
        setUnallocatedStudents(res.data.unallocated);
      }
    } catch (err) {
      console.error('Fetch unallocated students error:', err);
    }
  };

  // Where is student X search
  const handleStudentSearch = async (e) => {
    e.preventDefault();
    if (!searchStudentQuery) return;
    try {
      const res = await api.get(`/occupancy/search-location?query=${encodeURIComponent(searchStudentQuery)}`);
      if (res.data.success) {
        setSearchResult(res.data.results);
      }
    } catch (err) {
      console.error('Student location search error:', err);
    }
  };

  // Add Floor Submit
  const handleAddFloorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/occupancy/floors', {
        hostelId: selectedHostelId,
        name: newFloorName,
        floorNumber: newFloorNum,
      });

      if (res.data.success) {
        setShowAddFloorModal(false);
        setNewFloorName('');
        setNewFloorNum('');
        fetchVisualGrid(selectedHostelId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add floor.');
    }
  };

  // Add Room Submit (Auto creates Beds!)
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/occupancy/rooms', {
        hostelId: selectedHostelId,
        floorId: selectedFloorIdForRoom,
        roomNumber: newRoomNum,
        roomType: newRoomType,
        bedCount: newBedCount,
      });

      if (res.data.success) {
        setShowAddRoomModal(false);
        setNewRoomNum('');
        fetchVisualGrid(selectedHostelId);
        fetchHostels();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add room.');
    }
  };

  const handleOpenEditHostelModal = (h) => {
    if (!h) return;
    setEditHostelForm({
      id: h.id,
      name: h.name || '',
      wardenName: h.wardenName || '',
      wardenContact: h.wardenContact || '',
      wardenEmail: h.wardenEmail || '',
      totalCapacity: (h.totalCapacity !== undefined && h.totalCapacity !== null) ? h.totalCapacity : 0,
      city: h.city || '',
      address: h.address || '',
      description: h.description || '',
    });
    setShowEditHostelModal(true);
  };

  const handleSaveHostelDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/occupancy/hostels/${editHostelForm.id}`, editHostelForm);
      if (res.data.success) {
        alert('Hostel profile details updated successfully!');
        setShowEditHostelModal(false);
        fetchHostels();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update hostel details.');
    }
  };

  const activeHostel = hostels.find((h) => h.id === parseInt(selectedHostelId, 10));

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div>
          <span className="badge badge-vacant" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>⭐ Flagship Module</span>
          <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary-navy)' }}>
            Hostel & Bed Occupancy Manager
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Dynamic Floor → Room → Bed Occupancy Engine with interactive visual management grid.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {activeHostel && (
            <button className="btn btn-outline" onClick={() => handleOpenEditHostelModal(activeHostel)} style={{ borderColor: 'var(--primary-maroon)', color: 'var(--primary-maroon)', fontWeight: 'bold' }}>
              <Edit3 size={16} /> Edit Selected Hostel Profile
            </button>
          )}
          <button className="btn btn-outline" onClick={() => setShowAddFloorModal(true)}>
            <Layers size={16} /> Add Floor
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddRoomModal(true)}>
            <Plus size={16} /> Add Room & Auto-Generate Beds
          </button>
        </div>
      </div>

      {/* HOSTEL SELECTOR TABS & STAT STRIP */}
      <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {/* Hostel Select Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {hostels.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHostelId(h.id)}
                className={`btn ${selectedHostelId === h.id ? 'btn-primary' : 'btn-outline'}`}
              >
                🏢 {h.name}
              </button>
            ))}
          </div>

          {/* Quick Stats for Active Hostel */}
          {activeHostel && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
              <div>Total Beds: <strong>{activeHostel.totalCapacity}</strong></div>
              <div style={{ color: '#991b1b' }}>Occupied: <strong>{activeHostel.occupiedBeds}</strong></div>
              <div style={{ color: '#166534' }}>Vacant: <strong>🟢 {activeHostel.availableBeds}</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* "WHERE IS STUDENT X" SEARCH BAR */}
      <div className="card" style={{ padding: '20px', marginBottom: '30px', background: '#f8fafc' }}>
        <h4 style={{ color: 'var(--primary-navy)', fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={18} /> Quick Student Bed Location Lookup ("Where is Student X?")
        </h4>
        <form onSubmit={handleStudentSearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Student Name, Mobile Number, or Application Number..."
            value={searchStudentQuery}
            onChange={(e) => setSearchStudentQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Find Location</button>
        </form>

        {searchResult && searchResult.length > 0 && (
          <div style={{ marginTop: '16px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
            <h5 style={{ color: 'var(--primary-maroon)', marginBottom: '8px' }}>Search Results Found:</h5>
            {searchResult.map((res) => (
              <div key={res.id} style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <strong>{res.fullName}</strong> ({res.studentCode}) — App #{res.applicationNumber}
                </div>
                <div style={{ color: 'var(--primary-navy)', fontWeight: 700 }}>
                  📍 {res.hostelName} → {res.floorName} → Room {res.roomNumber} → <span style={{ color: 'var(--accent-gold)' }}>Bed {res.bedLabel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VISUAL OCCUPANCY GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading visual occupancy layout...</div>
      ) : (
        <VisualOccupancyGrid
          floors={floors}
          hostelId={selectedHostelId}
          onRefresh={() => {
            fetchVisualGrid(selectedHostelId);
            fetchHostels();
            fetchUnallocatedStudents();
          }}
          unallocatedStudents={unallocatedStudents}
        />
      )}

      {/* ADD FLOOR MODAL */}
      {showAddFloorModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <button className="modal-close" onClick={() => setShowAddFloorModal(false)}><X /></button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-navy)' }}>Add New Floor</h3>
            <form onSubmit={handleAddFloorSubmit}>
              <div className="form-group">
                <label className="form-label">Floor Name *</label>
                <input type="text" className="form-control" placeholder="e.g. 3rd Floor" value={newFloorName} onChange={(e) => setNewFloorName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Floor Number *</label>
                <input type="number" className="form-control" placeholder="e.g. 3" value={newFloorNum} onChange={(e) => setNewFloorNum(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Add Floor</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD ROOM MODAL (Auto generates Beds) */}
      {showAddRoomModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setShowAddRoomModal(false)}><X /></button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-navy)' }}>
              Add Room & Auto-Generate Beds
            </h3>
            <form onSubmit={handleAddRoomSubmit}>
              <div className="form-group">
                <label className="form-label">Select Floor *</label>
                <select className="form-control" value={selectedFloorIdForRoom} onChange={(e) => setSelectedFloorIdForRoom(e.target.value)} required>
                  <option value="">-- Choose Floor --</option>
                  {floors.map((fl) => (
                    <option key={fl.id} value={fl.id}>{fl.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Room Number / Name *</label>
                <input type="text" className="form-control" placeholder="e.g. 105" value={newRoomNum} onChange={(e) => setNewRoomNum(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Room Sharing Type</label>
                <select className="form-control" value={newRoomType} onChange={(e) => setNewRoomType(e.target.value)}>
                  <option value="SINGLE">Single Room (1 Bed)</option>
                  <option value="DOUBLE">Double Sharing (2 Beds)</option>
                  <option value="TRIPLE">Triple Sharing (3 Beds)</option>
                  <option value="DORMITORY">Dormitory (4+ Beds)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Beds to Auto-Generate *</label>
                <input type="number" className="form-control" min={1} max={10} value={newBedCount} onChange={(e) => setNewBedCount(e.target.value)} required />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  System will automatically create Bed A, Bed B... records under Room {newRoomNum || 'X'}
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Create Room & Generate Beds
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOSTEL DETAILS MODAL */}
      {showEditHostelModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="var(--primary-maroon)" /> Edit Hostel Profile & Warden Details
              </h3>
              <button onClick={() => setShowEditHostelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHostelDetails}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Hostel Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editHostelForm.name}
                  onChange={(e) => setEditHostelForm({ ...editHostelForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Warden Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rameshbhai Satvara"
                    value={editHostelForm.wardenName}
                    onChange={(e) => setEditHostelForm({ ...editHostelForm, wardenName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Warden Contact Phone *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. +91 98250 12345"
                    value={editHostelForm.wardenContact}
                    onChange={(e) => setEditHostelForm({ ...editHostelForm, wardenContact: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Warden Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="warden@satvaramahamandal.org"
                    value={editHostelForm.wardenEmail}
                    onChange={(e) => setEditHostelForm({ ...editHostelForm, wardenEmail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Total Capacity (Beds) *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={editHostelForm.totalCapacity}
                    onChange={(e) => setEditHostelForm({ ...editHostelForm, totalCapacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>City / Campus Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ahmedabad / Anand"
                  value={editHostelForm.city}
                  onChange={(e) => setEditHostelForm({ ...editHostelForm, city: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Full Hostel Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={editHostelForm.address}
                  onChange={(e) => setEditHostelForm({ ...editHostelForm, address: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Hostel Description / Overview</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={editHostelForm.description}
                  onChange={(e) => setEditHostelForm({ ...editHostelForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditHostelModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Hostel Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
