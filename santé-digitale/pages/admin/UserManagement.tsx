
import React, { useState } from 'react';
import { Users, Edit, Trash2, Shield, Plus, UserPlus } from 'lucide-react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';

export const UserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'patient' // Default
  });

  // Mock data for display since we might not have a full list users endpoint
  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Sarah Smith', email: 'sarah@dawini.com', role: 'doctor', status: 'active' },
    { id: 2, name: 'John Doe', email: 'john@gmail.com', role: 'patient', status: 'active' },
    { id: 3, name: 'Admin User', email: 'admin@dawini.com', role: 'admin', status: 'active' },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Use the specific auth register endpoint
        await api.post('/auth/register/', formData);
        
        // Update local UI state (Mocking the refresh since we don't have a getAllUsers endpoint in the new list)
        setUsers([...users, {
            id: Date.now(),
            name: `${formData.first_name} ${formData.last_name}`,
            email: formData.email,
            role: formData.role,
            status: 'active'
        }]);
        
        setIsModalOpen(false);
        setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'patient' });
        alert("User created successfully");
    } catch (e: any) {
        alert("Failed to create user: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
         <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                <p className="text-slate-500">Manage Doctors, Patients, and Admins</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <UserPlus size={18} className="mr-2" />
                Add New User
            </Button>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">User</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Role</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                      u.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>
                                    {u.role === 'admin' && <Shield size={10} className="mr-1"/>}
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${u.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                <span className="text-sm text-slate-600 capitalize">{u.status}</span>
                            </td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    <Edit size={16} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl">
                    <h3 className="text-xl font-bold mb-6">Add New User</h3>
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
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" required className="w-full p-2 border rounded-lg" 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input type="text" required className="w-full p-2 border rounded-lg" 
                                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                             <select className="w-full p-2 border rounded-lg" 
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="admin">Admin</option>
                             </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input type="password" required className="w-full p-2 border rounded-lg" 
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Create User</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};