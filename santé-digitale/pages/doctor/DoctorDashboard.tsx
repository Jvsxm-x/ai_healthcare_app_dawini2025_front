
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DoctorDashboardStats, Appointment } from '../../types';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorDashboard = () => {
  const [stats, setStats] = useState<DoctorDashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await api.get<DoctorDashboardStats[]>('/doctor/dashboard/');
        if (dashboardData && dashboardData.length > 0) {
            setStats(dashboardData[0]);
        }
        
        // Mocking getting recent appointments for this doctor
        // In real app: /api/doctor/appointments/?limit=5
        const appts = await api.get<Appointment[]>('/medical/appointments/');
        setRecentAppointments(appts.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch doctor dashboard", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Doctor's Overview</h2>
        <p className="text-slate-500">Welcome Dr.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                <Users size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">Total Patients</p>
                <h3 className="text-3xl font-bold text-slate-900">{stats?.patient_count || 0}</h3>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                <Calendar size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">Appointments Today</p>
                <h3 className="text-3xl font-bold text-slate-900">{stats?.appointment_count || 0}</h3>
            </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl shadow-md text-white">
            <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
            <div className="flex gap-3">
                <Link to="/doctor/patients" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm backdrop-blur-sm transition-colors">
                    View Patients
                </Link>
                 <Link to="/doctor/appointments" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm backdrop-blur-sm transition-colors">
                    Schedule
                </Link>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Upcoming Appointments</h3>
            <Link to="/doctor/appointments" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-slate-100">
            {recentAppointments.map(appt => (
                <div key={appt.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                         <div className="bg-slate-100 p-2 rounded-lg">
                             <Clock size={20} className="text-slate-600" />
                         </div>
                         <div>
                             <p className="font-medium text-slate-900">{new Date(appt.appointment_date).toLocaleString()}</p>
                             <p className="text-sm text-slate-500">{appt.reason}</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            appt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            appt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                            {appt.status}
                        </span>
                        <button className="text-slate-400 hover:text-blue-600">
                            <CheckCircle size={20} />
                        </button>
                    </div>
                </div>
            ))}
            {recentAppointments.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No upcoming appointments found.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
