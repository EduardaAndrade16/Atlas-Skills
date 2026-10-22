import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Building,
  MapPin,
  Check
} from 'lucide-react';
import { experienceApi } from '../services/api';
import { Experience, WorkModel } from '../types';

const WORK_MODELS: { value: WorkModel; label: string }[] = [
  { value: 'REMOTO', label: '100% Remoto' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'PRESENCIAL', label: 'Presencial' },
];

export const ExperiencesView: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [workModel, setWorkModel] = useState<WorkModel>('REMOTO');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [activities, setActivities] = useState('');

  // Alerts
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchExperiences = async () => {
    try {
      const data = await experienceApi.getAll();
      setExperiences(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar experiências.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const openCreateModal = () => {
    setEditingExp(null);
    setCompany('');
    setPosition('');
    setWorkModel('REMOTO');
    setStartDate('');
    setEndDate('');
    setIsCurrent(true);
    setActivities('');
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (exp: Experience) => {
    setEditingExp(exp);
    setCompany(exp.company);
    setPosition(exp.position);
    setWorkModel(exp.workModel);
    setStartDate(exp.startDate);
    setEndDate(exp.endDate || '');
    setIsCurrent(exp.isCurrent);
    setActivities(exp.activities);
    setIsModalOpen(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim() || !startDate || !activities.trim()) {
      setError('Empresa, cargo, data de início e descrição de atividades são obrigatórios.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (editingExp) {
        await experienceApi.update(editingExp.id, {
          company,
          position,
          workModel,
          startDate,
          endDate: isCurrent ? undefined : endDate || undefined,
          isCurrent,
          activities,
        });
        setSuccess(`Experiência na "${company}" atualizada com sucesso!`);
      } else {
        await experienceApi.create({
          company,
          position,
          workModel,
          startDate,
          endDate: isCurrent ? undefined : endDate || undefined,
          isCurrent,
          activities,
        });
        setSuccess(`Experiência na "${company}" cadastrada com sucesso!`);
      }
      setIsModalOpen(false);
      await fetchExperiences();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar experiência.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (exp: Experience) => {
    if (!confirm(`Deseja remover a experiência na "${exp.company}"?`)) return;
    try {
      await experienceApi.delete(exp.id);
      setSuccess(`Experiência na "${exp.company}" removida.`);
      await fetchExperiences();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover experiência.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top action header */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#BC9EFD]" />
            Experiências Profissionais ({experiences.length})
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Empresas, posições ocupadas, modelo de trabalho e principais impactos gerados na carreira.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-semibold text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Experiência</span>
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
          <p className="text-sm text-[#A7A5B4]">Carregando histórico profissional...</p>
        </div>
      ) : experiences.length === 0 ? (
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center mx-auto text-[#A7A5B4]">
            <Briefcase className="w-6 h-6 text-[#BC9EFD]" />
          </div>
          <h3 className="text-base font-bold text-[#F5F4F8]">Nenhuma experiência cadastrada</h3>
          <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
            O usuário pode manter o perfil válido mesmo sem experiências anteriores, ou cadastrar posições de estágio e CLT para fortalecer o histórico.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Experiência
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="group rounded-2xl bg-[#222230] border border-[#2D2D40] p-6 hover:border-[#8B6BD9]/60 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-bold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors">
                    {exp.position}
                  </h3>
                  <span className="text-sm font-semibold text-[#A7A5B4]">
                    @ {exp.company}
                  </span>
                  {exp.isCurrent && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      Atual
                    </span>
                  )}
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#1A1A24] text-[#A7A5B4] border border-[#2D2D40]">
                    {exp.workModel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#A7A5B4]">
                  <Calendar className="w-3.5 h-3.5 text-[#8B6BD9]" />
                  <span>
                    {new Date(exp.startDate).toLocaleDateString('pt-BR')} até{' '}
                    {exp.isCurrent
                      ? 'o momento'
                      : exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString('pt-BR')
                      : 'Não informado'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#F5F4F8] leading-relaxed whitespace-pre-line bg-[#1A1A24] p-4 rounded-xl border border-[#2D2D40]">
                  {exp.activities}
                </p>
              </div>

              <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-[#2D2D40] pt-3 md:pt-0 md:pl-4">
                <button
                  onClick={() => openEditModal(exp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A7A5B4] hover:text-[#BC9EFD] bg-[#1A1A24] hover:bg-[#1A1A24]/80 transition-colors border border-[#2D2D40] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(exp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 transition-colors border border-rose-900/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2D2D40] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#F5F4F8] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#BC9EFD]" />
                {editingExp ? 'Editar Experiência' : 'Cadastrar Experiência'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Empresa <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nexus Tech"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Cargo / Posição <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Engenheira Full Stack"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Modelo de Atuação <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WORK_MODELS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setWorkModel(m.value)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        workModel === m.value
                          ? 'border-[#BC9EFD] bg-[#BC9EFD]/20 text-[#BC9EFD]'
                          : 'border-[#2D2D40] bg-[#1A1A24] text-[#A7A5B4] hover:text-[#F5F4F8]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
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
                    disabled={isCurrent}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD] disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrentExp"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-[#2D2D40] bg-[#1A1A24] text-[#8B6BD9] focus:ring-[#BC9EFD]"
                />
                <label htmlFor="isCurrentExp" className="text-xs font-medium text-[#F5F4F8] cursor-pointer">
                  Trabalho atualmente nesta empresa
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Atividades e Principais Realizações <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva suas atribuições, desafios superados e tecnologias utilizadas..."
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD] resize-none"
                />
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
                  {submitting ? 'Salvando...' : 'Salvar Experiência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
