import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Github,
  Calendar,
  Layers,
  UserCheck
} from 'lucide-react';
import { projectApi } from '../services/api';
import { Project } from '../types';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Alerts
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar projetos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setRole('Desenvolvedor(a) Full Stack');
    setTechnologies(['Java', 'Spring Boot', 'React', 'TypeScript']);
    setTechInput('');
    setRepositoryUrl('');
    setLiveUrl('');
    setStartDate('');
    setEndDate('');
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description);
    setRole(proj.role);
    setTechnologies(proj.technologies || []);
    setTechInput('');
    setRepositoryUrl(proj.repositoryUrl || '');
    setLiveUrl(proj.liveUrl || '');
    setStartDate(proj.startDate || '');
    setEndDate(proj.endDate || '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !role.trim()) {
      setError('Título, descrição e papel desempenhado são campos obrigatórios.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (editingProject) {
        await projectApi.update(editingProject.id, {
          title,
          description,
          role,
          technologies,
          repositoryUrl: repositoryUrl || undefined,
          liveUrl: liveUrl || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        setSuccess(`Projeto "${title}" atualizado com sucesso!`);
      } else {
        await projectApi.create({
          title,
          description,
          role,
          technologies,
          repositoryUrl: repositoryUrl || undefined,
          liveUrl: liveUrl || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        setSuccess(`Projeto "${title}" cadastrado com sucesso!`);
      }
      setIsModalOpen(false);
      await fetchProjects();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar projeto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (proj: Project) => {
    if (!confirm(`Deseja remover o projeto "${proj.title}"?`)) return;
    try {
      await projectApi.delete(proj.id);
      setSuccess(`Projeto "${proj.title}" removido.`);
      await fetchProjects();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover projeto.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top action header */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#BC9EFD]" />
            Projetos & Portfólio ({projects.length})
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Aplicações práticas, open-source e sistemas que comprovam seu domínio tecnológico.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-semibold text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Projeto</span>
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
          <p className="text-sm text-[#A7A5B4]">Carregando projetos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center mx-auto text-[#A7A5B4]">
            <FolderGit2 className="w-6 h-6 text-[#BC9EFD]" />
          </div>
          <h3 className="text-base font-bold text-[#F5F4F8]">Nenhum projeto cadastrado</h3>
          <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
            Projetos práticos são essenciais para enriquecer seu perfil e demonstrar capacidade de entrega de software de ponta a ponta.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="group rounded-2xl bg-[#222230] border border-[#2D2D40] p-5 hover:border-[#8B6BD9]/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors">
                    {proj.title}
                  </h3>
                  <span className="text-xs font-semibold text-[#BC9EFD] bg-[#BC9EFD]/10 px-2.5 py-0.5 rounded-md border border-[#8B6BD9]/40 shrink-0">
                    {proj.role}
                  </span>
                </div>

                <p className="text-xs text-[#A7A5B4] leading-relaxed">
                  {proj.description}
                </p>

                {/* Tech chips */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1A1A24] text-[#F5F4F8] border border-[#2D2D40]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  {proj.repositoryUrl && (
                    <a
                      href={proj.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#A7A5B4] hover:text-[#F5F4F8] underline font-medium"
                    >
                      <Github className="w-3.5 h-3.5 text-[#BC9EFD]" />
                      Repositório Código
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#BC9EFD] hover:text-[#8B6BD9] underline font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Deploy / Demonstração
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-4 mt-3 border-t border-[#2D2D40]">
                <button
                  onClick={() => openEditModal(proj)}
                  className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-[#BC9EFD] hover:bg-[#1A1A24] transition-colors cursor-pointer"
                  title="Editar projeto"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(proj)}
                  className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Excluir projeto"
                >
                  <Trash2 className="w-4 h-4" />
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
                <FolderGit2 className="w-5 h-5 text-[#BC9EFD]" />
                {editingProject ? 'Editar Projeto' : 'Cadastrar Novo Projeto'}
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
                  Título do Projeto <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atlas Skills Platform"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Papel Desempenhado <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tech Lead, Desenvolvedor(a) Backend, Arquiteto Cloud"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Descrição e Resultados do Projeto <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique o desafio de negócio, arquitetura escolhida e impacto gerado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD] resize-none"
                />
              </div>

              {/* Tecnologias */}
              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Tecnologias Utilizadas
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ex: Java 17, Spring Boot, React, MySQL..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-xs focus:outline-none focus:border-[#BC9EFD]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3 py-1.5 rounded-xl bg-[#1A1A24] border border-[#2D2D40] hover:border-[#8B6BD9] text-[#F5F4F8] text-xs font-semibold cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {technologies.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#BC9EFD]/10 border border-[#8B6BD9]/40 text-[#BC9EFD] text-xs font-mono"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(t)}
                        className="text-[#BC9EFD] hover:text-[#F5F4F8] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Link do Repositório (Git)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-xs focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Link de Demonstração / Deploy
                  </label>
                  <input
                    type="url"
                    placeholder="https://meuapp.com"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-xs focus:outline-none focus:border-[#BC9EFD]"
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
                  {submitting ? 'Salvando...' : 'Salvar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
