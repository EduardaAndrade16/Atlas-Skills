import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Clock,
  Calendar,
  Building2
} from 'lucide-react';
import { courseApi } from '../services/api';
import { Course, CourseStatus } from '../types';

const STATUS_CONFIG: Record<CourseStatus, { label: string; color: string }> = {
  CONCLUIDO: { label: 'Concluído', color: 'bg-emerald-950/20 text-emerald-300 border-emerald-800/40' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-[#8B6BD9]/20 text-[#BC9EFD] border-[#BC9EFD]/40' },
  INTERROMPIDO: { label: 'Interrompido', color: 'bg-[#1A1A24] text-[#A7A5B4] border-[#2D2D40]' },
};

export const CoursesView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [workloadHours, setWorkloadHours] = useState(40);
  const [status, setStatus] = useState<CourseStatus>('CONCLUIDO');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  // Alerts
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar cursos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setName('');
    setInstitution('');
    setWorkloadHours(40);
    setStatus('CONCLUIDO');
    setStartDate('');
    setCompletionDate('');
    setCertificateUrl('');
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setName(c.name);
    setInstitution(c.institution);
    setWorkloadHours(c.workloadHours || 0);
    setStatus(c.status);
    setStartDate(c.startDate || '');
    setCompletionDate(c.completionDate || '');
    setCertificateUrl(c.certificateUrl || '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !institution.trim()) {
      setError('Nome do curso e instituição são obrigatórios.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (editingCourse) {
        await courseApi.update(editingCourse.id, {
          name,
          institution,
          workloadHours: Number(workloadHours) || undefined,
          status,
          startDate: startDate || undefined,
          completionDate: completionDate || undefined,
          certificateUrl: certificateUrl || undefined,
        });
        setSuccess(`Curso "${name}" atualizado!`);
      } else {
        await courseApi.create({
          name,
          institution,
          workloadHours: Number(workloadHours) || undefined,
          status,
          startDate: startDate || undefined,
          completionDate: completionDate || undefined,
          certificateUrl: certificateUrl || undefined,
        });
        setSuccess(`Curso "${name}" cadastrado!`);
      }
      setIsModalOpen(false);
      await fetchCourses();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar curso.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Course) => {
    if (!confirm(`Deseja remover o curso "${c.name}"?`)) return;
    try {
      await courseApi.delete(c.id);
      setSuccess(`Curso "${c.name}" removido.`);
      await fetchCourses();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover curso.');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top action header */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#BC9EFD]" />
            Cursos Realizados ({courses.length})
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Histórico de bootcamps, treinamentos técnicos e certificações livres.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Curso</span>
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#A7A5B4]">Carregando cursos...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center mx-auto text-[#A7A5B4]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F5F4F8]">Nenhum curso cadastrado ainda</h3>
          <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
            Cadastre os cursos e treinamentos realizados para comprovar sua evolução contínua.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Curso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const st = STATUS_CONFIG[course.status] || STATUS_CONFIG.CONCLUIDO;
            return (
              <div
                key={course.id}
                className="rounded-2xl bg-[#222230] border border-[#2D2D40] p-5 hover:border-[#383850] transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#A7A5B4]">
                      <Building2 className="w-3.5 h-3.5 text-[#BC9EFD]" />
                      {course.institution}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${st.color}`}
                    >
                      {st.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F4F8]">
                    {course.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A7A5B4] pt-1">
                    {course.workloadHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#A7A5B4]" />
                        {course.workloadHours} horas
                      </span>
                    )}
                    {(course.startDate || course.completionDate) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#A7A5B4]" />
                        {course.startDate && new Date(course.startDate).toLocaleDateString('pt-BR')}
                        {course.completionDate && ` - ${new Date(course.completionDate).toLocaleDateString('pt-BR')}`}
                      </span>
                    )}
                  </div>

                  {course.certificateUrl && (
                    <div className="pt-1">
                      <a
                        href={course.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#BC9EFD] hover:underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver Certificado de Conclusão
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-4 mt-3 border-t border-[#2D2D40]">
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-[#BC9EFD] hover:bg-[#1A1A24] transition-colors cursor-pointer"
                    title="Editar curso"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                    title="Excluir curso"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-[#2D2D40] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#F5F4F8] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#BC9EFD]" />
                {editingCourse ? 'Editar Curso' : 'Cadastrar Novo Curso'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#A7A5B4] hover:text-[#F5F4F8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Nome do Curso ou Capacitação <span className="text-[#BC9EFD]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Spring Boot 3 & Microsserviços com Docker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Instituição / Plataforma <span className="text-[#BC9EFD]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alura, Udemy, Rocketseat"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Carga Horária (horas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 60"
                    value={workloadHours}
                    onChange={(e) => setWorkloadHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Situação do Curso <span className="text-[#BC9EFD]">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CourseStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                >
                  <option value="CONCLUIDO" className="bg-[#222230]">Concluído</option>
                  <option value="EM_ANDAMENTO" className="bg-[#222230]">Em Andamento</option>
                  <option value="INTERROMPIDO" className="bg-[#222230]">Interrompido</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Data de Conclusão
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Link do Certificado (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/certificado/123"
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
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
                  className="px-5 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Salvando...' : 'Salvar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
