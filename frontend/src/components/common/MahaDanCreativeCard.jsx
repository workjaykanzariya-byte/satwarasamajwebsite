import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Clock } from 'lucide-react';
import api from '../../services/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/uploads')) {
    return `/api/v1${cleanPath}`;
  }
  return cleanPath;
};

export default function MahaDanCreativeCard({ donation, showActions = true }) {
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [adminQrImage, setAdminQrImage] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        if (containerWidth > 0 && containerWidth < 660) {
          setScale(containerWidth / 660);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    api.get('/cms/settings')
      .then((res) => {
        if (res.data.success && res.data.settings && res.data.settings.mahadan_qr_image) {
          setAdminQrImage(res.data.settings.mahadan_qr_image);
        }
      })
      .catch(() => {});
  }, []);

  if (!donation) return null;

  const isPending = donation.verificationStatus === 'UNDER_VERIFICATION' || donation.isPending;

  const [downloading, setDownloading] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);

    // Create an off-screen container at 1:1 scale (660px x 660px) attached to document.body
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '660px';
    tempContainer.style.height = '660px';
    tempContainer.style.transform = 'none';
    tempContainer.style.zIndex = '-99999';
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.background = '#FAF8F5';

    // Clone the exact card element
    const clone = cardRef.current.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.width = '660px';
    clone.style.height = '660px';
    clone.style.position = 'relative';

    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    try {
      // Ensure all images in clone are fully loaded before capturing
      const images = Array.from(clone.querySelectorAll('img'));
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Render canvas from unscaled off-screen clone with desktop window bounds
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF8F5',
        foreignObjectRendering: false,
        logging: false,
        width: 660,
        height: 660,
        windowWidth: 1200,
        windowHeight: 1200,
        scrollX: 0,
        scrollY: 0,
      });

      const link = document.createElement('a');
      const filenamePrefix = isPending ? 'Maha_Dan_Preview_Card' : 'Maha_Dan_Official_Card';
      link.download = `${filenamePrefix}_${donation.certificateNo || 'Satvara'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Creative card download error:', err);
    } finally {
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      setDownloading(false);
    }
  };

  const shareWhatsApp = () => {
    const statusTxt = isPending ? '⏳ *Verification Pending (Official Card will be sent on WhatsApp after verification)*' : '✅ *Official Trust Verified*';
    const text = `🙏 *Samast Satwara Mahamandal - Ahmedabad* 🙏\n\nI, *${donation.donorName}*, have contributed a Maha Dan of *₹${donation.amount.toLocaleString()}* for Satwara Samaj Student Welfare.\n\nStatus: ${statusTxt}\nRef ID: *${donation.certificateNo}*\n\nWebsite: www.satwaramahamandal.org`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const photoUrl = getImageUrl(donation.photoPath);
  const formattedAmount = Number(donation.amount || 0).toLocaleString('en-IN');
  const formattedDate = new Date(donation.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div style={{ width: '100%', maxWidth: '660px', margin: '0 auto' }}>
      
      {/* Notice Banner for Pending Verification */}
      {isPending && (
        <div style={{
          background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
          border: '1.5px solid #FCD34D',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '18px',
          color: '#92400E',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Clock size={22} color="#D97706" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#B45309', fontSize: '0.92rem' }}>⏳ Preview Card (Verification Pending):</strong>
            <div style={{ marginTop: '2px', color: '#78350F', lineHeight: '1.4' }}>
              તમારો પેમેન્ટ ફોટો અપલોડ થઈ ગયો છે. એડમિન ચકાસણી પછી સત્તાવાર વેરિફાઇડ કાર્ડ તમારા WhatsApp નંબર પર મોકલવામાં આવશે.
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons (Download PNG / Share WhatsApp) */}
      {showActions && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={downloadCard}
            disabled={downloading}
            className="btn btn-primary"
            style={{
              background: isPending ? 'linear-gradient(135deg, #D97706, #B45309)' : 'linear-gradient(135deg, #EA580C, #D97706)',
              color: '#FFFFFF',
              fontWeight: 'bold',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
              cursor: downloading ? 'wait' : 'pointer',
              opacity: downloading ? 0.8 : 1,
            }}
          >
            <Download size={18} /> {downloading ? 'Preparing Creative Download...' : (isPending ? 'Download Preview Creative (PNG)' : 'Download Creative Image (PNG)')}
          </button>

          <button
            onClick={shareWhatsApp}
            className="btn"
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              fontWeight: 'bold',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
              cursor: 'pointer',
            }}
          >
            <Share2 size={18} /> Share on WhatsApp
          </button>
        </div>
      )}

      {/* 
        ============================================================
        EXACT REFERENCE CREATIVE POSTER CANVAS (660px x 660px)
        ============================================================
      */}
      <div ref={containerRef} style={{ width: '100%', maxWidth: '660px', margin: '0 auto' }}>
        <div
          style={{
            width: '660px',
            height: '660px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            marginBottom: scale < 1 ? `${(scale - 1) * 660}px` : '0px',
          }}
        >
          <div
            ref={cardRef}
            id="maha-dan-exact-card"
            style={{
              width: '660px',
              height: '660px',
              margin: '0 auto',
              background: '#FAF8F5',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              boxSizing: 'border-box',
              padding: '24px 28px',
              color: '#0F172A',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            }}
          >
        {/* ================= WATERMARK BANNER FOR VERIFICATION PENDING ================= */}
        {isPending && (
          <div
            style={{
              position: 'absolute',
              top: '52%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-25deg)',
              width: '135%',
              textAlign: 'center',
              background: 'rgba(217, 119, 6, 0.92)',
              color: '#FFFFFF',
              padding: '12px 0',
              fontSize: '1.2rem',
              fontWeight: '900',
              letterSpacing: '2px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              zIndex: 30,
              pointerEvents: 'none',
              textTransform: 'uppercase',
              borderTop: '3px dashed #FEF3C7',
              borderBottom: '3px dashed #FEF3C7',
            }}
          >
            <div>⏳ VERIFICATION PENDING • ચકાસણી પેન્ડિંગ છે</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', marginTop: '2px', color: '#FEF3C7', textTransform: 'none' }}>
              Official Card will be sent on WhatsApp after admin verification
            </div>
          </div>
        )}

        {/* ================= OUTER LUXURY BORDER FRAME ================= */}
        {/* Dark Navy Corner Triangular Accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '55px 55px 0 0', borderColor: '#0F172A transparent transparent transparent', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 55px 55px 0', borderColor: 'transparent #0F172A transparent transparent', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '55px 0 0 55px', borderColor: 'transparent transparent transparent #0F172A', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 0 55px 55px', borderColor: 'transparent transparent #0F172A transparent', zIndex: 1 }} />

        {/* Double Gold & Navy Border Lines */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: '3.5px solid #C29B38', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1.5px solid #0F172A', pointerEvents: 'none', zIndex: 2 }} />

        {/* ================= MAIN INNER CONTENT LAYOUT ================= */}
        <div style={{ position: 'relative', zIndex: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <div>
            {/* Header Section: TRUST LOGO + TITLES */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>
              
              {/* Trust Logo with Circular Border */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: '#FFFFFF', padding: '3px', border: '3px solid #0F172A', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <img
                    src="/logo.png"
                    alt="Satwara Mandal Logo"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0F172A', marginTop: '3px', whiteSpace: 'nowrap' }}>
                  સાચ... સેવા... સંગઠન...
                </div>
              </div>

              {/* Vertical Separator */}
              <div style={{ width: '2px', height: '54px', background: '#0F172A', opacity: 0.8 }} />

              {/* Title Text (English & Gujarati) */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'sans-serif', lineHeight: '1.3' }}>
                  SAMAST SATWARA MAHAMANDAL
                </h3>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0', lineHeight: '1.3' }}>
                  શ્રી સમસ્ત સતવારા મહામંડળ
                </h2>
              </div>
            </div>

            {/* Sub-Header Headline Banner */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <h1 style={{ fontSize: '3.1rem', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: '1.2', letterSpacing: '-0.5px', fontFamily: 'serif, sans-serif' }}>
                Donation is Love
              </h1>
              <p style={{ margin: '8px 0 0 0', fontSize: '1.02rem', color: '#0F172A', fontWeight: 800, lineHeight: '1.4' }}>
                મહા દાન એ પ્રેમ, સામાજિક કલ્યાણ અને શિક્ષણનું પવિત્ર અનુદાન છે.
              </p>
            </div>
          </div>

          {/* Middle Section Grid: Hero Donor Photo + 35 Years Emblem + Details */}
          <div className="exact-card-grid-middle" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'center', margin: '8px 0' }}>
            
            {/* Left Column: Hero Circular Donor Photo with Gold/Navy concentric rings + Ribbon */}
            <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>

              {/* Concentric Ring Outer Navy */}
              <div style={{ position: 'absolute', top: '-8px', left: '-8px', right: '-8px', bottom: '-8px', borderRadius: '50%', background: '#0F172A' }} />

              {/* Concentric Ring Middle Gold */}
              <div style={{ position: 'absolute', top: '-4px', left: '-4px', right: '-4px', bottom: '-4px', borderRadius: '50%', background: '#C29B38' }} />

              {/* Concentric Ring Inner Navy */}
              <div style={{ position: 'absolute', top: '2px', left: '2px', right: '2px', bottom: '2px', borderRadius: '50%', background: '#0F172A' }} />

              {/* Inner Photo Container */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px', left: '8px', right: '8px', bottom: '8px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={donation.donorName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: photoUrl ? 'none' : 'flex',
                    width: '100%',
                    height: '100%',
                    background: '#0F172A',
                    color: '#FFD700',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3.8rem',
                  }}
                >
                  👤
                </div>
              </div>

              {/* Gold/Orange Curved Ribbon Banner at Bottom of Photo */}
              <div style={{
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                color: '#FFFFFF',
                padding: '6px 20px',
                borderRadius: '4px',
                fontSize: '0.84rem',
                fontWeight: 900,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                border: '2px solid #FFFFFF',
                letterSpacing: '1px',
                textAlign: 'center',
              }}>
                MAHA DAN DONOR
              </div>
            </div>

            {/* Right Column: 35 Years Emblem + Donor Details + Amount Box */}
            <div style={{ textAlign: 'center' }}>
              
              {/* 35 Years Gaurav Yatra Logo Emblem */}
              <img
                src="/35_years_logo.png"
                alt="35 Years Gaurav Yatra"
                style={{ height: '82px', width: 'auto', objectFit: 'contain', margin: '0 auto 6px auto', display: 'block', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0F172A', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: '1.3' }}>
                HONORING AND VALUED DONOR
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', margin: '6px 0 12px 0', lineHeight: '1.3', textTransform: 'capitalize' }}>
                {donation.donorName}
              </h2>

              {/* Dark Navy Amount Box */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                background: '#0F172A',
                border: '2px solid #EA580C',
                borderRadius: '14px',
                padding: '10px 18px',
                textAlign: 'center',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.25)',
                display: 'inline-block',
                minWidth: '260px',
                boxSizing: 'border-box',
              }}>
                <div style={{ position: 'relative', zIndex: 15, fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', lineHeight: '1.3' }}>
                  CONTRIBUTED MAHA DAN
                </div>
                <div style={{ position: 'relative', zIndex: 15, fontSize: '2.1rem', fontWeight: 900, color: '#FFD700', lineHeight: '1.3', display: 'block' }}>
                  ₹ {formattedAmount} /-
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Section: Solid Dark Navy Ribbon Footer */}
          <div
            className="exact-card-grid-bottom"
            style={{
              background: '#0F172A',
              borderRadius: '4px',
              padding: '8px 16px',
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.2fr 1fr',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              color: '#FFFFFF',
            }}
          >
            {/* Left Column: Ref ID & Date */}
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                Ref ID: {donation.certificateNo}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#CBD5E1', marginTop: '2px', fontWeight: 600 }}>
                Issued Date: {formattedDate}
              </div>
            </div>

            {/* Center Column: White QR Code (Same Live Payment QR) + Gujarati Scan Text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #334155', borderRight: '1px solid #334155', padding: '0 10px' }}>
              <div style={{ background: '#FFFFFF', padding: '2px', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', overflow: 'hidden' }}>
                <img
                  src={
                    adminQrImage
                      ? getImageUrl(adminQrImage)
                      : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=satvara.mahamandal@upi&pn=Shree%20Satwara%20Maha%20Mandal&am=${donation.amount}&cu=INR`)}`
                  }
                  alt="MahaDan Payment QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  crossOrigin="anonymous"
                />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25 }}>
                આપનું દાન નોંધાવવા માટે<br />QR કોડ સ્કેન કરો
              </div>
            </div>

            {/* Right Column: Website & Help Desk */}
            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#FFFFFF' }}>
                www.satwaramahamandal.org
              </div>
              <div style={{ fontSize: '0.74rem', color: '#CBD5E1', marginTop: '2px', fontWeight: 600 }}>
                Help Desk: +91 7043704446
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

</div>
  );
}
