
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, Download } from 'lucide-react';
import { Button } from '../components/Button';
import { ROUTES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { api } from '@/services/api';


export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const planName = searchParams.get('plan');
// Dans ton composant PaymentSuccess.tsx
useEffect(() => {
  const sessionId = new URLSearchParams(window.location.search).get('session_id');
  if (sessionId) {
    api.post('/api/upgrade-to-pro/', user).then(() => {
      alert("Bienvenue dans Dawini Pro !");
      navigate('/dashboard');
    });
  }
}, []);
  useEffect(() => {
    // Simulate verifying the session with the backend
    const verifyPayment = async () => {
        // api.post('/payments/verify-session/', { sessionId })
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
    };
    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {loading ? (
            <div className="py-12">
                <Loader2 size={48} className="animate-spin text-teal-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Verifying Payment...</h2>
                <p className="text-slate-500">Please wait while we confirm your subscription.</p>
            </div>
        ) : (
            <div className="animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
                <p className="text-slate-500 mb-6">
                    Thank you for subscribing to the <span className="font-bold text-slate-800">{planName}</span> plan. 
                    Your account has been upgraded instantly.
                </p>
                
                <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left border border-slate-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Amount Paid:</span>
                        <span className="font-bold text-slate-900">$49.00</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Transaction ID:</span>
                        <span className="font-mono text-xs text-slate-700">pi_3Mtw...2eZl</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Payment Method:</span>
                        <span className="font-medium text-slate-900">Visa ending in 4242</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button className="w-full justify-center" onClick={() => navigate(user ? ROUTES.DASHBOARD : ROUTES.REGISTER)}>
                        {user ? 'Go to Dashboard' : 'Complete Registration'} <ArrowRight size={18} className="ml-2" />
                    </Button>
                    <Button variant="secondary" className="w-full justify-center">
                        <Download size={18} className="mr-2" /> Download Receipt
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
