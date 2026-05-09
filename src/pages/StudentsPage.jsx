import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { GraduationCap, Search, Plus, Filter, MoreHorizontal, Edit, Trash2, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StudentsPage() {
  const { t } = useLang();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ matricule_etud: '', nom: '', prenom: '', email: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ 
        matricule_etud: student.matricule_etud, 
        nom: student.nom, 
        prenom: student.prenom, 
        email: student.email || '' 
      });
    } else {
      setEditingStudent(null);
      setFormData({ matricule_etud: '', nom: '', prenom: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id_etudiant, formData);
        toast.success('Student updated successfully');
      } else {
        await api.createStudent(formData);
        toast.success('Student created successfully');
      }
      fetchStudents();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.students.deleteConfirm)) {
      try {
        await api.deleteStudent(id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (err) {
        toast.error('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.nom.toLowerCase().includes(search.toLowerCase()) || 
    s.prenom.toLowerCase().includes(search.toLowerCase()) ||
    s.matricule_etud.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.students.title}</h1>
          <p className="text-sm text-muted mt-1">Manage university student transport subscriptions</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={18} /> {t.students.addStudent}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-surface-alt transition-colors">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">{t.students.matricule}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">{t.students.line}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">{t.common.status}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-surface-alt/20"></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">{t.common.noData}</td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id_etudiant} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{s.matricule_etud}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                          {s.prenom[0]}{s.nom[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{s.prenom} {s.nom}</div>
                          <div className="text-xs text-muted">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.ligne_actuelle ? (
                        <span className="text-sm font-medium text-foreground">{s.ligne_actuelle}</span>
                      ) : (
                        <span className="text-xs text-muted italic">No line assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.ligne_actuelle ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">
                          {t.students.subscribed}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">
                          {t.students.unsubscribed}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(s)}
                          className="p-2 hover:bg-primary-light text-muted hover:text-primary rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id_etudiant)}
                          className="p-2 hover:bg-red-50 text-muted hover:text-danger rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-surface w-full max-w-md rounded-2xl shadow-2xl animate-slide-up border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">{editingStudent ? t.students.editStudent : t.students.addStudent}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-surface-alt rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">{t.students.matricule}</label>
                <input 
                  type="text" required
                  value={formData.matricule_etud}
                  onChange={(e) => setFormData({...formData, matricule_etud: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="202200001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.students.firstName}</label>
                  <input 
                    type="text" required
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">{t.students.lastName}</label>
                  <input 
                    type="text" required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="nom.prenom@etu.usthb.dz"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-surface-alt transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
