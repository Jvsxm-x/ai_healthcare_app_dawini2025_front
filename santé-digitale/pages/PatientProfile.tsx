import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Patient } from '../types';
import { Button } from '../components/Button';
import { UserCircle, Save, MapPin, Phone, Calendar } from 'lucide-react';

export const PatientProfile = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date_of_birth: '',
    phone_number: '',
    address: '',
    emergency_contact: '',
    medical_history: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const patients = await api.get<Patient[]>('/patients/');
        if (patients && patients.length > 0) {
          const p = patients[0];
          setPatient(p);
          setFormData({
            date_of_birth: p.date_of_birth,
            phone_number: p.phone_number,
            address: p.address,
            emergency_contact: p.emergency_contact,
            medical_history: p.medical_history
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (patient) {
        // Update using PUT as per requirements
        const updated = await api.put<Patient>(`/patients/${patient.id}/`, formData);
        setPatient(updated);
        alert("Profile updated!");
      } else {
        // Create
        const newPatient = await api.post<Patient>('/patients/', formData);
        setPatient(newPatient);
        alert("Profile created!");
      }
    } catch (e) {
      console.error(e);
      alert("Operation failed");
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
            <div className="bg-teal-100 p-4 rounded-full text-teal-700">
                <UserCircle size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Patient Profile</h2>
                <p className="text-slate-500">{patient ? 'Manage your personal information' : 'Complete your profile to get started'}</p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400"/> Date of Birth
                        </label>
                        <input 
                            type="date"
                            required
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={formData.date_of_birth}
                            onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                            <Phone size={16} className="text-slate-400"/> Phone Number
                        </label>
                        <input 
                            type="tel"
                            required
                            placeholder="+33..."
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            value={formData.phone_number}
                            onChange={e => setFormData({...formData, phone_number: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400"/> Address
                    </label>
                    <input 
                        type="text"
                        required
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
                    <input 
                        type="tel"
                        required
                        placeholder="+33..."
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.emergency_contact}
                        onChange={e => setFormData({...formData, emergency_contact: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medical History</label>
                    <textarea 
                        rows={4}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.medical_history}
                        onChange={e => setFormData({...formData, medical_history: e.target.value})}
                        placeholder="Allergies, past surgeries, chronic conditions..."
                    />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button type="submit" className="w-full md:w-auto">
                        <Save size={18} className="mr-2" />
                        {patient ? 'Update Profile' : 'Create Profile'}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
};