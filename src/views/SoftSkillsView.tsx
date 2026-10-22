import React, { useEffect, useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
} from 'lucide-react';
import { softSkillApi } from '../services/api';
import { SkillLevel, SoftSkill } from '../types';

const SUGGESTIONS = [
  'Comunicação Assertiva',
  'Resolução de Problemas',
  'Liderança e Mentoria',
  'Trabalho em Equipe',
  'Inteligência Emocional',
  'Pensamento Crítico',
  'Gestão de Tempo e Priorização',
  'Negociação e Alinhamento',
  'Adaptabilidade e Resiliência',
  'Criatividade e Inovação',
];

const SKILL_LEVELS: { value: SkillLevel; label: string; color: string }[] = [
  { value: 'BASICO', label: 'Em Desenvolvimento', color: 'bg-[#1A1A24] text-[#A7A5B4] border-[#2D2D40]' },
  { value: 'INTERMEDIARIO', label: 'Praticante Regular', color: 'bg-[#28283A] text-[#F5F4F8] border-[#3A3A50]' },
  { value: 'AVANCADO', label: 'Avançado / Referência', color: 'bg-[#8B6BD9]/15 text-[#BC9EFD] border-[#8B6BD9]/40' },
  { value: 'ESPECIALISTA', label: 'Mestre / Multiplicador', color: 'bg-[#8B6BD9]/25 text-[#BC9EFD] border-[#BC9EFD]/50' },
];

export const SoftSkillsView: React.FC = () => {
  const [skills, setSkills] = useState<SoftSkill[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SoftSkill | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<SkillLevel>('AVANCADO');
  const [contextExample, setContextExample] = useState('');

  // Alerts
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSkills = async () => {
    try {
      const data = await softSkillApi.getAll();
      setSkills(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar soft skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setName('');
    setDescription('');
    setLevel('AVANCADO');
    setContextExample('');
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (skill: SoftSkill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setDescription(skill.description || '');
    setLevel(skill.level);
    setContextExample(skill.contextExample || '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da competência comportamental é obrigatório.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (editingSkill) {
        await softSkillApi.update(editingSkill.id, {
          name,
          description,
          level,
          contextExample,
        });
        setSuccess(`Soft skill "${name}" atualizada com sucesso!`);
      } else {
        await softSkillApi.create({
          name,
          description,
          level,
          contextExample,
        });
        setSuccess(`Soft skill "${name}" adicionada com sucesso!`);
      }
      setIsModalOpen(false);
      await fetchSkills();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar competência comportamental.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (skill: SoftSkill) => {
    if (!confirm(`Deseja remover "${skill.name}"?`)) return;
    try {
      await softSkillApi.delete(skill.id);
      setSuccess(`Soft skill "${skill.name}" removida.`);
      await fetchSkills();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir soft skill.');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top action header */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#BC9EFD]" />
            Soft Skills ({skills.length})
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Competências comportamentais, inteligência interpessoal e colaboração.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Soft Skill</span>
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

      {/* Skills Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#A7A5B4]">Carregando competências comportamentais...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center mx-auto text-[#A7A5B4]">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F5F4F8]">Nenhuma soft skill cadastrada</h3>
          <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
            Adicione competências como comunicação, trabalho em equipe e resolução de problemas para valorizar seu perfil.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeira Soft Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const levelConfig =
              SKILL_LEVELS.find((l) => l.value === skill.level) || SKILL_LEVELS[0];
            return (
              <div
                key={skill.id}
                className="rounded-2xl bg-[#222230] border border-[#2D2D40] p-5 hover:border-[#383850] transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-[#F5F4F8]">
                      {skill.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase shrink-0 ${levelConfig.color}`}
                    >
                      {levelConfig.label}
                    </span>
                  </div>

                  {skill.description && (
                    <p className="text-xs text-[#A7A5B4] leading-relaxed">
                      {skill.description}
                    </p>
                  )}

                  {skill.contextExample && (
                    <div className="p-3 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-xs text-[#A7A5B4] flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#BC9EFD] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#F5F4F8] font-semibold">Exemplo prático:</strong> {skill.contextExample}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-4 mt-4 border-t border-[#2D2D40]">
                  <button
                    onClick={() => openEditModal(skill)}
                    className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-[#BC9EFD] hover:bg-[#1A1A24] transition-colors cursor-pointer"
                    title="Editar competência"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill)}
                    className="p-1.5 rounded-lg text-[#A7A5B4] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                    title="Excluir competência"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-[#2D2D40] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#F5F4F8] flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#BC9EFD]" />
                {editingSkill ? 'Editar Soft Skill' : 'Nova Soft Skill'}
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
                  Nome da Competência Comportamental <span className="text-[#BC9EFD]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comunicação Assertiva, Resolução de Problemas..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />

                {/* Suggestions chips */}
                {!editingSkill && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SUGGESTIONS.slice(0, 5).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setName(sug)}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#1A1A24] hover:bg-[#2A2A3C] text-[#BC9EFD] border border-[#2D2D40] cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-2">
                  Nível de Domínio <span className="text-[#BC9EFD]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_LEVELS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setLevel(item.value)}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        level === item.value
                          ? 'border-[#BC9EFD] bg-[#8B6BD9]/20 text-[#F5F4F8]'
                          : 'border-[#2E2E40] bg-[#1A1A24] text-[#A7A5B4] hover:text-[#F5F4F8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Descrição / Definição Pessoal
                </label>
                <textarea
                  rows={2}
                  placeholder="Como você enxerga e aplica essa habilidade..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                  Exemplo de Aplicação Prática
                </label>
                <input
                  type="text"
                  placeholder="Ex: Facilitação de alinhamento com stakeholders e mentoria técnica."
                  value={contextExample}
                  onChange={(e) => setContextExample(e.target.value)}
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
                  {submitting ? 'Salvando...' : 'Salvar Soft Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
