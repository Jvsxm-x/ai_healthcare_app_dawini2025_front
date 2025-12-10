// src/pages/clinic/portal/ClinicManageDoctors.tsx

import React, { useEffect, useState } from 'react';
import { Search, Plus, UserPlus, Stethoscope, X, Check } from 'lucide-react';
import { useClinicId } from '../../../hooks/useClinicId';
import { api } from '../../../services/api';
import { Button } from '../../../components/Button';
import toast from 'react-hot-toast';

interface Doctor {
  _id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  specialty?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  rating?: number;
  location?: string;
  years_experience?: number;
  consultation_price?: number;
  is_verified?: boolean;
}

export const ClinicManageDoctors = () => {
  const clinicId = useClinicId();
  const [associatedDoctors, setAssociatedDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);

  // Formulaire complet pour nouveau médecin
  const [newDoctor, setNewDoctor] = useState({
    username: '',
    email: '',
    password: 'Temp2025!',
    first_name: '',
    last_name: '',
    phone: '',
    specialty: '',
    bio: '',
    location: 'Cabinet non précisé',
    years_experience: 0,
    consultation_price: 0,
    avatar_url: '',
  });

  // Charger les médecins associés + tous les médecins
  useEffect(() => {
    if (!clinicId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [assocRes, allRes] = await Promise.all([
          api.get(`/clinics/${clinicId}/doctorslist/`),     // médecins associés
          api.get('/doctors/')                          // tous les docteurs
        ]);

        const associated = Array.isArray(assocRes) ? assocRes : assocRes || [];
        const all = Array.isArray(allRes) ? allRes : allRes || [];

        setAssociatedDoctors(associated as Doctor[]);
        setAllDoctors(all as Doctor[]);
      } catch (err) {
        toast.error('Erreur lors du chargement des médecins');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clinicId]);

  // Médecins non encore associés
  const availableDoctors = allDoctors.filter(
    doc => !associatedDoctors.some(a => a._id === doc._id)
  );

  const filteredAvailable = availableDoctors.filter(doc =>
    `${doc.first_name} ${doc.last_name} ${doc.email} ${doc.specialty || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Associer un médecin existant
  const handleAssociate = async (doctorId: string) => {
    try {
      await api.post(`/clinics/${clinicId}/doctors/associate/`, {
        doctor_id: doctorId
      });
      toast.success('Médecin associé avec succès !');
      const res = await api.get(`/clinics/${clinicId}/doctorslist/`);
                  const  doctor_liste=Array.isArray(res) ? res : res || [] ;

      setAssociatedDoctors(doctor_liste as Doctor[]);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur');
    }
  };

  // Créer un nouveau médecin + l’associer
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/doctors/create-for-clinic/', {
        ...newDoctor,
        clinic: clinicId,
        role: 'doctor',
        is_verified: false,
        rating: 0.0,
        years_experience: Number(newDoctor.years_experience),
        consultation_price: Number(newDoctor.consultation_price),
      });

      toast.success('Nouveau médecin créé et associé à la clinique !');
      setModalOpen(false);
      setCreatingNew(false);

      // Recharger la liste
      const res = await api.get(`/clinics/${clinicId}/doctorslist/`);
            const  doctor_liste=Array.isArray(res) ? res : res || [] ;

      setAssociatedDoctors(doctor_liste as Doctor[]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || 'Erreur lors de la création';
      toast.error(errorMsg);
    }
  };

  if (!clinicId) {
    return <div className="p-8 text-center text-red-600 text-xl">Aucune clinique sélectionnée</div>;
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement des médecins...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-4">
          <Stethoscope className="text-emerald-600" size={44} />
          Gestion des Médecins
        </h1>
        <Button onClick={() => setModalOpen(true)} size="lg">
          <Plus size={20} className="mr-2" />
          Ajouter un médecin
        </Button>
      </div>

      {/* Liste des médecins associés */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Médecins de la clinique ({associatedDoctors.length})</h2>
        {associatedDoctors.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
            Aucun médecin associé pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {associatedDoctors.map(doc => (
              <div key={doc._id} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {doc.first_name[0]}{doc.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Dr. {doc.first_name} {doc.last_name}</h3>
                    <p className="text-sm text-emerald-600 font-medium">{doc.specialty || 'Généraliste'}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>{doc.email}</p>
                  {doc.phone && <p>{doc.phone}</p>}
                  {doc.consultation_price > 0 && <p className="font-medium text-emerald-700">{doc.consultation_price} TND / consultation</p>}
                </div>
                {doc.bio && <p className="mt-3 text-xs text-slate-500 italic">{doc.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-screen overflow-y-auto p-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                {creatingNew ? 'Créer un nouveau médecin' : 'Associer un médecin existant'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={36} />
              </button>
            </div>

            {!creatingNew ? (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input
                  type="text"
                  placeholder="Rechercher un médecin..."
                  className="w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 text-lg"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredAvailable.length === 0 ? (
                  <p className="text-center py-12 text-slate-500 text-lg">
                    {searchTerm ? 'Aucun résultat' : 'Tous les médecins sont déjà associés'}
                  </p>
                ) : (
                  filteredAvailable.map(doc => (
                    <div key={doc._id} className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl hover:from-emerald-50 hover:to-emerald-100 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {doc.first_name[0]}{doc.last_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-lg">Dr. {doc.first_name} {doc.last_name}</p>
                          <p className="text-sm text-slate-600">{doc.specialty || 'Généraliste'} • {doc.email}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleAssociate(doc._id)} size="sm">
                        <Check size={20} className="mr-2" />
                        Associer
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-10 text-center">
                <Button variant="secondary" size="lg" onClick={() => setCreatingNew(true)}>
                  <Plus size={24} className="mr-3" />
                  Créer un nouveau médecin
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateDoctor} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                  <input required value={newDoctor.first_name} onChange={e => setNewDoctor(p => ({...p, first_name: e.target.value}))} className="w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100" placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
                  <input required value={newDoctor.last_name} onChange={e => setNewDoctor(p => ({...p, last_name: e.target.value}))} className="w-full px-5 py-4 border-2 rounded-xl" placeholder="Nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input type="email required value={newDoctor.email} onChange={e => setNewDoctor(p => ({...p, email: e.target.value}))}" className="w-full px-5 py-4 border-2 rounded-xl" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom d'utilisateur *</label>
                  <input required value={newDoctor.username} onChange={e => setNewDoctor(p => ({...p, username: e.target.value}))} className="w-full px-5 py-4 border-2 rounded-xl" placeholder="dr.nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                  <input value={newDoctor.phone} onChange={e => setNewDoctor(p => ({...p, phone: e.target.value}))} className="w-full px-5 py-4 border-2 rounded-xl" placeholder="+216 ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Spécialité</label>
                  <input value={newDoctor.specialty} onChange={e => setNewDoctor(p => ({...p, specialty: e.target.value}))} className="w-full px-5 py-4 border-2 rounded-xl" placeholder="Cardiologue, Pédiatre..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prix consultation (TND)</label>
                  <input type="number" value={newDoctor.consultation_price} onChange={e => setNewDoctor(p => ({...p, consultation_price: Number(e.target.value)}))} className="w-full px-5 py-4 border-2 rounded-xl" placeholder="250" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Années d'expérience</label>
                  <input type="number" value={newDoctor.years_experience} onChange={e => setNewDoctor(p => ({...p, years_experience: Number(e.target.value)}))} className="w-full px-5 py-4 border-2 rounded-xl" placeholder="5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio / Présentation</label>
                <textarea
                  value={newDoctor.bio}
                  onChange={e => setNewDoctor(p => ({...p, bio: e.target.value}))}
                  className="w-full px-5 py-4 border-2 rounded-xl h-32 resize-none"
                  placeholder="Médecin généraliste passionné par..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lieu de consultation</label>
                <input
                  value={newDoctor.location}
                  onChange={e => setNewDoctor(p => ({...p, location: e.target.value}))}
                  className="w-full px-5 py-4 border-2 rounded-xl"
                  placeholder="Cabinet El Menzah, Tunis"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="secondary" onClick={() => setCreatingNew(false)}>
                  Retour
                </Button>
                <Button type="submit" size="lg">
                  Créer le médecin et l’associer
                </Button>
              </div>
            </form>
          )}
          </div>
        </div>
      )}
    </div>
  );
};