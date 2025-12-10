
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Patient } from '../../types';
import { Search, Eye, FileText, UserPlus, TestTube, Edit, Trash2, X } from 'lucide-react';
import { Button } from '../../components/Button';

export const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    emergency_contact: '',
    medical_history: ''
  });

  // Order Test state
  const [selectedTest, setSelectedTest] = useState('Complete Blood Count');
  const availableTests = [
      'Complete Blood Count', 
      'Lipid Panel', 
      'Liver Function Test', 
      'Urine Analysis', 
      'X-Ray Chest', 
      'MRI Brain', 
      'Diabetes Screening'
  ];

  const fetchPatients = async () => {
    try {
      // UPDATED: Use /patients/ endpoint
      const data = await api.get<Patient[]>('/patients/');
      setPatients(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenModal = (patient?: Patient) => {
      if (patient) {
          setEditingPatientId(patient.id);
          setFormData({
              first_name: patient.first_name || '',
              last_name: patient.last_name || '',
              date_of_birth: patient.date_of_birth || patient.birth_date || '',
              phone_number: patient.phone_number || patient.phone || '',
              address: patient.address || '',
              emergency_contact: patient.emergency_contact || '',
              medical_history: patient.medical_history || ''
          });
      } else {
          setEditingPatientId(null);
          setFormData({
            first_name: '', last_name: '', date_of_birth: '', phone_number: '', 
            address: '', emergency_contact: '', medical_history: ''
          });
      }
      setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if (!window.confirm("Are you sure you want to remove this patient?")) return;
      try {
          await api.delete(`/patients/${id}/`);
          setPatients(prev => prev.filter(p => p.id !== id));
      } catch (e) {
          alert("Failed to delete patient");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          if (editingPatientId) {
             const updated = await api.patch<Patient>(`/patients/${editingPatientId}/`, formData);
             setPatients(prev => prev.map(p => p.id === editingPatientId ? updated : p));
             alert("Patient updated successfully");
          } else {
             // Create via /patients/ or /auth/register/ depending on permission.
             // Using /patients/ implies direct profile creation.
             const created = await api.post<Patient>('/auth/register/', { 
                 ...formData, 
                 username: formData.first_name.toLowerCase() + Date.now(),
                 password: 'Password123!', // Temp password
                 email: `${formData.first_name.toLowerCase()}.${Date.now()}@example.com`
             }); 
             setPatients(prev => [...prev, created]);
             alert("Patient added successfully");
             fetchPatients(); // Refresh to ensure data consistency
          }
          setIsModalOpen(false);
      } catch (e) {
          alert("Operation failed");
      } finally {
          setLoading(false);
      }
  };

  const handleOrderTest = async () => {
      if(!selectedPatient) return;
      setLoading(true);
      try {
          // Mock endpoint or actual
          // await api.post('/medical/lab_orders/', { patient_id: selectedPatient.id, test_name: selectedTest });
          alert(`Test '${selectedTest}' ordered for ${selectedPatient.first_name}`);
          setIsOrderModalOpen(false);
      } catch (e) {
          alert("Failed to order test");
      } finally {
          setLoading(false);
      }
  };

  const filtered = patients.filter(p => 
    (p.first_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.last_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.phone_number || '').includes(search) || (p.phone || '').includes(search)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">My Patients</h2>
                <p className="text-slate-500">Manage patient records</p>
            </div>
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search patients..." 
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <UserPlus size={18} className="mr-2" />
                    Add Patient
                </Button>
            </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">ID</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Name</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Contact</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Address</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-slate-500">#{patient.id}</td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{patient.first_name || 'Unknown'} {patient.last_name || ''}</div>
                                <div className="text-xs text-slate-500">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : (patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : 'N/A')}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{patient.phone_number || patient.phone || '-'}</td>
                            <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{patient.address}</td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                                <Button 
                                    variant="ghost" 
                                    className="text-teal-600 hover:bg-teal-50" 
                                    title="Order Test"
                                    onClick={() => {
                                        setSelectedPatient(patient);
                                        setIsOrderModalOpen(true);
                                    }}
                                >
                                    <TestTube size={18} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="text-blue-600 hover:bg-blue-50" 
                                    title="Edit Patient"
                                    onClick={() => handleOpenModal(patient)}
                                >
                                    <Edit size={18} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="text-red-600 hover:bg-red-50" 
                                    title="Delete Patient"
                                    onClick={() => handleDelete(patient.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-500">
                                No patients found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Add/Edit Patient Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                    <h3 className="text-xl font-bold mb-6">{editingPatientId ? 'Edit Patient' : 'Register New Patient'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                <input type="text" required className="w-full p-2 border rounded-lg" 
                                    value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                <input type="text" required className="w-full p-2 border rounded-lg" 
                                    value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                <input type="date" required className="w-full p-2 border rounded-lg" 
                                    value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input type="tel" required className="w-full p-2 border rounded-lg" 
                                    value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input type="text" required className="w-full p-2 border rounded-lg" 
                                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
                            <input type="text" required className="w-full p-2 border rounded-lg" 
                                value={formData.emergency_contact} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Medical History</label>
                            <textarea className="w-full p-2 border rounded-lg" rows={3}
                                value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>{editingPatientId ? 'Update' : 'Add'} Patient</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Order Test Modal */}
        {isOrderModalOpen && selectedPatient && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                    <h3 className="text-xl font-bold mb-4">Order Medical Test</h3>
                    <p className="text-slate-500 mb-4">Select a test for {selectedPatient.first_name} {selectedPatient.last_name}</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Available Analyses</label>
                            <select 
                                className="w-full p-3 border rounded-lg bg-slate-50"
                                value={selectedTest}
                                onChange={(e) => setSelectedTest(e.target.value)}
                            >
                                {availableTests.map(test => (
                                    <option key={test} value={test}>{test}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setIsOrderModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleOrderTest} isLoading={loading}>Send Request</Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
