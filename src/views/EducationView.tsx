import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Building2,
  BookOpen
} from 'lucide-react';
import { educationApi } from '../services/api';
import { Education, EducationStatus } from '../types';

const STATUS_MAP: Record<EducationStatus, { label: string; color: string }> = {
  CONCLUIDO: { label: 'Concluído', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60' },
  TRANCADO: { label: 'Trancado', color: 'bg-amber-950/80 text-amber-300 border-amber-800/60' },
  INCOMPLETO: { label: 'Incompleto', color: 'bg-slate-800 text-slate-400 border-slate-700' },
};

const DEGREES = [
  'Bacharelado',
  'Tecnólogo',
  'Licenciatura',
  'Pós-Graduação / Especialização',
  'Mestrado (MSc)',
  'Doutorado (PhD)',
  'MBA Executivo',
];

export const EducationView: React.FC = () => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('Bacharelado');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [status, setStatus] = useState<EducationStatus>('CONCLUIDO');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Alerts
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEducation = async () => {
    try {
      const data = await educationApi.getAll();
      setEducations(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar formação acadêmica.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const openCreateModal = () => {
    setEditingEdu(null);
    setInstitution('');
    setDegree('Bacharelado');
    setFieldOfStudy('');
    setStatus('CONCLUIDO');
    setStartDate('');
    setEndDate('');
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (edu: Education) => {
    setEditingEdu(edu);
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setFieldOfStudy(edu.fieldOfStudy);
    setStatus(edu.status);
    setStartDate(edu.startDate);
    setEndDate(edu.endDate || '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !fieldOfStudy.trim() || !startDate) {
      setError('Instituição, curso e data de início são obrigatórios.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (editingEdu) {
        await educationApi.update(editingEdu.id, {
          institution,
          degree,
          fieldOfStudy,
          status,
          startDate,
          endDate: endDate || undefined,
        });
        setSuccess(`Formação acadêmica atualizada com sucesso!`);
      } else {
        await educationApi.create({
          institution,
          degree,
          fieldOfStudy,
          status,
          startDate,
          endDate: endDate || undefined,
        });
        setSuccess(`Formação acadêmica cadastrada!`);
      }
      setIsModalOpen(false);
      await fetchEducation();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar formação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (edu: Education) => {
    if (!confirm(`Deseja remover "${edu.fieldOfStudy}"?`)) return;
    try {
      await educationApi.delete(edu.id);
      setSuccess(`Formação acadêmica removida.`);
      await fetchEducation();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover formação.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top action header */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#BC9EFD]" />
            Formação Acadêmica ({educations.length})
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Graduações, cursos técnicos, especializações e pós-graduações concluídas ou em curso.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-semibold text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Formação</span>
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#A7A5B4]">Carregando formação acadêmica...</p>
        </div>
      ) : educations.length === 0 ? (
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center mx-auto text-[#A7A5B4]">
            <GraduationCap className="w-6 h-6 text-[#BC9EFD]" />
          </div>
          <h3 className="text-base font-bold text-[#F5F4F8]">Nenhuma formação acadêmica cadastrada</h3>
          <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
            Cadastre seu curso de graduação ou pós-graduação para certificar sua base formal perante contratantes.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Formação
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educations.map((edu) => {
            const st = STATUS_MAP[edu.status] || STATUS_MAP.CONCLUIDO;
            return (
              <div
                key={edu.id}
                className="group rounded-2xl bg-[#222230] border border-[#2D2D40] p-5 hover:border-[#8B6BD9]/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#A7A5B4]">
                      <Building2 className="w-3.5 h-3.5 text-[#BC9EFD]" />
                      {edu.institution}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${st.color}`}
                    >
                      {st.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors">
                    {edu.fieldOfStudy}
                  </h3>

                  <div className="text-xs font-medium text-[#BC9EFD] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{edu.degree}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#A7A5B4] pt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8B6BD9]" />
                    <span>
                      {new Date(edu.startDate).toLocaleDateString('pt-BR')}
                      {edu.endDate ? ` - ${new Date(edu.endDate).toLocaleDateString('pt-BR')}` : ' (Atual)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-4 mt-3 border-t border-[#2D2D40]">
                  <button
                    onClick={() => openEditModal(edu)}
                    className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-[#BC9EFD] hover:bg-[#1A1A24] transition-colors cursor-pointer"
                    title="Editar formação"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(edu)}
                    className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Excluir formação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2D2D40] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#F5F4F8] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#BC9EFD]" />
                {editingEdu ? 'Editar Formação' : 'Nova Formação Acadêmica'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#A7A5B4] hover:text-[#F5F4F8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Instituição de Ensino <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Universidade de São Paulo (USP), FIAP, PUC..."
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Grau Acadêmico <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  >
                    {DEGREES.map((d) => (
                      <option key={d} value={d} className="bg-[#1A1A24] text-[#F5F4F8]">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Situação <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EducationStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  >
                    <option value="CONCLUIDO" className="bg-[#1A1A24] text-[#F5F4F8]">Concluído</option>
                    <option value="EM_ANDAMENTO" className="bg-[#1A1A24] text-[#F5F4F8]">Em Andamento</option>
                    <option value="TRANCADO" className="bg-[#1A1A24] text-[#F5F4F8]">Trancado</option>
                    <option value="INCOMPLETO" className="bg-[#1A1A24] text-[#F5F4F8]">Incompleto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Curso / Área de Estudo <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ciência da Computação, Engenharia de Software..."
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Data de Início <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2D2D40]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#A7A5B4] hover:text-[#F5F4F8] text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Salvando...' : 'Salvar Formação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
