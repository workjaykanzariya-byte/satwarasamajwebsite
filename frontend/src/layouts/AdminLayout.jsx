import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BedDouble,
  Heart,
  FileText,
  Award,
  Users,
  CreditCard,
  Newspaper,
  ShieldCheck,
  UserCheck,
  Globe,
  LogOut,
  ChevronRight,
  Search,
  Menu,
  X,
} from 'lucide-react';

const ALL_MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { key: 'occupancy', label: 'Bed Occupancy Engine', path: '/admin/occupancy', icon: BedDouble, highlight: true },
  { key: 'mahadan', label: 'Maha Dan Portal', path: '/admin/mahadan', icon: Heart, highlight: true },
  { key: 'applications', label: 'Student Applications', path: '/admin/applications', icon: FileText },
  { key: 'merit', label: 'Merit List Engine', path: '/admin/merit', icon: Award },
  { key: 'students', label: 'Students & Stays', path: '/admin/students', icon: Users },
  { key: 'fees', label: 'Fees & Accounts', path: '/admin/fees', icon: CreditCard },
  { key: 'cms', label: 'CMS Content & News', path: '/admin/content', icon: Newspaper },
  { key: 'audit', label: 'System Audit Logs', path: '/admin/audit', icon: ShieldCheck },
  { key: 'users', label: 'Admin Roles & Access', path: '/admin/users', icon: UserCheck, superOnly: true },
];

export default function AdminLayout({ pageKey, children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 992;
  const isSuper = admin?.role === 'SUPER_ADMIN';
  const permissions = isSuper
    ? ['dashboard', 'occupancy', 'mahadan', 'applications', 'merit', 'students', 'fees', 'cms', 'audit', 'users']
    : admin?.permissions || [];

  const hasAccess = isSuper || (pageKey && permissions.includes(pageKey));

  // Filter allowed menu items
  const menuItems = ALL_MENU_ITEMS.filter((item) => {
    if (item.superOnly && !isSuper) return false;
    return isSuper || permissions.includes(item.key);
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
          }}
        />
      )}

      {/* LEFT SIDEBAR (PEERS GLOBAL STYLE) */}
      <aside
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, #0B0F19 0%, #0F172A 100%)',
          color: '#94A3B8',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
          overflowY: 'auto',
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Sidebar Brand Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Satvara Mandal Logo"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'contain', background: '#ffffff', padding: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            />
            <div>
              <h2 style={{ fontSize: '0.92rem', color: '#FFFFFF', margin: 0, fontWeight: '800', letterSpacing: '0.5px' }}>
                SATVARA MAHAMANDAL
              </h2>
              <span style={{ fontSize: '0.68rem', color: '#F59E0B', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Admin Control Desk
              </span>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px' }}
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* Sidebar Navigation Section */}
        <div style={{ padding: '20px 12px', flex: 1 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '0 12px 10px 12px' }}>
            Main Menu
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#FFFFFF' : item.highlight ? '#FCD34D' : '#CBD5E1',
                    background: isActive ? 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)' : 'transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(30, 64, 175, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={19} style={{ color: isActive ? '#FFFFFF' : item.highlight ? '#F59E0B' : '#94A3B8' }} />
                    <span>{item.label}</span>
                  </div>
                  {isActive ? (
                    <ChevronRight size={16} color="#FFFFFF" />
                  ) : (
                    item.highlight && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/"
            onClick={() => isMobile && setMobileOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '0.84rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Globe size={16} color="#60A5FA" /> Public Website
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              color: '#F87171',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 'bold',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <LogOut size={16} /> Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ marginLeft: isMobile ? 0 : '260px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        {/* TOP BAR HEADER */}
        <header
          style={{
            height: '70px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: isMobile ? '0 16px' : '0 32px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          {/* Left: Mobile Menu Toggle & Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#0F172A',
                }}
              >
                <Menu size={22} />
              </button>
            )}

            <div>
              <h3 style={{ margin: 0, fontSize: isMobile ? '0.98rem' : '1.1rem', color: '#0F172A', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {getGreeting()}, {admin?.name ? admin.name.split(' ')[0] : 'Admin'} 👋
              </h3>
              {!isMobile && (
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px' }}>
            {/* Search Input Bar (Desktop / Tablet) */}
            {!isMobile && (
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Role Badge */}
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: '800',
                background: isSuper ? '#FEF3C7' : '#E0F2FE',
                color: isSuper ? '#92400E' : '#0369A1',
                border: isSuper ? '1px solid #F59E0B' : '1px solid #38BDF8',
                whiteSpace: 'nowrap',
              }}
            >
              {isSuper ? '⚡ SUPER ADMIN' : admin?.role || 'ADMIN'}
            </span>

            {/* Profile Avatar Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F1F5F9', padding: '4px 10px 4px 4px', borderRadius: '30px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.88rem' }}>
                {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              {!isMobile && (
                <div style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                  <div style={{ fontWeight: 'bold', color: '#0F172A' }}>{admin?.name || 'Admin'}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BODY PAGE CONTENT */}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '32px', overflowX: 'hidden' }}>
          {hasAccess ? (
            children
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 16px' }}>
              <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '30px' }}>
                <h2 style={{ color: '#991B1B', marginBottom: '12px' }}>🔒 Access Restricted</h2>
                <p style={{ color: '#64748B', marginBottom: '20px' }}>
                  Your admin account does not have permission to view this section. Please contact your Super Administrator for access.
                </p>
                {menuItems.length > 0 && (
                  <Link to={menuItems[0].path} className="btn btn-primary">
                    Go to Accessible Section ({menuItems[0].label})
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
