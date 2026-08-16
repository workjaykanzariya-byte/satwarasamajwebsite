import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Building2, Award, Users, BookOpen, Calendar, CheckCircle2, ArrowRight, ShieldCheck, PhoneCall, Heart } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [hostelRes, newsRes, mahadanRes] = await Promise.all([
        api.get('/occupancy/summary').catch(() => null),
        api.get('/cms/news').catch(() => null),
        api.get('/mahadan/public-stats').catch(() => null),
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
              <ShieldCheck size={15} /> Official Community Trust Portal | {t('trust_reg')}
            </div>
            <h1 className="heading-serif home-hero-title">
              {t('hero_title')}
            </h1>
            <p className="home-hero-sub">
              {t('hero_subtitle')}
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
                    ✨ SATWARA MAHA DAN COUNTER
                  </div>
                  <div className="home-mahadan-counter-sub">
                    Live Community Contributions
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
                <div className="trust-summary-val">30+ Years</div>
                <div className="trust-summary-label">Community Service</div>
              </div>
            </div>

            <div className="trust-summary-item">
              <div className="trust-summary-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="trust-summary-val">2,500+</div>
                <div className="trust-summary-label">Students Housed</div>
              </div>
            </div>

            <div className="trust-summary-item">
              <div className="trust-summary-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div className="trust-summary-val">2 Hostels</div>
                <div className="trust-summary-label">Boys & Girls Complexes</div>
              </div>
            </div>

            <div className="trust-summary-item full-width-mobile">
              <div className="trust-summary-icon" style={{ background: '#fae8ff', color: '#a21caf' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div className="trust-summary-val">100% Merit</div>
                <div className="trust-summary-label">Transparent Admission</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hostels & Live Vacancy Cards Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>
            <h2 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--primary-maroon)', marginBottom: '10px' }}>
              {t('hostel_status_title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {t('hostel_status_sub')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
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

      {/* Admission Timeline Strip */}
      <section style={{ background: '#ffffff', padding: '50px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--primary-navy)' }}>
              {t('journey_title')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>1</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Online Application</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fill details & preference on site</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>2</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Doc Upload & OTP</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upload marksheets & mobile verify</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>3</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Merit List Publication</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Auto-calculated merit rank release</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>4</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Bed Allotment</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Admin assigns room & bed number</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#f8fafc', padding: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-maroon)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 10px auto' }}>5</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Hostel Joining</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fee confirmation & room check-in</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News & Events */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--primary-maroon)' }}>
                {t('news_section_title')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('news_section_sub')}</p>
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
