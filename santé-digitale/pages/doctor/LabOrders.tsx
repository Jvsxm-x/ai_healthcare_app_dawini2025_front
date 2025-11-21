
import React, { useState, useEffect } from 'react';
import { TestTube, CheckCircle, Clock, FileText, Sparkles } from 'lucide-react';
import { LabOrder } from '../../types';
import { api } from '../../services/api';

export const LabOrders = () => {
  const [orders, setOrders] = useState<LabOrder[]>([]);

  useEffect(() => {
    // Fetch orders (Mocked for now)
    const mockOrders: LabOrder[] = [
        { 
            id: 1, patient_id: 1, doctor_id: 2, patient_name: 'John Doe', 
            test_name: 'Complete Blood Count', status: 'completed', requested_at: '2023-10-25T10:00:00',
            ai_summary: 'Analysis indicates elevated leukocytes. Possible infection.'
        },
        { 
            id: 2, patient_id: 3, doctor_id: 2, patient_name: 'Jane Smith', 
            test_name: 'MRI Brain', status: 'pending', requested_at: '2023-10-26T09:00:00'
        }
    ];
    setOrders(mockOrders);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Lab Orders & Analysis</h2>
        <p className="text-slate-500">Track requested tests and view AI-enhanced results</p>
      </div>

      <div className="space-y-4">
          {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                              <TestTube size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-slate-900">{order.test_name}</h3>
                              <p className="text-slate-500">Patient: <span className="font-medium text-slate-800">{order.patient_name}</span></p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                  <Clock size={12} /> Requested: {new Date(order.requested_at).toLocaleDateString()}
                              </div>
                          </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                          {order.status}
                      </span>
                  </div>

                  {order.status === 'completed' && order.ai_summary && (
                      <div className="mt-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex gap-3">
                          <Sparkles className="text-indigo-600 shrink-0" size={20} />
                          <div>
                              <h4 className="font-bold text-indigo-900 text-sm">AI Analysis Result</h4>
                              <p className="text-indigo-800 text-sm mt-1">{order.ai_summary}</p>
                          </div>
                      </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                       {order.status === 'completed' ? (
                           <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                               <FileText size={16} /> View Original Report
                           </button>
                       ) : (
                           <span className="text-sm text-slate-400 italic">Waiting for patient upload...</span>
                       )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
