import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Appointment, User, Patient } from '../types';
import { Button } from '../components/Button';
import { 
  Calendar as CalendarIcon, Clock, User as UserIcon, CheckCircle, 
  XCircle, Search, AlertTriangle, Plus, X, ChevronLeft, ChevronRight, List 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Appointments = () => {
  const { role, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // View State
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Search state
  const [search, setSearch] = useState('');

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, action: 'completed' | 'cancelled' | null, id: number | null}>({
    isOpen: false, action: null, id: null
  });
  
  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
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

  const fetchPatients = async () => {
      try {
          const data = await api.get<Patient[]>('/patients/');
          setPatients(data);
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchAppointments();
    if (role === 'patient') fetchDoctors();
    if (role === 'doctor') fetchPatients();
  }, [role]);

  // Handle Form Pre-filling based on Calendar Selection
  useEffect(() => {
    if (isModalOpen) {
        if (selectedDate) {
            // If a date is selected in calendar, pre-fill it (default to 09:00 AM)
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            setDate(`${year}-${month}-${day}T09:00`);
        } else if (!date) {
            // Default to empty if no date selected
            setDate('');
        }
    }
  }, [isModalOpen, selectedDate]);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const payload = {
              doctor: role === 'doctor' ? user?.id : parseInt(selectedDoctor),
              patient: role === 'doctor' ? parseInt(selectedPatientId) : user?.id, 
              appointment_date: new Date(date).toISOString(),
              reason,
              status: 'scheduled'
          };

          await api.post('/medical/appointments/', payload);
          setIsModalOpen(false);
          fetchAppointments();
          
          // Reset form
          setReason('');
          setDate('');
          if (role !== 'doctor') setSelectedDoctor('');
          if (role !== 'patient') setSelectedPatientId('');
      } catch (e) {
          alert("Failed to book appointment");
      } finally {
          setLoading(false);
      }
  };

  const promptStatusChange = (id: number, newStatus: 'completed' | 'cancelled') => {
      setConfirmDialog({ isOpen: true, action: newStatus, id });
  };

  const executeStatusChange = async () => {
      if (!confirmDialog.id || !confirmDialog.action) return;
      try {
          await api.patch(`/medical/appointments/${confirmDialog.id}/`, { status: confirmDialog.action });
          setAppointments(prev => prev.map(a => a.id === confirmDialog.id ? { ...a, status: confirmDialog.action as any } : a));
      } catch (error) {
          alert("Failed to update status");
      } finally {
          setConfirmDialog({ isOpen: false, action: null, id: null });
      }
  };

  const getPatientName = (id: number) => {
      const p = patients.find(pat => pat.id === id);
      if (p) return `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Patient #${id}`;
      return `Patient ID: ${id}`;
  };

  // --- Calendar Logic ---
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (dir === 'prev') newDate.setMonth(newDate.getMonth() - 1);
      else newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
      setSelectedDate(null); // Clear selection on month change
  };

  const handleDateClick = (day: number) => {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      if (selectedDate && isSameDay(selectedDate, newSelectedDate)) {
          setSelectedDate(null); // Deselect
      } else {
          setSelectedDate(newSelectedDate);
      }
  };

  // Filter Logic
  const filteredAppointments = appointments.filter(appt => {
      // 1. Search Filter
      const term = search.toLowerCase();
      let matchesSearch = true;
      if (term) {
          if (role === 'doctor') {
              const pName = getPatientName(appt.patient).toLowerCase();
              matchesSearch = pName.includes(term) || appt.patient.toString().includes(term);
          } else {
              matchesSearch = appt.reason.toLowerCase().includes(term);
          }
      }
      
      // 2. Date/View Filter
      let matchesDate = true;
      if (view === 'calendar') {
          const apptDate = new Date(appt.appointment_date);
          if (selectedDate) {
              // Exact date match
              matchesDate = isSameDay(apptDate, selectedDate);
          } else {
              // Show current month appointments if no day selected
              matchesDate = apptDate.getMonth() === currentDate.getMonth() && 
                            apptDate.getFullYear() === currentDate.getFullYear();
          }
      }
      
      return matchesSearch && matchesDate;
  });

  const renderCalendar = () => {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun
      
      const blanks = Array(firstDayOfMonth).fill(null);
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const allCells = [...blanks, ...days];
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 animate-fade-in">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    {selectedDate && <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-2">Filtering by: {selectedDate.toLocaleDateString()}</span>}
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft size={20} className="text-slate-600"/>
                    </button>
                    <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(null); }} className="px-3 py-1 text-sm font-medium hover:bg-slate-100 text-slate-600 rounded-lg transition-colors">
                        Today
                    </button>
                    <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronRight size={20} className="text-slate-600"/>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase py-2">
                        {d}
                    </div>
                ))}
                
                {allCells.map((day, index) => {
                    if (!day) return <div key={`blank-${index}`} className="h-28 bg-slate-50/30 rounded-lg border border-transparent"></div>;
                    
                    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isSelected = selectedDate && isSameDay(selectedDate, cellDate);
                    const isToday = isSameDay(new Date(), cellDate);
                    
                    const dayAppts = appointments.filter(a => isSameDay(new Date(a.appointment_date), cellDate));
                    
                    return (
                        <div 
                            key={day} 
                            onClick={() => handleDateClick(day)}
                            className={`h-28 rounded-lg border p-2 cursor-pointer transition-all hover:shadow-md flex flex-col group
                                ${isSelected ? 'border-teal-500 ring-2 ring-teal-100 bg-teal-50/20' : 'border-slate-100 bg-white hover:border-teal-200'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-700 group-hover:bg-slate-100'}`}>
                                    {day}
                                </span>
                                {dayAppts.length > 0 && (
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 rounded-md">
                                        {dayAppts.length}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 w-full overflow-y-auto space-y-1 custom-scrollbar">
                                {dayAppts.slice(0, 3).map(a => (
                                    <div key={a.id} className={`text-[10px] px-1.5 py-1 rounded truncate w-full text-left font-medium ${
                                        a.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {new Date(a.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        <span className="opacity-75 hidden sm:inline"> - {a.reason}</span>
                                    </div>
                                ))}
                                {dayAppts.length > 3 && (
                                    <div className="text-[10px] text-slate-400 pl-1">+{dayAppts.length - 3} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
             {role === 'doctor' ? 'Schedule Management' : 'My Appointments'}
          </h2>
          <p className="text-slate-500">
             {role === 'doctor' ? 'Manage your upcoming patient visits' : 'Book and track your medical visits'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            {/* View Toggle */}
            <div className="flex bg-slate-200 p-1 rounded-lg">
                <button 
                    onClick={() => setView('list')} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <List size={16} /> List
                </button>
                <button 
                    onClick={() => setView('calendar')} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <CalendarIcon size={16} /> Calendar
                </button>
            </div>

            {role === 'doctor' && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full sm:w-48 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            )}
            <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                New Appointment
            </Button>
        </div>
      </div>

      {view === 'calendar' && renderCalendar()}

      <div className="grid gap-4 animate-fade-in-up">
        {view === 'calendar' && filteredAppointments.length > 0 && (
             <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                 {selectedDate ? `Appointments on ${selectedDate.toLocaleDateString()}` : `All Appointments in ${currentDate.toLocaleString('default', { month: 'long' })}`}
             </div>
        )}
        
        {filteredAppointments.map((appt) => (
          <div key={appt.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center transition-all hover:shadow-md hover:border-teal-100">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full shrink-0 ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : appt.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {appt.status === 'cancelled' ? <XCircle size={24} /> : <CalendarIcon size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{appt.reason}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-teal-500" />
                    {new Date(appt.appointment_date).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon size={14} className="text-teal-500" />
                    {role === 'patient' ? `Dr. ID: ${appt.doctor}` : getPatientName(appt.patient)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                  ${appt.status === 'scheduled' ? 'bg-blue-50 text-blue-700' : 
                    appt.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {appt.status}
              </span>

              {appt.status === 'scheduled' && (
                  <div className="flex gap-2 ml-4">
                      {role === 'doctor' && (
                          <button 
                            onClick={() => promptStatusChange(appt.id, 'completed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" 
                            title="Mark Completed"
                          >
                              <CheckCircle size={20} />
                          </button>
                      )}
                      
                      <button 
                        onClick={() => promptStatusChange(appt.id, 'cancelled')}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors" 
                        title="Cancel Appointment"
                      >
                          <XCircle size={20} />
                      </button>
                  </div>
              )}
            </div>
          </div>
        ))}
        {filteredAppointments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No appointments found matching your criteria.</p>
                {view === 'calendar' && selectedDate && (
                    <Button variant="ghost" className="mt-4 text-teal-600" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} className="mr-2" /> Book for {selectedDate.toLocaleDateString()}
                    </Button>
                )}
            </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-fade-in">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <form onSubmit={handleCreate} className="space-y-4">
                {role === 'patient' ? (
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Doctor</label>
                        <select 
                            className="w-full p-2 border rounded-lg bg-slate-50"
                            value={selectedDoctor}
                            onChange={e => setSelectedDoctor(e.target.value)}
                            required
                        >
                            <option value="">Choose a doctor...</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>Dr. {d.last_name}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Patient</label>
                        <select 
                            className="w-full p-2 border rounded-lg bg-slate-50"
                            value={selectedPatientId}
                            onChange={e => setSelectedPatientId(e.target.value)}
                            required
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.first_name} {p.last_name} (ID: {p.id})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium mb-1">Date & Time</label>
                    <input 
                        type="datetime-local" 
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                    {selectedDate && !date.includes(selectedDate.toISOString().split('T')[0]) && (
                         <p className="text-xs text-blue-600 mt-1">
                            * Pre-filled from calendar selection
                         </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <textarea 
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none"
                        rows={3}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                        placeholder="Brief description of the visit..."
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" isLoading={loading}>Confirm Booking</Button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
                  <div className="flex flex-col items-center text-center">
                      <div className={`p-4 rounded-full mb-4 ${confirmDialog.action === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {confirmDialog.action === 'cancelled' ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {confirmDialog.action === 'cancelled' ? 'Cancel Appointment' : 'Mark Completed'}
                      </h3>
                      <p className="text-slate-500 mb-6">
                          {confirmDialog.action === 'cancelled' 
                            ? "Are you sure you want to cancel this appointment? This action cannot be undone."
                            : "Confirm that this appointment has been completed successfully."}
                      </p>
                      <div className="flex gap-3 w-full">
                          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDialog({isOpen: false, action: null, id: null})}>
                              Go Back
                          </Button>
                          <Button 
                            className={`flex-1 ${confirmDialog.action === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            onClick={executeStatusChange}
                          >
                              {confirmDialog.action === 'cancelled' ? 'Confirm Cancel' : 'Complete'}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};