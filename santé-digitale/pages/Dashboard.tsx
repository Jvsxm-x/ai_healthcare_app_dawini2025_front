
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MedicalStats, Alert, LabOrder, User } from '../types';
import { Activity, Heart, Droplet, Bell, Wind, FileText, Upload, Sparkles } from 'lucide-react';
import { ROUTES } from '../constants';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MedicalStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [uploadingOrderId, setUploadingOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize Patient Profile as requested
        const userData = await api.post<User>('/patients/', {});
        
        const statsData = await api.get<MedicalStats>('/records/stats/');
        setStats(statsData);
        
        const alertsData = await api.get<Alert[]>('/alerts/');
        setAlerts(alertsData);

        // Fetch Lab Orders (mocked endpoint for now if not available)
        // In production: await api.get<LabOrder[]>('/medical/lab_orders/');
        // Simulating response:
        const mockOrders: LabOrder[] = [
            { 
                id: 1, patient_id: 1, doctor_id: 2, patient_name: user?.username || 'Me', 
                test_name: 'Complete Blood Count', status: 'pending', requested_at: new Date().toISOString() 
            }
        ];
        setLabOrders(mockOrders);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [user?.username]);

  const handleFileUpload = async (orderId: number, file: File) => {
      setUploadingOrderId(orderId);
      try {
          // Mock uploading file and getting AI analysis
          // await api.upload(`/medical/lab_orders/${orderId}/upload`, file);
          
          // Simulate AI Processing delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Simulate AI Result extraction
          const mockAnalysis = "AI Analysis: The uploaded document indicates elevated leukocytes, suggesting a potential mild infection. Hemoglobin levels are normal.";
          setAiInsight(mockAnalysis);

          // Update local state
          setLabOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', ai_summary: mockAnalysis } : o));
          alert("File uploaded successfully! AI analysis complete.");
      } catch (e) {
          alert("Upload failed");
      } finally {
          setUploadingOrderId(null);
      }
  };

  const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold text-slate-900">{value !== null && value !== undefined ? Math.round(value) : '-'}</h3>
            <span className="text-sm text-slate-400">{unit}</span>
        </div>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500">Overview for {user?.username}</p>
        </div>

        {aiInsight && (
            <div className="mb-8 bg-indigo-50 border border-indigo-200 p-6 rounded-xl flex gap-4 animate-fade-in">
                <div className="bg-indigo-100 p-3 rounded-full h-fit">
                    <Sparkles className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-lg mb-1">New AI Health Insight Available</h3>
                    <p className="text-indigo-700">{aiInsight}</p>
                    <Button variant="ghost" className="mt-2 text-indigo-700 hover:bg-indigo-100 pl-0" onClick={() => setAiInsight(null)}>Dismiss</Button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Avg Systolic BP" 
            value={stats?.avg_systolic} 
            unit="mmHg"
            icon={Activity} 
            color="bg-red-500" 
          />
          <StatCard 
            title="Avg Diastolic BP" 
            value={stats?.avg_diastolic} 
            unit="mmHg"
            icon={Wind} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Avg Glucose" 
            value={stats?.avg_glucose} 
            unit="mg/dL"
            icon={Droplet} 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Avg Heart Rate" 
            value={stats?.avg_heart_rate} 
            unit="bpm"
            icon={Heart} 
            color="bg-rose-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 {/* Doctor Requests Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="text-teal-600" size={20}/> Doctor Analysis Requests
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {labOrders.filter(o => o.status === 'pending').map(order => (
                            <div key={order.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
                                <div>
                                    <p className="font-bold text-slate-900">{order.test_name}</p>
                                    <p className="text-sm text-slate-500">Requested by Dr. {order.doctor_id}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf,.jpg,.png"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleFileUpload(order.id, e.target.files[0]);
                                            }}
                                        />
                                        <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${uploadingOrderId === order.id ? 'bg-slate-200 text-slate-500' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                                            {uploadingOrderId === order.id ? (
                                                <>Processing...</>
                                            ) : (
                                                <><Upload size={16} /> Upload Result</>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ))}
                        {labOrders.filter(o => o.status === 'pending').length === 0 && (
                             <p className="text-slate-500 italic">No pending analysis requests.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Recent Alerts</h3>
                        <Link to={ROUTES.MEDICAL_DATA} className="text-teal-600 text-sm font-medium hover:underline">View Data</Link>
                    </div>
                    
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <div key={alert.id} className={`p-4 rounded-lg border-l-4 flex justify-between items-start ${
                                alert.severity === 'high' ? 'bg-red-50 border-red-500' : 
                                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'
                            }`}>
                                <div className="flex gap-3">
                                    <Bell size={20} className={
                                        alert.severity === 'high' ? 'text-red-600' : 
                                        alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                                    } />
                                    <div>
                                        <p className="text-slate-900 font-medium">{alert.message}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                {!alert.is_read && <span className="h-2 w-2 bg-red-500 rounded-full"></span>}
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <Bell size={48} className="mx-auto text-slate-200 mb-2" />
                                No alerts found. You are doing great!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-teal-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-fit">
                <div>
                    <h3 className="text-xl font-bold mb-2">AI Health Analysis</h3>
                    <p className="text-teal-200 text-sm mb-6">
                        Use our machine learning model to predict potential health risks based on your latest vitals.
                    </p>
                </div>
                <Link to={ROUTES.ANALYSIS} className="block w-full py-3 bg-white text-teal-900 text-center font-bold rounded-lg hover:bg-teal-50 transition-colors">
                    Run Analysis
                </Link>
            </div>
        </div>
    </div>
  );
};
