import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Appointment, User } from '../types';
import { Button } from '../components/Button';
import { Calendar as CalendarIcon, Clock, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchAppointments = async () => {
    try {
      const data = await api.get<Appointment[]>('/medical/appointments/');
      setAppointments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctors = async () => {
      try {
          const data = await api.get<User[]>('/auth/doctors/');
          setDoctors(data);
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.post('/medical/appointments/', {
              doctor: parseInt(selectedDoctor),
              patient: 1, // In a real app, backend infers this from token, but API requires it in body per docs
              appointment_date: new Date(date).toISOString(),
              reason,
              status: 'scheduled'
          });
          setIsModalOpen(false);
          fetchAppointments();
          setReason('');
          setDate('');
      } catch (e) {
          alert("Failed to book appointment");
      }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
          <p className="text-slate-500">Manage your medical visits</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <CalendarIcon size={18} className="mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appt) => (
          <div key={appt.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center transition-hover hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                <CalendarIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{appt.reason}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(appt.appointment_date).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon size={14} />
                    Dr. ID: {appt.doctor}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              {appt.status === 'scheduled' ? (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  Scheduled
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  {appt.status}
                </span>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No appointments found.</p>
            </div>
        )}
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <form onSubmit={handleCreate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Select Doctor</label>
                    <select 
                        className="w-full p-2 border rounded-lg"
                        value={selectedDoctor}
                        onChange={e => setSelectedDoctor(e.target.value)}
                        required
                    >
                        <option value="">Choose a doctor...</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>Dr. {d.last_name} ({d.email})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Date & Time</label>
                    <input 
                        type="datetime-local" 
                        className="w-full p-2 border rounded-lg"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <textarea 
                        className="w-full p-2 border rounded-lg"
                        rows={3}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Confirm Booking</Button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
