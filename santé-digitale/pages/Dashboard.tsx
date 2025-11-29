import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSaaS } from '../context/SaaSContext';
import { api } from '../services/api';
import { Alert as AlertType } from '../types';
import { Activity, Heart, Droplet, Bell, Wind, FileText, Upload, Sparkles, AlertTriangle, Database } from 'lucide-react';
import { ROUTES } from '../constants';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

interface StatsSummary {
  systolic: { avg: number | null };
  diastolic: { avg: number | null };
  glucose: { avg: number | null };
  heart_rate: { avg: number | null };
}

interface BackendStatsResponse {
  series: { timestamps: string[] };
  summary: StatsSummary;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const { storageUsed, storageLimit, usagePercentage } = useSaaS();

  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 1. Stats vitales (30 jours)
        const statsRes = await api.get<BackendStatsResponse>('/records/stats/?days=30');
        setStats(statsRes.summary);

        // 2. Alertes récentes
        const alertsRes = await api.get<AlertType[]>('/alerts/');
        setAlerts(alertsRes.slice(0, 10));

      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        // Ne bloque pas l'UI si une requête échoue
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-slate-900">
            {loading ? '...' : value !== null && value !== undefined ? Math.round(value) : '-'}
          </h3>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user?.first_name || user?.username}</h2>
          <p className="text-slate-500 mt-1">Here is your health overview</p>
        </div>

        {/* Storage Widget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full md:w-80">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
              <Database size={16} /> Storage Usage
            </span>
            <Link to={ROUTES.PRICING} className="text-sm text-teal-600 font-bold hover:underline">
              Upgrade Plan
            </Link>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{(storageUsed / 1024 / 1024).toFixed(1)} MB used</span>
            <span>{(storageLimit / 1024 / 1024 / 1024).toFixed(1)} GB limit</span>
          </div>
        </div>
      </div>

      {/* Email Verification Banner */}
      {!user?.is_verified && (
        <div className="mb-8 bg-amber-50 border border-amber-300 p-5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-amber-600" size={28} />
            <div>
              <h4 className="font-bold text-amber-900">Verify your email to unlock AI features</h4>
              <p className="text-amber-700 text-sm">Advanced health insights require email verification.</p>
            </div>
          </div>
          <Button variant="secondary" className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100">
            Resend Verification
          </Button>
        </div>
      )}

      {/* AI Insight */}
      {aiInsight && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-6 rounded-xl flex gap-5 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Sparkles className="text-indigo-600" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-indigo-900 text-lg mb-2">AI Health Insight</h3>
            <p className="text-indigo-700">{aiInsight}</p>
            <button onClick={() => setAiInsight(null)} className="text-sm text-indigo-600 hover:underline mt-3">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Vital Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Systolic BP"   value={stats?.systolic.avg}    unit="mmHg" icon={Activity} color="bg-red-500" />
        <StatCard title="Diastolic BP"  value={stats?.diastolic.avg}   unit="mmHg" icon={Wind}     color="bg-blue-500" />
        <StatCard title="Glucose"       value={stats?.glucose.avg}     unit="mg/dL" icon={Droplet}  color="bg-yellow-500" />
        <StatCard title="Heart Rate"    value={stats?.heart_rate.avg}  unit="bpm"  icon={Heart}    color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="text-teal-600" /> Recent Alerts
            </h3>
            <Link to={ROUTES.ALERTS} className="text-teal-600 text-sm font-medium hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-500">
                <Bell size={56} className="mx-auto text-slate-200 mb-3" />
                <p>No alerts – everything looks good!</p>
              </div>
            )}

            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                  alert.level === 'high' ? 'bg-red-50 border-red-500' :
                  alert.level === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <Bell size={20} className={
                  alert.level === 'high' ? 'text-red-600' :
                  alert.level === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                } />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(alert.created_at).toLocaleDateString()} at {new Date(alert.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-8 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-3">AI Risk Prediction</h3>
            <p className="text-teal-100 text-sm leading-relaxed">
              Get instant insights from our machine learning model trained on thousands of patient records.
            </p>
          </div>
          <Link
            to={ROUTES.ANALYSIS}
            className="mt-8 block text-center py-4 bg-white text-teal-700 font-bold rounded-lg hover:bg-teal-50 transition-all transform hover:scale-105"
          >
            Run AI Analysis
          </Link>
        </div>
      </div>
    </div>
  );
};