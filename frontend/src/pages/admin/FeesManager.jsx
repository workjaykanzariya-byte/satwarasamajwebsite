import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { DollarSign, Printer, Plus } from 'lucide-react';

export default function FeesManager() {
  const [payments, setPayments] = useState([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [amount, setAmount] = useState('2000');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [paymentType, setPaymentType] = useState('ADMISSION_FEE');
  const [studentId, setStudentId] = useState('1');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/fees/payments');
      if (res.data.success) setPayments(res.data.payments);
    } catch (err) {
      console.error('Fetch fee payments error:', err);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/payments', {
        studentId,
        amount,
        paymentMode,
        paymentType,
      });

      if (res.data.success) {
        alert(`Payment recorded! Receipt No: ${res.data.payment.receiptNo}`);
        setShowAddPaymentModal(false);
        fetchPayments();
      }
    } catch (err) {
      alert('Failed to record fee payment.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)' }}>
            Fee Receipts & Collection Ledger
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Record offline fee payments and issue receipts.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddPaymentModal(true)}>
          <Plus size={16} /> Record Offline Fee Payment
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Payment Date</th>
                <th>Student Code</th>
                <th>Type</th>
                <th>Amount (₹)</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.receiptNo}</strong></td>
                  <td>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td>{p.student?.studentCode || 'N/A'}</td>
                  <td>{p.paymentType}</td>
                  <td><strong style={{ color: '#166534' }}>₹{p.amount}</strong></td>
                  <td><span className="badge badge-primary">{p.paymentMode}</span></td>
                  <td><span className="badge badge-vacant">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary-navy)' }}>Record Fee Payment</h3>
            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label className="form-label">Payment Amount (₹) *</label>
                <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Type</label>
                <select className="form-control" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                  <option value="ADMISSION_FEE">ADMISSION_FEE</option>
                  <option value="MONTHLY_FEE">MONTHLY_FEE</option>
                  <option value="SECURITY_DEPOSIT">SECURITY_DEPOSIT</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select className="form-control" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="CASH">CASH</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="UPI_OFFLINE">UPI_OFFLINE</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Generate Receipt & Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
