
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  UserCircle, 
  LogOut, 
  ClipboardList,
  Users,
  CalendarDays,
  Settings,
  ShieldCheck,
  TestTube
} from 'lucide-react';
import { ROUTES } from '../constants';

export const Sidebar = () => {
  const { user, role, logout } = useAuth();

  // Define branding based on role
  const getTheme = () => {
    switch(role) {
      case 'doctor': return 'from-blue-500 to-indigo-600';
      case 'admin': return 'from-slate-600 to-slate-800';
      default: return 'from-teal-400 to-teal-200';
    }
  };

  const themeClass = getTheme();

  const getLinks = () => {
    
    if (role === 'patient') {
      return [
        { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { to: ROUTES.MEDICAL_DATA, label: 'Medical Records', icon: ClipboardList },
        { to: ROUTES.ANALYSIS, label: 'AI Analysis', icon: BrainCircuit },
        { to: ROUTES.PROFILE, label: 'My Profile', icon: UserCircle },
      ];
    }
    
    if (role === 'doctor') {
      return [
        { to: '/doctor/dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
        { to: '/doctor/patients', label: 'Patient List', icon: Users },
        { to: '/doctor/orders', label: 'Lab Orders', icon: TestTube },
        // Appointments removed or mocked if API not available, but kept link for UI completeness if desired
        { to: '/doctor/appointments', label: 'Schedule', icon: CalendarDays },
        { to: '/profile', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'admin') {
      return [
        { to: '/v1/portal/admin/dashboard', label: 'System Overview', icon: ShieldCheck },
        { to: '/v1/portal/admin/users', label: 'User Management', icon: Users },
        { to: '/v1/portal/admin/settings', label: 'Configuration', icon: Settings },
      ];
    }

    return [];
  };

  const links = getLinks();

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-800">
        <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${themeClass}`}>
          Dawini
        </h1>
        <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
          {role} Portal
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? `bg-white/10 text-white shadow-lg border border-white/5`
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-300 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${themeClass}`}>
                {user?.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 truncate">
                <div className="font-medium truncate">{user?.first_name || user?.username}</div>
                <div className="text-xs text-slate-500 capitalize">{role}</div>
            </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
