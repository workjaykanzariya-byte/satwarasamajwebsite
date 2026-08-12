import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Building2 } from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [hostels, setHostels] = useState([]);
  const [settings, setSettings] = useState({
    contact_phone: '+91 7043704446',
    contact_email: 'info@satvaramahamandal.org',
    office_address: 'Satwara Vidyarthi Bhavan, 13 Panchalnagar Society, Behind Devashya Hospital, Old Wadaj, Ahmedabad - 380013',
    office_hours: '10:00 AM – 6:00 PM (Mon-Sat)',
  });

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch site settings
    api.get('/cms/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    }).catch(() => {});

    // Fetch hostel summary
    api.get('/occupancy/summary').then((res) => {
      if (res.data.success) {
        setHostels(res.data.hostels || []);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/cms/enquiries', {
        enquiryType: 'GENERAL',
        ...formData,
      });

      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      alert('Failed to send enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '50px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-maroon)', marginBottom: '10px' }}>
          {t('contact_title')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('contact_sub')}</p>
      </div>

      {/* Central Office Card */}
      <div className="card" style={{ marginBottom: '36px', borderTop: '5px solid var(--accent-gold)', background: '#FFFFFF', padding: '28px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏢 Samast Satvara Maha Mandal Central Registered Office
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', fontSize: '0.92rem' }}>
          <div>
            <MapPin size={18} style={{ color: 'var(--accent-gold)', display: 'inline', marginRight: '6px' }} />
            <strong>Address:</strong> {settings.office_address}
          </div>
          <div>
            <Phone size={18} style={{ color: 'var(--accent-gold)', display: 'inline', marginRight: '6px' }} />
            <strong>Phone:</strong> {settings.contact_phone}
          </div>
          <div>
            <Mail size={18} style={{ color: 'var(--accent-gold)', display: 'inline', marginRight: '6px' }} />
            <strong>Email:</strong> {settings.contact_email}
          </div>
          <div>
            <Clock size={18} style={{ color: 'var(--accent-gold)', display: 'inline', marginRight: '6px' }} />
            <strong>Office Hours:</strong> {settings.office_hours}
          </div>
        </div>
      </div>

      {/* Dynamic Hostel Desk Cards */}
      <h2 className="heading-serif" style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '20px', textAlign: 'center' }}>
        Hostel Desk Contact Details
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {hostels.map((h) => (
          <div key={h.id} className="card card-hover" style={{ borderTop: `4px solid ${h.type === 'GIRLS' ? 'var(--primary-maroon)' : 'var(--primary-navy)'}` }}>
            <span className={`badge ${h.type === 'BOYS' ? 'badge-primary' : 'badge-reserved'}`} style={{ marginBottom: '12px' }}>
              {h.type} HOSTEL DESK
            </span>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '10px' }}>{h.name}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              <MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} /> {h.address}
            </p>
            <p style={{ fontSize: '0.88rem', marginBottom: '6px' }}>👤 <strong>Warden:</strong> {h.wardenName || 'Mandal Appointed Warden'}</p>
            <p style={{ fontSize: '0.88rem' }}>📞 <strong>Phone:</strong> {h.wardenContact || settings.contact_phone}</p>
          </div>
        ))}
      </div>

      {/* ENQUIRY FORM */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>Send Us an Online Enquiry</h3>

        {submitted ? (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto' }} />
            <h4>Thank You! Your message has been sent successfully.</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input type="tel" className="form-control" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" className="form-control" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Message *</label>
              <textarea className="form-control" rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
              <Send size={18} /> {loading ? 'Sending...' : 'Send Enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
