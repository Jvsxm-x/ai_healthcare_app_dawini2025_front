import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MedicalRecord } from '../types';
import { Activity, Plus, Heart, Droplet } from 'lucide-react';
import { Button } from '../components/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const MedicalData = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    systolic: '',
    diastolic: '',
    glucose: '',
    heart_rate: '',
    notes: ''
  });

  const fetchRecords = async () => {
    try {
      const data = await api.get<MedicalRecord[]>('/records/');
      // Sort by created_at descending for list, ascending for chart
      setRecords(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post('/records/', {
            systolic: parseInt(newRecord.systolic),
            diastolic: parseInt(newRecord.diastolic),
            glucose: parseInt(newRecord.glucose),
            heart_rate: parseInt(newRecord.heart_rate),
            notes: newRecord.notes
        });
        setIsModalOpen(false);
        setNewRecord({ systolic: '', diastolic: '', glucose: '', heart_rate: '', notes: '' });
        fetchRecords();
    } catch (e) {
        alert("Failed to add record");
    }
  };

  const chartData = [...records].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(r => ({
      date: new Date(r.created_at).toLocaleDateString(),
      systolic: r.systolic,
      diastolic: r.diastolic,
      glucose: r.glucose,
      hr: r.heart_rate
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
          <div>
              <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
              <p className="text-slate-500">History of your vital signs</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}><Plus size={16} className="mr-2"/> Add Measurement</Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-red-500"/> Blood Pressure
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Droplet size={20} className="text-yellow-500"/> Glucose & Heart Rate
              </h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="glucose" stroke="#eab308" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">BP (mmHg)</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Glucose (mg/dL)</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Heart Rate (bpm)</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Notes</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {records.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 text-sm">{new Date(rec.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600">{rec.systolic}/{rec.diastolic}</td>
                        <td className="px-6 py-4 text-slate-600">{rec.glucose}</td>
                        <td className="px-6 py-4 text-slate-600">{rec.heart_rate}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm italic">{rec.notes || '-'}</td>
                    </tr>
                ))}
                {records.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No records found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Measurement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Systolic BP</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={newRecord.systolic} onChange={e => setNewRecord({...newRecord, systolic: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Diastolic BP</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={newRecord.diastolic} onChange={e => setNewRecord({...newRecord, diastolic: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Glucose</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={newRecord.glucose} onChange={e => setNewRecord({...newRecord, glucose: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Heart Rate</label>
                        <input type="number" className="w-full p-2 border rounded-lg" required value={newRecord.heart_rate} onChange={e => setNewRecord({...newRecord, heart_rate: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea className="w-full p-2 border rounded-lg" rows={2} value={newRecord.notes} onChange={e => setNewRecord({...newRecord, notes: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Record</Button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
