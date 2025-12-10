// src/pages/clinic/staff/LabOrdersList.tsx

import React, { useEffect, useState } from 'react';
import { Search, Plus, FileText, Clock, CheckCircle, XCircle, Filter, Download, Eye } from 'lucide-react';
import { useClinicId } from '../../../hooks/useClinicId';
import { api } from '../../../services/api';
import { Button } from '../../../components/Button';
import toast from 'react-hot-toast';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface LabOrder {
  _id: string;
  doctor_username: string;
  patient_username: string;
  patient_name?: string;
  test_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  comment: string;
  result: string;
  ordered_at: string;
  completed_at?: string | null;
}

export const LabOrdersList = () => {
  const clinicId = useClinicId();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [filtered, setFiltered] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
const {user}=useAuth();

  // Formulaire pour compléter une analyse
  const [resultForm, setResultForm] = useState({
    result: '',
    comment: ''
  });

  useEffect(() => {
    if (!clinicId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.get<LabOrder[]>(`/clinics/${clinicId}/lab-orders/`);
        
        // Enrichir avec le nom du patient si possible
        const enriched = await Promise.all(
          data.map(async (order) => {
            try {
              const patient = await api.get(`/patients/profile/${order.patient_username}/`);
              const p=Array.isArray(patient) ? patient : patient || [] ;
              const patients=p as User

              return { ...order, patient_name: `${patients.first_name} ${patients.last_name}` };
            } catch {
              return { ...order, patient_name: order.patient_username };
            }
          })
        );

        setOrders(enriched);
        setFiltered(enriched);
      } catch (err) {
        toast.error('Erreur lors du chargement des analyses');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [clinicId]);

  // Filtrage
  useEffect(() => {
    let filteredList = orders;

    if (filter !== 'all') {
      filteredList = filteredList.filter(o => o.status === filter);
    }

    if (search) {
      filteredList = filteredList.filter(o =>
        o.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.test_name.toLowerCase().includes(search.toLowerCase()) ||
        o.doctor_username.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(filteredList);
  }, [search, filter, orders]);

  // Compléter une analyse
  const handleComplete = async () => {
    if (!selectedOrder || !resultForm.result.trim()) {
      toast.error('Le résultat est obligatoire');
      return;
    }

    try {
      await api.patch(`/lab/order/${selectedOrder._id}/`, {
        status: 'completed',
        result: resultForm.result,
        comment: resultForm.comment,
        completed_at: new Date().toISOString(),
        user:user
      });

      toast.success('Analyse complétée !');
      setModalOpen(false);
      setSelectedOrder(null);
      setResultForm({ result: '', comment: '' });

      // Recharger
      const data = await api.get<LabOrder[]>(`/clinics/${clinicId}/lab-orders/`);
      setOrders(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur');
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (!clinicId) {
    return <div className="p-8 text-center text-red-600 text-xl">Aucune clinique sélectionnée</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-4">
            <FileText className="text-indigo-600" size={44} />
            Analyses de Laboratoire
          </h1>
          <p className="text-slate-500 mt-2">Suivi des ordonnances et résultats</p>
        </div>
        <Button onClick={() => {/* TODO: modal création */}} size="lg">
          <Plus size={20} className="mr-2" />
          Nouvelle ordonnance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={28} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">En attente</p>
              <h3 className="text-3xl font-bold text-orange-600">{stats.pending}</h3>
            </div>
            <Clock className="text-orange-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Complétées</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.completed}</h3>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher patient, test..."
            className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Complétées'}
            </Button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500">Aucune analyse trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Test</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Prescrit par</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{ order.patient_username.split('@')[0]}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-indigo-700">{order.test_name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      Dr. {order.doctor_username.split('@')[0]}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.ordered_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status === 'completed' ? 'Terminé' :
                         order.status === 'cancelled' ? 'Annulé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setResultForm({ result: order.result, comment: order.comment });
                            setModalOpen(true);
                          }}
                        >
                          <CheckCircle size={18} className="mr-2" />
                          Compléter
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedOrder(order);
                          setModalOpen(true);
                        }}>
                          <Eye size={18} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal résultat */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-8 text-center text-slate-900">
              {selectedOrder.status === 'pending' ? 'Compléter l’analyse' : 'Résultat de l’analyse'}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-slate-500">Patient :</span>
                  <p className="font-bold">{selectedOrder.patient_name || selectedOrder.patient_username}</p>
                </div>
                <div>
                  <span className="text-slate-500">Test :</span>
                  <p className="font-bold text-indigo-700">{selectedOrder.test_name}</p>
                </div>
              </div>

              {selectedOrder.status === 'pending' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Résultat *</label>
                  <textarea
                    required
                    value={resultForm.result}
                    onChange={e => setResultForm(p => ({...p, result: e.target.value}))}
                    className="w-full px-5 py-4 border-2 rounded-xl h-40 resize-none focus:ring-4 focus:ring-indigo-100"
                    placeholder="Ex: Glycémie : 1.2 g/L&#10;Cholestérol total : 2.1 g/L..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Résultat</label>
                  <div className="bg-slate-50 p-5 rounded-xl font-mono text-sm whitespace-pre-wrap">
                    {selectedOrder.result || 'Aucun résultat saisi'}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Commentaire (optionnel)</label>
                <textarea
                  value={resultForm.comment}
                  onChange={e => setResultForm(p => ({...p, comment: e.target.value}))}
                  className="w-full px-5 py-4 border-2 rounded-xl h-24 resize-none"
                  placeholder="Remarques du biologiste..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  {selectedOrder.status === 'pending' ? 'Annuler' : 'Fermer'}
                </Button>
                {selectedOrder.status === 'pending' && (
                  <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
                    Compléter l’analyse
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};