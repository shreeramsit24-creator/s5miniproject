import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';

// Page & Layout Imports
import { PortalLogin } from './pages/PortalLogin';
import { AppLogin } from './pages/AppLogin';
import { AdminMobileApp } from './pages/admin/AdminMobileApp';
import { FacultyMobileApp } from './pages/faculty/FacultyMobileApp';
import { StudentMobileApp } from './pages/student/StudentMobileApp';
import { TimetablePortal } from './pages/timetable/TimetablePortal';

import { useAppStore } from './store/useAppStore';

// Shared Components
import { OfflineBanner } from './components/shared/OfflineBanner';
import { NotificationDrawer } from './components/shared/NotificationDrawer';

interface ProtectedRouteProps {
  allowedRoles: ('admin' | 'faculty' | 'student')[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentRole, currentUser } = useAppStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('user_role') as any) : null;
  const effectiveRole = storedRole || currentRole || currentUser?.role;

  // Unauthenticated users are redirected to login
  if (!token && !currentUser) {
    if (allowedRoles.includes('faculty') && !allowedRoles.includes('student')) {
      return <Navigate to="/faculty/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Guard against role mismatch
  if (effectiveRole && !allowedRoles.includes(effectiveRole)) {
    if (allowedRoles.includes('faculty') && !allowedRoles.includes('student')) {
      return <Navigate to="/faculty/login" replace />;
    }
    if (effectiveRole === 'admin') return <Navigate to="/admin" replace />;
    if (effectiveRole === 'faculty') return <Navigate to="/faculty" replace />;
    return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300 selection:bg-teal-600 selection:text-white">
      {/* Global Drawers & Alerts */}
      <OfflineBanner />
      <NotificationDrawer />

      {/* Main Routed Standalone Apps */}
      <main className="flex-1 flex flex-col min-h-0 bg-white">
        <Routes>
          {/* 1. Smart Attendance Portal */}
          <Route path="/" element={<PortalLogin />} />
          <Route path="/portal" element={<PortalLogin />} />
          <Route path="/admin/login" element={<PortalLogin />} />

          {/* 2. Smart Attendance Student & Faculty App Login */}
          <Route path="/login" element={<AppLogin />} />
          <Route path="/app/login" element={<AppLogin />} />
          <Route path="/student/login" element={<AppLogin />} />
          <Route path="/faculty/login" element={<AppLogin />} />

          {/* 3. Academic Master Timetable Portal */}
          <Route path="/timetable" element={<TimetablePortal />} />
          <Route path="/timetable/*" element={<TimetablePortal />} />

          {/* 4. Admin Command Console */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMobileApp />
              </ProtectedRoute>
            }
          />

          {/* 4. Faculty App (Full-Width Responsive Desktop & Mobile App) */}
          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyMobileApp />
              </ProtectedRoute>
            }
          />

          {/* 5. Student App (Full-Width Responsive Desktop & Mobile App) */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentMobileApp />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
