import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import MahaDanCreativeCard from '../../components/common/MahaDanCreativeCard';
import html2canvas from 'html2canvas';
import { Heart, Upload, ShieldCheck, Download, Share2, Award, CheckCircle, Sparkles, RefreshCw, User, Phone, Mail, QrCode, Search, AlertCircle, X, ExternalLink, Image as ImageIcon } from 'lucide-react';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/uploads')) {
    return `/api/v1${cleanPath}`;
  }
  return cleanPath;
};

export default function MahaDanPage() {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('donate'); // 'donate' or 'track'
  const [mahadanStatus, setMahadanStatus] = useState('OPEN');
  const [adminQrImage, setAdminQrImage] = useState(null); // Custom QR image from admin

  useEffect(() => {
    api.get('/cms/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setMahadanStatus(res.data.settings.mahadan_status || 'OPEN');
        setAdminQrImage(res.data.settings.mahadan_qr_image || null);
      }
    }).catch(() => {});
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    donorName: '',
    mobile: '',
    email: '',
    amount: '500',
    message: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  // QR Modal & Payment Proof State
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentScreenshotBase64, setPaymentScreenshotBase64] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Submitted / Tracked Donation State
  const [submittedDonation, setSubmittedDonation] = useState(null);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedDonation, setTrackedDonation] = useState(null);
  const [trackError, setTrackError] = useState('');

  const cardRef = useRef(null);
  const predefinedAmounts = [500, 1000, 1500, 2000, 2500, 5000];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountSelect = (amt) => {
    setFormData((prev) => ({ ...prev, amount: amt.toString() }));
  };

  // Client-side Canvas Image Compressor to prevent large payload errors
  const compressImageFile = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const rawBase64 = event.target.result;
        const img = new Image();
        img.src = rawBase64;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width || 800;
            let height = img.height || 800;

            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (err) {
            resolve(rawBase64);
          }
        };
        img.onerror = () => {
          resolve(rawBase64);
        };
      };
      reader.onerror = () => {
        resolve(null);
      };
    });
  };

  // Convert & Compress File to Base64
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 800, 800, 0.7);
      setPhotoBase64(compressed);
    } catch (err) {
      console.error('Failed to compress donor photo', err);
    }
  };

  const handleScreenshotSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 1200, 0.75);
      setPaymentScreenshotBase64(compressed);
    } catch (err) {
      console.error('Failed to compress screenshot', err);
    }
  };

  // Open QR Code Payment Modal
  const handleInitiatePayment = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.donorName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please select a valid donation amount.');
      return;
    }

    setShowQRModal(true);
  };

  // Submit QR Code Payment Proof
  const handleFinalSubmitPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!paymentScreenshotBase64) {
      setErrorMsg('Please upload your Payment Screenshot proof.');
      return;
    }

    setSubmittingPayment(true);

    try {
      const payload = {
        donorName: formData.donorName,
        mobile: formData.mobile || 'N/A',
        email: formData.email,
        amount: formData.amount,
        message: formData.message,
        donorPhoto: photoBase64,
        paymentScreenshot: paymentScreenshotBase64,
        transactionId: transactionId || `UTR-${Date.now()}`,
      };

      const res = await api.post('/mahadan/submit-qr-payment', payload);

      if (res.data.success) {
        setSubmittedDonation({
          certificateNo: res.data.certificateNo,
          donorName: formData.donorName,
          amount: parseFloat(formData.amount),
          photoPath: res.data.photoPath || photoBase64,
          verificationStatus: 'UNDER_VERIFICATION',
          createdAt: res.data.createdAt || new Date().toISOString(),
        });

        setShowQRModal(false);
        setTrackQuery(res.data.certificateNo);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment proof. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Track Donation Status & Certificate
  const handleTrackDonation = async (e) => {
    if (e) e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackingLoading(true);
    setTrackError('');
    setTrackedDonation(null);

    try {
      const res = await api.get(`/mahadan/track/${encodeURIComponent(trackQuery.trim())}`);
      if (res.data.success && res.data.donation) {
        setTrackedDonation(res.data.donation);
      }
    } catch (err) {
      setTrackError(err.response?.data?.message || 'No donation record found for this Reference ID or Mobile Number.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Download Creative Card as PNG image
  const downloadCreativeCard = () => {
    if (!cardRef.current) return;
    html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `Maha_Dan_Creative_Card_${trackedDonation.certificateNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Share on WhatsApp
  const shareWhatsApp = () => {
    if (!trackedDonation) return;
    const text = `🙏 *Samast Satwara Mahamandal - Ahmedabad* 🙏\n\nI, *${trackedDonation.donorName}*, have contributed a Maha Dan of *₹${trackedDonation.amount.toLocaleString()}* for Satwara Samaj Student Welfare.\n\nCertificate No: *${trackedDonation.certificateNo}*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (mahadanStatus === 'CLOSED') {
    return (
      <div style={{ background: '#fdfbf7', minHeight: '80vh', padding: '80px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '620px', width: '100%', textAlign: 'center', padding: '48px 32px', background: '#FFFFFF', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', borderTop: '6px solid #DC2626' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <Heart size={36} color="#DC2626" />
          </div>
          <h2 className="heading-serif" style={{ fontSize: '1.9rem', color: '#0F172A', fontWeight: 'bold', marginBottom: '14px' }}>
            Maha Dan Online Submissions Currently Closed
          </h2>
          <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '28px' }}>
            મહા દાન ઓનલાઇન પોર્ટલ હાલ પૂરતું બંધ રાખવામાં આવેલ છે. સમસ્ત સતવારા મહામંડળ સંસ્થાને પ્રોત્સાહન અને સાથ-સહકાર આપવા બદલ આપનો ખૂબ ખૂબ આભાર.
          </p>
          <a href="/" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fdfbf7', minHeight: '100vh', paddingBottom: '70px' }}>
      
      {/* Hero Banner Header */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%)', color: '#ffffff', padding: '56px 0', borderBottom: '4px solid #F59E0B', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.25)', color: '#FFD700', border: '1px solid #F59E0B', borderRadius: '30px', padding: '6px 20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '14px' }}>
            <Sparkles size={16} color="#FFD700" /> Samast Satwara Mahamandal Initiative
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', margin: '0 0 10px 0', fontWeight: 800, fontFamily: 'serif, sans-serif' }}>
            MAHA DAN PORTAL & HONOR CERTIFICATES
          </h1>
          <p style={{ maxWidth: '720px', margin: '0 auto', color: '#F8FAFC', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Contribute to Satwara student hostels, digital libraries, and merit scholarships with instant QR payment & personalized Honor Certificates.
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '36px' }}>

        {/* Navigation Tabs (Contribute Online vs Track Status) */}
        <div className="public-mahadan-tabs">
          <button
            className={`btn ${activeTab === 'donate' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('donate')}
            style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Heart fill={activeTab === 'donate' ? '#FFD700' : 'none'} size={18} /> Contribute Online (UPI QR)
          </button>
          
          <button
            className={`btn ${activeTab === 'track' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('track')}
            style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Search size={18} /> Track Status & Download Certificate
          </button>
        </div>

        {/* ================= TAB 1: DONATION FORM & QR PAYMENT ================= */}
        {activeTab === 'donate' && (
          <div>
            {submittedDonation ? (
              /* SUBMITTED SUCCESS CARD WITH CREATIVE PREVIEW */
              <div className="card" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', padding: '36px 24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', borderTop: '6px solid #d97706' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
                  <ShieldCheck size={38} />
                </div>
                <h2 style={{ fontSize: '1.8rem', color: '#0F172A', fontWeight: 'bold', marginBottom: '10px' }}>
                  Payment Proof Submitted Successfully!
                </h2>
                <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '18px' }}>
                  Thank you, <strong>{submittedDonation.donorName}</strong>. Your donation of <strong>₹{submittedDonation.amount.toLocaleString()}</strong> has been submitted. Our trust admins are verifying the transaction screenshot.
                </p>

                <div style={{ background: '#f8fafc', border: '2px dashed var(--primary-maroon)', padding: '10px 20px', borderRadius: '12px', marginBottom: '24px', display: 'inline-block' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Maha Dan Reference ID</div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-maroon)', letterSpacing: '1px' }}>
                    {submittedDonation.certificateNo}
                  </div>
                </div>

                {/* Render Creative Card Preview (with Verification Pending Watermark) */}
                <div style={{ marginBottom: '28px', textAlign: 'left' }}>
                  <MahaDanCreativeCard donation={submittedDonation} showActions={true} />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setActiveTab('track');
                      handleTrackDonation();
                    }}
                    className="btn btn-primary"
                  >
                    Track Verification Status
                  </button>
                  <button
                    onClick={() => {
                      setSubmittedDonation(null);
                      setFormData({ donorName: '', mobile: '', email: '', amount: '500', message: '' });
                      setPhotoBase64(null);
                      setPaymentScreenshotBase64(null);
                    }}
                    className="btn btn-outline"
                  >
                    Make Another Donation
                  </button>
                </div>
              </div>
            ) : (
              /* FORM GRID */
              <div className="public-mahadan-grid">
                {/* Left Column: Impact Story */}
                <div>
                  <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
                    <h3 className="heading-serif" style={{ color: 'var(--primary-maroon)', fontSize: '1.35rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Heart fill="var(--primary-maroon)" color="var(--primary-maroon)" size={22} /> Why Contribute Maha Dan?
                    </h3>
                    <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '0.93rem' }}>
                      Samast Satwara Mahamandal operates modern hostels and educational welfare programs for Satwara community boys and girls studying in Ahmedabad and Anand.
                    </p>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.88rem', color: '#1E293B' }}>
                        <CheckCircle size={18} color="var(--primary-maroon)" /> Hostel Facility & Digital Library Development
                      </li>
                      <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.88rem', color: '#1E293B' }}>
                        <CheckCircle size={18} color="var(--primary-maroon)" /> Merit Scholarships for Deserving Students
                      </li>
                      <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.88rem', color: '#1E293B' }}>
                        <CheckCircle size={18} color="var(--primary-maroon)" /> Hygienic Mess & Accommodation Support
                      </li>
                    </ul>
                  </div>

                  <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '14px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <ShieldCheck size={36} color="#B8860B" style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '0.95rem' }}>Instant QR Code Payment</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#B45309' }}>
                        Scan Trust UPI QR code via GPay / PhonePe / Paytm, upload payment screenshot, and get your verified Honor Certificate.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Donation Form */}
                <div className="card" style={{ padding: '32px' }}>
                  <h3 className="heading-serif" style={{ color: 'var(--primary-maroon)', fontSize: '1.35rem', marginTop: 0, marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #F1F5F9' }}>
                    Select Donation Amount or Enter Custom
                  </h3>

                  {errorMsg && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '18px' }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleInitiatePayment}>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '10px' }}>
                        Select Donation Amount (₹)
                      </label>
                      <div className="public-mahadan-amount-grid">
                        {predefinedAmounts.map((amt) => {
                          const isSelected = formData.amount === amt.toString();
                          return (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handleAmountSelect(amt)}
                              style={{
                                padding: '12px',
                                borderRadius: '10px',
                                border: isSelected ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                                background: isSelected ? 'linear-gradient(135deg, #0F172A, #1E293B)' : '#F8FAFC',
                                color: isSelected ? '#FFD700' : '#1E293B',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer',
                              }}
                            >
                              ₹ {amt.toLocaleString()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="donorName"
                        required
                        placeholder="e.g. Ramesh Bhai Satvara"
                        value={formData.donorName}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="public-mahadan-input-grid">
                      <div className="form-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Mobile Number</label>
                        <input
                          type="tel"
                          name="mobile"
                          placeholder="e.g. 9876543210"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="e.g. donor@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    {/* Photo Upload for Certificate */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>
                        Upload Donor Photo (for Honor Certificate Card)
                      </label>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#F1F5F9', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {photoBase64 ? (
                            <img src={photoBase64} alt="Donor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={24} color="#94A3B8" />
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={handlePhotoSelect} className="form-control" style={{ fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '1.05rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '10px',
                      }}
                    >
                      <QrCode size={20} /> Proceed to Scan QR Code & Pay (₹ {parseFloat(formData.amount).toLocaleString()})
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: TRACK STATUS & CERTIFICATE ================= */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '30px', marginBottom: '30px', textAlign: 'center' }}>
              <h2 className="heading-serif" style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '12px' }}>
                Track Maha Dan Verification Status & Certificate
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Enter your <strong>Maha Dan Reference ID</strong> (e.g. <code>MD-2026-8819</code>) or your registered <strong>Mobile Number</strong>.
              </p>

              <form onSubmit={handleTrackDonation} style={{ display: 'flex', gap: '12px', maxWidth: '540px', margin: '0 auto' }}>
                <input
                  type="text"
                  placeholder="Enter Reference ID or Mobile Number..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '1rem', padding: '12px 16px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={trackingLoading} style={{ padding: '0 24px', whiteSpace: 'nowrap' }}>
                  {trackingLoading ? 'Searching...' : 'Track Status'}
                </button>
              </form>

              {trackError && (
                <div style={{ marginTop: '18px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px', borderRadius: '8px', fontSize: '0.88rem' }}>
                  ⚠️ {trackError}
                </div>
              )}
            </div>

            {/* TRACKED RESULT VIEW */}
            {trackedDonation && (
              <div>
                {/* 1. UNDER VERIFICATION BANNER + CREATIVE CARD PREVIEW */}
                {trackedDonation.verificationStatus === 'UNDER_VERIFICATION' && (
                  <div>
                    <div className="card" style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '24px', textAlign: 'center', borderRadius: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                        <RefreshCw size={28} className="spin-slow" />
                      </div>
                      <h3 style={{ fontSize: '1.4rem', color: '#B45309', fontWeight: 'bold', marginBottom: '8px' }}>
                        Status: Under Verification by Trust Admin
                      </h3>
                      <p style={{ color: '#92400E', fontSize: '0.92rem', maxWidth: '580px', margin: '0 auto 16px auto' }}>
                        We have received your payment screenshot for donation of <strong>₹{trackedDonation.amount.toLocaleString()}</strong>. Trust admins are verifying your transaction UTR (<code>{trackedDonation.transactionId}</code>).
                      </p>
                      <span className="badge badge-reserved" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        Reference ID: {trackedDonation.certificateNo}
                      </span>
                    </div>

                    {/* Creative Card Preview with Pending Watermark */}
                    <MahaDanCreativeCard donation={trackedDonation} showActions={true} />
                  </div>
                )}

                {/* 2. REJECTED BANNER */}
                {trackedDonation.verificationStatus === 'REJECTED' && (
                  <div className="card" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '24px', textAlign: 'center', borderRadius: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                      <AlertCircle size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', color: '#991B1B', fontWeight: 'bold', marginBottom: '8px' }}>
                      Status: Payment Screenshot Rejected
                    </h3>
                    <p style={{ color: '#7F1D1D', fontSize: '0.92rem', maxWidth: '580px', margin: '0 auto 16px auto' }}>
                      Reason: <strong>{trackedDonation.rejectionReason || 'Uploaded screenshot could not be matched with trust bank accounts.'}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#991B1B' }}>
                      Please contact trust office at +91 7043704446 for assistance.
                    </p>
                  </div>
                )}

                {/* 3. APPROVED — RENDER CREATIVE CARD */}
                {(trackedDonation.verificationStatus === 'APPROVED' || trackedDonation.paymentStatus === 'SUCCESS') && (
                  <div>
                    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#15803D', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <CheckCircle size={24} /> Payment Verified — Honor Certificate Issued!
                      </div>
                    </div>

                    {/* Shared Expert Creative Card Canvas */}
                    <MahaDanCreativeCard donation={trackedDonation} showActions={true} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ================= MODAL: UPI QR CODE PAYMENT & SCREENSHOT UPLOAD ================= */}
      {showQRModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode color="var(--primary-maroon)" size={24} /> Scan UPI QR Code & Pay
              </h3>
              <button onClick={() => setShowQRModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Donor: <strong>{formData.donorName}</strong></div>
              <div style={{ fontSize: '1.6rem', color: 'var(--primary-maroon)', fontWeight: 800, margin: '4px 0' }}>
                Payable Amount: ₹ {parseFloat(formData.amount).toLocaleString()}
              </div>

              {/* QR CODE CONTAINER — Admin uploaded image OR auto-generated UPI QR */}
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '3px solid #F59E0B', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', margin: '14px 0' }}>
                {adminQrImage ? (
                  <>
                    <img
                      src={getImageUrl(adminQrImage)}
                      alt="Trust UPI QR Code"
                      style={{ width: '200px', height: '200px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--primary-navy)', textAlign: 'center' }}>
                      Scan to Pay — Trust Official QR
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=satvara.mahamandal@upi&pn=Shree%20Satvara%20Maha%20Mandal&am=${formData.amount}&cu=INR`)}`}
                      alt="UPI QR Code"
                      style={{ width: '200px', height: '200px', display: 'block', margin: '0 auto' }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--primary-navy)' }}>
                      UPI VPA: <span style={{ color: 'var(--primary-maroon)', fontFamily: 'monospace' }}>satvara.mahamandal@upi</span>
                    </div>
                  </>
                )}
              </div>

              <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                Scan using Google Pay, PhonePe, Paytm, or BHIM app. After completing the payment, upload your payment screenshot below.
              </p>
            </div>

            <form onSubmit={handleFinalSubmitPayment}>
              {/* UPLOAD SCREENSHOT */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} /> Upload Payment Screenshot Proof *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotSelect}
                  className="form-control"
                  required
                />
                {paymentScreenshotBase64 && (
                  <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'green', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Screenshot Uploaded Successfully
                  </div>
                )}
              </div>

              {errorMsg && (
                <div style={{ marginBottom: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowQRModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingPayment} style={{ flex: 1 }}>
                  {submittingPayment ? 'Submitting Proof...' : 'Submit Payment Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
