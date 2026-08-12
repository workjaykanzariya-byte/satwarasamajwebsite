import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import MahaDanPage from './pages/public/MahaDanPage';
import Committee from './pages/public/Committee';
import HostelsList from './pages/public/HostelsList';
import HostelDetail from './pages/public/HostelDetail';
import AdmissionOverview from './pages/public/AdmissionOverview';
import ApplicationForm from './pages/public/ApplicationForm';
import ApplicationTracker from './pages/public/ApplicationTracker';
import PublicMeritList from './pages/public/PublicMeritList';
import NewsPage from './pages/public/NewsPage';
import DarpanPublications from './pages/public/DarpanPublications';
import GalleryPage from './pages/public/GalleryPage';
import DownloadsPage from './pages/public/DownloadsPage';
import ContactPage from './pages/public/ContactPage';
import StaticPolicyPage from './pages/public/StaticPolicyPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import OccupancyManager from './pages/admin/OccupancyManager';
import ApplicationsManager from './pages/admin/ApplicationsManager';
import MeritEngine from './pages/admin/MeritEngine';
import StudentsManager from './pages/admin/StudentsManager';
import FeesManager from './pages/admin/FeesManager';
import MahaDanManager from './pages/admin/MahaDanManager';
import ContentManager from './pages/admin/ContentManager';
import AuditLogsViewer from './pages/admin/AuditLogsViewer';
import AdminUserManager from './pages/admin/AdminUserManager';

function PublicLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

function ProtectedAdminRoute({ pageKey, children }) {
  const { token, loading } = useAuth();

  if (loading) return <div style={{ padding: '80px', textAlign: 'center' }}>Authenticating admin session...</div>;
  if (!token) return <Navigate to="/admin/login" replace />;

  return <AdminLayout pageKey={pageKey}>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes Wrapped with Public Site Header & Footer */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/mahadan" element={<PublicLayout><MahaDanPage /></PublicLayout>} />
      <Route path="/committee" element={<PublicLayout><Committee /></PublicLayout>} />
      <Route path="/hostels" element={<PublicLayout><HostelsList /></PublicLayout>} />
      <Route path="/hostels/:id" element={<PublicLayout><HostelDetail /></PublicLayout>} />
      <Route path="/admission" element={<PublicLayout><AdmissionOverview /></PublicLayout>} />
      <Route path="/apply" element={<PublicLayout><ApplicationForm /></PublicLayout>} />
      <Route path="/admission/track" element={<PublicLayout><ApplicationTracker /></PublicLayout>} />
      <Route path="/admission/merit-list" element={<PublicLayout><PublicMeritList /></PublicLayout>} />
      <Route path="/admission/temporary" element={<PublicLayout><AdmissionOverview /></PublicLayout>} />
      <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
      <Route path="/darpan" element={<PublicLayout><DarpanPublications /></PublicLayout>} />
      <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
      <Route path="/downloads" element={<PublicLayout><DownloadsPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/policy/:slug" element={<PublicLayout><StaticPolicyPage /></PublicLayout>} />

      {/* Admin Login (Clean Full Screen) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes (Rendered inside Dark Sidebar AdminLayout) */}
      <Route path="/admin/dashboard" element={<ProtectedAdminRoute pageKey="dashboard"><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/occupancy" element={<ProtectedAdminRoute pageKey="occupancy"><OccupancyManager /></ProtectedAdminRoute>} />
      <Route path="/admin/mahadan" element={<ProtectedAdminRoute pageKey="mahadan"><MahaDanManager /></ProtectedAdminRoute>} />
      <Route path="/admin/applications" element={<ProtectedAdminRoute pageKey="applications"><ApplicationsManager /></ProtectedAdminRoute>} />
      <Route path="/admin/merit" element={<ProtectedAdminRoute pageKey="merit"><MeritEngine /></ProtectedAdminRoute>} />
      <Route path="/admin/students" element={<ProtectedAdminRoute pageKey="students"><StudentsManager /></ProtectedAdminRoute>} />
      <Route path="/admin/fees" element={<ProtectedAdminRoute pageKey="fees"><FeesManager /></ProtectedAdminRoute>} />
      <Route path="/admin/content" element={<ProtectedAdminRoute pageKey="cms"><ContentManager /></ProtectedAdminRoute>} />
      <Route path="/admin/audit" element={<ProtectedAdminRoute pageKey="audit"><AuditLogsViewer /></ProtectedAdminRoute>} />
      <Route path="/admin/users" element={<ProtectedAdminRoute pageKey="users"><AdminUserManager /></ProtectedAdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
