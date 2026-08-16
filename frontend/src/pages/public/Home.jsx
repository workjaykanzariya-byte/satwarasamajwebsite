import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Building2, Award, Users, BookOpen, Calendar, CheckCircle2, ArrowRight, ShieldCheck, PhoneCall, Heart, Sparkles } from 'lucide-react';

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

export default function Home() {
  const { t, lang } = useLanguage();
  const [hostels, setHostels] = useState(DEFAULT_HOSTELS);
  const [news, setNews] = useState([]);
  const [mahadanStats, setMahadanStats] = useState({ totalAmount: 0, totalDonors: 0 });
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [hostelRes, newsRes, mahadanRes, settingsRes] = await Promise.all([
        api.get('/occupancy/summary').catch(() => null),
        api.get('/cms/news').catch(() => null),
        api.get('/mahadan/public-stats').catch(() => null),
        api.get('/cms/settings').catch(() => null),
      ]);

      if (hostelRes && hostelRes.data && hostelRes.data.success && hostelRes.data.hostels && hostelRes.data.hostels.length > 0) {
        setHostels(hostelRes.data.hostels);
      }
      if (newsRes && newsRes.data && newsRes.data.success) {
        setNews(newsRes.data.news.slice(0, 3));
      }
      if (mahadanRes && mahadanRes.data && mahadanRes.data.success && mahadanRes.data.stats) {
        setMahadanStats(mahadanRes.data.stats);
      }
      if (settingsRes && settingsRes.data && settingsRes.data.success && settingsRes.data.settings) {
        setSettings(settingsRes.data.settings);
      }
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="home-hero-section">
        <div className="container">
          <div style={{ maxWidth: '850px' }}>
            <div className="home-hero-badge">
              <ShieldCheck size={15} /> {settings.home_hero_badge || `Official Community Trust Portal | ${t('trust_reg')}`}
            </div>
            <h1 className="heading-serif home-hero-title">
              {settings.home_hero_title || t('hero_title')}
            </h1>
            <p className="home-hero-sub">
              {settings.home_hero_sub || t('hero_subtitle')}
            </p>

            <div className="home-hero-btn-group">
              <Link to="/apply" className="btn btn-accent btn-lg home-hero-btn-primary">
                {t('apply_now')} <ArrowRight size={18} />
              </Link>
              <div className="home-hero-btn-row">
                <Link to="/hostels" className="btn btn-outline btn-lg home-hero-btn-secondary" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
                  {t('check_vacancy')}
                </Link>
                <Link to="/admission/track" className="btn btn-lg home-hero-btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}>
                  {t('track_application')}
                </Link>
              </div>
            </div>

            {/* Maha Dan Total Donation & Donors Counter Banner */}
            <div className="home-mahadan-counter-card">
              <div className="home-mahadan-counter-header">
                <div className="home-mahadan-counter-icon">
                  <Heart size={22} fill="#FFFFFF" color="#FFFFFF" />
                </div>
                <div>
                  <div className="home-mahadan-counter-badge">
                    {settings.home_mahadan_badge || '✨ SATWARA MAHA DAN COUNTER'}
                  </div>
                  <div className="home-mahadan-counter-sub">
                    {settings.home_mahadan_sub || 'Live Community Contributions'}
                  </div>
                </div>
              </div>

              <div className="home-mahadan-counter-stats-grid">
                <div className="home-mahadan-stat-box">
                  <span className="home-mahadan-stat-label">Total Donation Received</span>
                  <strong className="home-mahadan-stat-val">
                    ₹ {Number(mahadanStats.totalAmount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="home-mahadan-stat-box">
                  <span className="home-mahadan-stat-label">Total Verified Donors</span>
                  <strong className="home-mahadan-stat-val-gold">
                    {mahadanStats.totalDonors || 0} Donors
                  </strong>
                </div>
              </div>

              <Link
                to="/mahadan"
                className="btn home-mahadan-btn"
              >
                Contribute Maha Dan <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Summary Strip */}
      <section className="home-trust-summary-section">
        <div className="container">
          <div className="card trust-summary-card">
            <div className="trust-summary-item">
              <div className="trust-summary-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
                <Heart size={22} fill="#ea580c" />
              </div>
              <div>
                <div className="trust-summary-val">
                  ₹ {Number(mahadanStats.totalAmount || 0).toLocaleString('en-IN')}
                </div>
                <div className="trust-summary-label">Maha Dan ({mahadanStats.totalDonors || 0} Donors)</div>
              </div>
            </div>

            <div className="trust-summary-item">
              <div className="trust-summary-icon" style={{ background: '#fef3c7', color: 'var(--accent-gold)' }}>
                <Award size={22} />
              </div>
              <div>
                <div className="trust-summary-val">{settings.home_trust_metric2_val || '30+ Years'}</div>
                <div className="trust-summary-label">{settings.home_trust_metric2_label || 'Community Service'}</div>
              </div>
            </div>

            <div className="trust-summary-item">
              <div className="trust-summary-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="trust-summary-val">{settings.home_trust_metric3_val || '2,500+'}</div>
                <div className="trust-summary-label">{settings.home_trust_metric3_label || 'Students Housed'}</div>
              </div>
            </div>

            <div className="trust-summary-item">
              <div className="trust-summary-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div className="trust-summary-val">{settings.home_trust_metric4_val || '2 Hostels'}</div>
                <div className="trust-summary-label">{settings.home_trust_metric4_label || 'Boys & Girls Complexes'}</div>
              </div>
            </div>

            <div className="trust-summary-item full-width-mobile">
              <div className="trust-summary-icon" style={{ background: '#fae8ff', color: '#a21caf' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div className="trust-summary-val">{settings.home_trust_metric5_val || '100% Merit'}</div>
                <div className="trust-summary-label">{settings.home_trust_metric5_label || 'Transparent Admission'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING MODERN GIRLS HOSTEL PROJECT SECTION */}
      <section style={{ background: 'linear-gradient(135deg, #FDFBF7 0%, #FFFBEB 50%, #FEF3C7 100%)', padding: '64px 0', borderTop: '2px solid #FCD34D', borderBottom: '2px solid #FCD34D', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(217, 119, 6, 0.15)', color: '#B45309', border: '1px solid #F59E0B', borderRadius: '30px', padding: '6px 20px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '0.5px' }}>
              <Sparkles size={16} color="#D97706" /> આકાર લઈ રહ્યું છે નવું કન્યા છાત્રાલય (UPCOMING PROJECT)
            </div>
            <h2 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary-navy)', marginBottom: '12px', fontWeight: 800 }}>
              {settings.home_new_girls_hostel_title || '🎓 આધુનિક કન્યા છાત્રાલય સંકુલ'}
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.65' }}>
              {settings.home_new_girls_hostel_sub || 'સતવારા સમાજ દીકરીઓના ઉજ્જવળ ભવિષ્ય અને ઉચ્ચ શિક્ષણ માટે આધુનિક સુવિધાઓથી સજ્જ સુરક્ષિત કન્યા છાત્રાલય.'}
            </p>
          </div>

          {/* Interactive 2-Column Content Grid */}
          <div className="home-upcoming-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '32px', alignItems: 'center' }}>
            
            {/* Left Column: 3D Architectural Render Card with Floating Badges */}
            <div style={{ position: 'relative' }}>
              <div className="card" style={{ padding: '12px', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 20px 45px rgba(180, 83, 9, 0.15)', border: '2px solid #FCD34D', overflow: 'hidden' }}>
                
                {/* 3D Render Image */}
                <div style={{ borderRadius: '14px', overflow: 'hidden', position: 'relative', height: '360px' }}>
                  <img
                    src="/new_girls_hostel_render.jpg"
                    alt="Upcoming Modern Girls Hostel 3D Architectural Render"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Status Overlay Pill */}
                  <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(10px)', color: '#FFD700', border: '1px solid #F59E0B', borderRadius: '30px', padding: '8px 18px', fontSize: '0.84rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                    આકાર લઈ રહેલું સંકુલ (Under Construction)
                  </div>

                  {/* Architecture Feature Tag */}
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'linear-gradient(135deg, var(--primary-maroon), #991B1B)', color: '#FFFFFF', borderRadius: '12px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800, boxShadow: '0 6px 18px rgba(0,0,0,0.3)' }}>
                    🏢 4-Story Ultra Modern Facility
                  </div>
                </div>

                {/* Quick Specs Bar under image */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px', textAlign: 'center', background: '#FFFBEB', padding: '12px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>કુલ ક્ષમતા</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary-navy)' }}>100+ દીકરીઓ</div>
                  </div>
                  <div style={{ borderLeft: '1px solid #FCD34D', borderRight: '1px solid #FCD34D' }}>
                    <div style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>બિલ્ડીંગ માળ</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary-navy)' }}>4 માળ સંકુલ</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>સુરક્ષા દરજ્જો</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#15803D' }}>24/7 CCTV</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Features Checklist + Naming Donor Card */}
            <div>
              {/* Features List */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-maroon)', marginBottom: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} color="var(--primary-maroon)" /> આધુનિક કન્યા છાત્રાલય મુખ્ય આકર્ષણો:
                </h3>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0 }} /> સુરક્ષિત અને આધુનિક કેમ્પસ
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0 }} /> વિશાળ અને સુસજ્જ રૂમ
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0 }} /> Wi-Fi અને Study Hall
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0 }} /> CCTV સુરક્ષા વ્યવસ્થા
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0 }} /> શુદ્ધ ભોજન અને રહેઠાણ
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0 }} /> સર્વાંગી વિકાસ વાતાવરણ
                  </li>
                </ul>
              </div>

              {/* Naming Donor Card (નામકરણ દાતા) */}
              <div className="card" style={{ background: '#FFFFFF', border: '1px solid #FCD34D', borderLeft: '6px solid #DC2626', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  <Award size={18} color="#B45309" /> ☀️ મુખ્ય નામકરણ દાતા
                </div>
                
                <h4 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', fontWeight: 800, margin: '0 0 8px 0', lineHeight: '1.3' }}>
                  {settings.home_donor_name || 'શ્રીમતી ગૌરીબેન તથા નરેશભાઈ કરશનભાઈ કણઝરીયા'}
                </h4>

                <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '4px', fontWeight: 600 }}>
                  📍 {settings.home_donor_native || '(મૂળ વતણ - જાળીલા, તા. રાણપુર, જી. બોટાદ)'}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                  🏠 {settings.home_donor_current || '(હાલ - સતવારા સોસાયટી, ધંધુકા)'}
                </div>
              </div>

              {/* Call to Action Button */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link to="/mahadan" className="btn btn-primary btn-lg" style={{ flex: 1, padding: '14px 22px', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(153, 27, 27, 0.25)' }}>
                  <Heart fill="#FFD700" color="#FFD700" size={20} /> કન્યા છાત્રાલય માટે મહા દાન અર્પણ કરો <ArrowRight size={18} />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Admission Timeline Strip */}
      <section style={{ background: '#ffffff', padding: '50px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--primary-navy)' }}>
              {settings.home_journey_title || t('journey_title')}
            </h2>
          </div>

          <div className="home-timeline-grid">
            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>1</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{settings.home_step1_title || 'Online Application'}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{settings.home_step1_sub || 'Fill details & preference on site'}</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>2</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{settings.home_step2_title || 'Doc Upload & OTP'}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{settings.home_step2_sub || 'Upload marksheets & mobile verify'}</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>3</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{settings.home_step3_title || 'Merit List Publication'}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{settings.home_step3_sub || 'Auto-calculated merit rank release'}</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>4</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{settings.home_step4_title || 'Bed Allotment'}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{settings.home_step4_sub || 'Admin assigns room & bed number'}</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>5</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{settings.home_step5_title || 'Hostel Joining'}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{settings.home_step5_sub || 'Fee confirmation & room check-in'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hostels & Live Vacancy Cards Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>
            <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--primary-maroon)', marginBottom: '10px' }}>
              {settings.home_hostel_title || t('hostel_status_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {settings.home_hostel_sub || t('hostel_status_sub')}
            </p>
          </div>

          <div className="home-hostel-grid">
            {hostels.map((hostel) => (
              <div key={hostel.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className={`badge ${hostel.type === 'BOYS' ? 'badge-primary' : 'badge-reserved'}`}>
                      {hostel.type === 'BOYS' ? '🚹 Boys Hostel' : '🚺 Girls Hostel'}
                    </span>
                    <span className="badge badge-vacant" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                      🟢 {hostel.availableBeds} Live Beds Available
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                    {hostel.name}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {hostel.description}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Total Capacity:</span>
                      <strong>{hostel.totalCapacity} Beds</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Occupied Beds:</span>
                      <strong>{hostel.occupiedBeds} Beds</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Warden Contact:</span>
                      <strong>{hostel.wardenContact}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to={`/hostels/${hostel.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                    View Hostel Profile
                  </Link>
                  <Link to={`/apply?hostel=${hostel.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Events */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--primary-maroon)' }}>
                {settings.home_news_title || t('news_section_title')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{settings.home_news_sub || t('news_section_sub')}</p>
            </div>
            <Link to="/news" className="btn btn-outline btn-sm">View All News</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {news.map((item) => (
              <div key={item.id} className="card card-hover">
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '6px' }}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {new Date(item.publishedDate).toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN')}
                </div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  {lang === 'gu' ? item.titleGu : item.titleEn}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {lang === 'gu' ? item.contentGu : item.contentEn}
                </p>
                <Link to="/news" style={{ fontWeight: 600, color: 'var(--primary-maroon)', fontSize: '0.82rem' }}>
                  Read Full Notice →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
