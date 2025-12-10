// src/pages/admin/ClinicStaffManagement.tsx

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Edit,
  Ban,
  CheckCircle,
  Plus,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import { adminApi } from '../../services/adminApi';
import { Clinic, User } from '../../types';
import toast from 'react-hot-toast';

interface ClinicStaff extends User {
  clinic?: string | { id: string; name: string };
}

export const ClinicStaffManagement = () => {
  const [staff, setStaff] = useState<ClinicStaff[]>([]);
  const [filtered, setFiltered] = useState<ClinicStaff[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<ClinicStaff | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: '',
    password: 'Temp123!',
    role: 'clinic_staff' as 'clinic_staff' | 'clinic_admin',
    clinic_id: '',
  });

  // Charger les cliniques
  const fetchClinics = async () => {
    try {
      const data = await api.get<Clinic[]>('/clinics/');
      setClinics(data);
    } catch (err) {
      toast.error('Impossible de charger les cliniques');
    }
  };

  // Charger le personnel clinique
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      const list = Array.isArray(response) ? response : response || [];
      const clinicStaff = list.filter(
        (u: any) => u.role === 'clinic_staff' || u.role === 'clinic_admin'
      );
      setStaff(clinicStaff);
      setFiltered(clinicStaff);
    } catch (err) {
      toast.error('Erreur lors du chargement du personnel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
    fetchStaff();
  }, []);

  // Filtre de recherche
  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      staff.filter((s) =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term)
      )
    );
  }, [search, staff]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Soumission : création via route dédiée
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStaff) {
        // Mise à jour simple via adminApi
        const payload: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          role: formData.role,
          clinic: formData.clinic_id,
        };

        await adminApi.updateUser(
          editingStaff._id || editingStaff.id.toString(),
          payload
        );
        toast.success('Membre mis à jour avec succès');
      } else {
        // Création via la nouvelle route dédiée
        const response = await api.post('/clinic/staff/', {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          username: formData.username,
          password: formData.password,
          role: formData.role,
          clinic: formData.clinic_id,
        });

        if (response) {
          toast.success('Membre clinique créé avec succès !');
        }
      }

      await fetchStaff(); // Rafraîchir la liste
      setModalOpen(false);
      setEditingStaff(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        username: '',
        password: 'Temp123!',
        role: 'clinic_staff',
        clinic_id: '',
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        'Erreur lors de la création';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await adminApi.updateUser(id, { is_active: !current });
      toast.success(current ? 'Compte désactivé' : 'Compte activé');
      fetchStaff();
    } catch (err) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const openEdit = (user: ClinicStaff) => {
    setEditingStaff(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      username: user.username || '',
      password: '',
      role: user.role as any,
      clinic_id:
        typeof user.clinic === 'object' ? user.clinic.id : user.clinic?.toString() || '',
    });
    setModalOpen(true);
  };

  const getClinicName = (clinicId?: string) => {
    if (!clinicId) return 'Aucune';
    const clinic = clinics.find(c => c.id?.toString() === clinicId || c._id === clinicId);
    return clinic?.name || 'Inconnue';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-4">
          <Building2 className="text-emerald-600" size={44} />
          Personnel des Cliniques
        </h1>
        <Button onClick={() => setModalOpen(true)} size="lg">
          <Plus size={20} className="mr-2" />
          Ajouter staff
        </Button>
      </div>

      {/* Recherche */}
      <div className="relative max-w-lg mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
        <input
          type="text"
          placeholder="Rechercher un membre..."
          className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 text-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(member => (
          <div
            key={member._id || member.id}
            className={`bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition ${
              !member.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {member.first_name[0]}{member.last_name[0]}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {member.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {member.first_name} {member.last_name}
            </h3>
            <p className="text-emerald-600 font-medium">
              {member.role === 'clinic_admin' ? 'Admin Clinique' : 'Staff'}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {getClinicName(
                typeof member.clinic === 'object' ? member.clinic.id : member.clinic?.toString()
              )}
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Mail size={16} /> {member.email}</p>
              {member.phone && <p className="flex items-center gap-2"><Phone size={16} /> {member.phone}</p>}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" onClick={() => openEdit(member)} className="flex-1">
                <Edit size={18} className="mr-2" /> Modifier
              </Button>
              <Button
                variant={member.is_active ? 'danger' : 'primary'}
                onClick={() => toggleActive(member._id || member.id.toString(), member.is_active)}
                className="flex-1"
              >
                {member.is_active ? <>Désactiver</> : <>Activer</>}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto p-10" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-8">
              {editingStaff ? 'Modifier le membre' : 'Nouveau membre clinique'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tous les champs comme avant */}
              <div><label>Prénom *</label><input name="first_name" required value={formData.first_name} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label>Nom *</label><input name="last_name" required value={formData.last_name} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label>Email *</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label>Username *</label><input name="username" required value={formData.username} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label>Téléphone</label><input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" /></div>
              <div><label>Rôle *</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl">
                  <option value="clinic_staff">Staff Clinique</option>
                  <option value="clinic_admin">Admin Clinique</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label>Clinique *</label>
                <select name="clinic_id" required value={formData.clinic_id} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl">
                  <option value="">Choisir...</option>
                  {clinics.map(c => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {!editingStaff && (
                <div className="md:col-span-2">
                  <label>Mot de passe temporaire</label>
                  <input type="text" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl" />
                  <p className="text-xs text-slate-500 mt-1">L'utilisateur devra le changer à la 1ère connexion</p>
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button type="submit" isLoading={submitting}>
                  {editingStaff ? 'Enregistrer' : 'Créer le compte'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicStaffManagement;