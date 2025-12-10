
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SaaSProvider } from './context/SaaSContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Pricing } from './pages/Pricing';
import { PaymentSuccess } from './pages/PaymentSuccess';

// Patient Pages
import { Dashboard as PatientDashboard } from './pages/Dashboard';
import { MedicalData } from './pages/MedicalData';
import { Analysis } from './pages/Analysis';
import { PatientProfile } from './pages/PatientProfile';
import { Documents } from './pages/Documents'; 

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientList } from './pages/doctor/PatientList';
import { Appointments } from './pages/Appointments'; 
import { LabOrders } from './pages/doctor/LabOrders';
import { DocumentReviews } from './pages/doctor/DocumentReviews';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminSettings } from './pages/admin/AdminSettings';
import { PaymentDashboard } from './pages/admin/PaymentDashboard';

import { ROUTES } from './constants';
import { UserRole } from './types';

// Protected Route Component for v6
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: UserRole[] }) => {
  const { token, role, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Dawini SaaS...</div>;
  }

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
      if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
      if (role === 'admin') return <Navigate to="/v1/portal/admin/dashboard" replace />;
      return <Navigate to={ROUTES.DASHBOARD} replace />; 
  }

  return children;
};

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route path={ROUTES.PRICING} element={<Pricing />} />
        <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
        
        {/* Auth Routes */}
        <Route path={ROUTES.LOGIN} element={token ? <Navigate to={ROUTES.DASHBOARD} /> : <Login />} />
        <Route path={ROUTES.REGISTER} element={token ? <Navigate to={ROUTES.DASHBOARD} /> : <Register />} /> 
        
        {/* Protected Patient Routes */}
        <Route path={ROUTES.DASHBOARD + "/*"} element={
            <ProtectedRoute allowedRoles={['patient']}>
                <Layout>
                    <Routes>
                        <Route index element={<PatientDashboard />} />
                        <Route path="records" element={<MedicalData />} />
                        <Route path="analysis" element={<Analysis />} />
                        <Route path="documents" element={<Documents />} /> 
                        <Route path="profile" element={<PatientProfile />} />
                    </Routes>
                </Layout>
            </ProtectedRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor/*" element={
            <ProtectedRoute allowedRoles={['doctor']}>
                <Layout>
                    <Routes>
                        <Route path="dashboard" element={<DoctorDashboard />} />
                        <Route path="patients" element={<PatientList />} />
                        <Route path="appointments" element={<Appointments />} />
                        <Route path="orders" element={<LabOrders />} />
                        <Route path="reviews" element={<DocumentReviews />} />
                    </Routes>
                </Layout>
            </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/v1/portal/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                    <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="payments" element={<PaymentDashboard />} />
                    </Routes>
                </Layout>
            </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.LANDING} />} />

      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SaaSProvider>
        <AppRoutes />
      </SaaSProvider>
    </AuthProvider>
  );
};

export default App;
