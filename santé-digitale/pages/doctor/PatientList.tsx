
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Patient } from '../../types';
import { Search, Eye, FileText, UserPlus, TestTube } from 'lucide-react';
import { Button } from '../../components/Button';

export const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form data for new patient
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
      const data = await api.get<Patient[]>('/patients/');
      setPatients(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await api.post('/patients/', formData);
          await fetchPatients();
          setIsModalOpen(false);
          setFormData({
              first_name: '', last_name: '', date_of_birth: '', phone_number: '', 
              address: '', emergency_contact: '', medical_history: ''
          });
          alert("Patient added successfully");
      } catch (e) {
          alert("Failed to add patient");
      } finally {
          setLoading(false);
      }
  };

  const handleOrderTest = async () => {
      if(!selectedPatient) return;
      setLoading(true);
      try {
          // Mock endpoint for ordering test
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
    p.phone_number.includes(search)
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
                <Button onClick={() => setIsModalOpen(true)}>
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
                                <div className="text-xs text-slate-500">{new Date(patient.date_of_birth).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{patient.phone_number}</td>
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
                                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50" title="View Details">
                                    <Eye size={18} />
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

        {/* Add Patient Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-6">Register New Patient</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
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
                            <Button type="submit" isLoading={loading}>Add Patient</Button>
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
