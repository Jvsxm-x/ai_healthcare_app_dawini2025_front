
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, Users, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface LogEntry {
  id: number;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  message: string;
}

export const AdminDashboard = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRetraining, setIsRetraining] = useState(false);

  useEffect(() => {
    // Load logs from session storage (simulating dynamic system logs)
    const loadLogs = () => {
        const stored = sessionStorage.getItem('system_logs');
        if (stored) {
            setLogs(JSON.parse(stored));
        }
    };
    loadLogs();
    
    // Poll for new logs every 2 seconds
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRetrain = async () => {
      setIsRetraining(true);
      try {
          await api.post('/retrain/', {});
          alert("Model retraining started successfully.");
      } catch (e) {
          alert("Failed to start retraining.");
      } finally {
          setIsRetraining(false);
      }
  };

  // Mock Data for Charts
  const userGrowthData = [
    { name: 'Mon', users: 120 },
    { name: 'Tue', users: 132 },
    { name: 'Wed', users: 145 },
    { name: 'Thu', users: 150 },
    { name: 'Fri', users: 170 },
    { name: 'Sat', users: 190 },
    { name: 'Sun', users: 210 },
  ];

  const roleDistribution = [
    { name: 'Patients', value: 850 },
    { name: 'Doctors', value: 45 },
    { name: 'Admins', value: 5 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">System Administration</h2>
            <p className="text-slate-500">Monitor system health, user activity, and AI models</p>
        </div>
        <Button onClick={handleRetrain} isLoading={isRetraining} variant="secondary">
            <RefreshCw size={18} className={`mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
            Retrain AI Model
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-300">System Status</h3>
                <Server className="text-green-400" size={20} />
            </div>
            <div className="text-2xl font-bold text-green-400">Online</div>
            <p className="text-xs text-slate-400 mt-2">API Reachable</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-500">Total Users</h3>
                <Users className="text-slate-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-900">1,240</div>
            <div className="flex gap-2 text-xs mt-2">
                <span className="text-green-600 font-medium">+12 this week</span>
            </div>
        </div>
        
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-500">AI Predictions</h3>
                <Activity className="text-purple-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-900">892</div>
             <p className="text-xs text-slate-400 mt-2">Last 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-500">System Alerts</h3>
                <AlertCircle className="text-orange-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-900">3</div>
            <p className="text-xs text-slate-400 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-6">User Growth (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-6">User Role Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={roleDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {roleDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                    {roleDistribution.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                            {entry.name}
                        </div>
                    ))}
                </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Live System Logs</h3>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs h-80 overflow-y-auto space-y-2">
                  {logs.length === 0 && <p className="text-slate-500 italic">No activity recorded yet.</p>}
                  {logs.map((log) => (
                      <div key={log.id} className="border-b border-slate-800 pb-1 last:border-0">
                          <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={`ml-2 font-bold ${log.method === 'GET' ? 'text-blue-400' : log.method === 'POST' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {log.method}
                          </span>
                          <span className="ml-2 text-slate-300">{log.endpoint}</span>
                          <span className={`ml-2 ${log.status >= 400 ? 'text-red-500' : 'text-green-500'}`}>
                              {log.status}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};