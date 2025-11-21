
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Patient Pages
import { Dashboard as PatientDashboard } from './pages/Dashboard';
import { MedicalData } from './pages/MedicalData';
import { Analysis } from './pages/Analysis';
import { PatientProfile } from './pages/PatientProfile';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientList } from './pages/doctor/PatientList';
import { Appointments } from './pages/Appointments'; 
import { LabOrders } from './pages/doctor/LabOrders';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';

import { ROUTES } from './constants';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { token, role, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Dawini...</div>;
  
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
     if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
     if (role === 'admin') return <Navigate to="/v1/portal/admin/dashboard" replace />;
     return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { role } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} /> 
        
        {/* Default Route Redirect based on Role */}
        <Route path="/" element={
          <ProtectedRoute>
             {role === 'doctor' ? <Navigate to="/doctor/dashboard" /> : 
              role === 'admin' ? <Navigate to="/v1/portal/admin/dashboard" /> :
              <Layout /> } 
          </ProtectedRoute>
        }>
           <Route index element={<PatientDashboard />} />
           <Route path={ROUTES.MEDICAL_DATA} element={<MedicalData />} />
           <Route path={ROUTES.ANALYSIS} element={<Analysis />} />
           <Route path={ROUTES.PROFILE} element={<PatientProfile />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
                <Layout />
            </ProtectedRoute>
        }>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="orders" element={<LabOrders />} />
        </Route>

        {/* Admin Routes - New Path v1/portal/admin */}
        <Route path="/v1/portal/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
            </ProtectedRoute>
        }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<div className="p-8">Settings Placeholder</div>} />
        </Route>

        {/* Redirect legacy admin path just in case */}
        <Route path="/admin/*" element={<Navigate to="/v1/portal/admin/dashboard" replace />} />

      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
