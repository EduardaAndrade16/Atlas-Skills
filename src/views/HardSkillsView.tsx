import React, { useEffect, useState } from 'react';
import {
  Code2,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { hardSkillApi } from '../services/api';
import { HardSkill, SkillLevel } from '../types';

const CATEGORIES = [
  'Todas',
  'Backend',
  'Frontend',
  'Banco de Dados',
  'DevOps / Cloud',
  'Arquitetura',
  'Mobile',
  'Segurança',
  'Data & AI',
  'QA & Testes',
];

const SKILL_LEVELS: { value: SkillLevel; label: string; color: string }[] = [
  { value: 'BASICO', label: 'Básico', color: 'bg-[#1A1A24] text-[#A7A5B4] border-[#2D2D40]' },
  { value: 'INTERMEDIARIO', label: 'Intermediário', color: 'bg-[#28283A] text-[#F5F4F8] border-[#3A3A50]' },
  { value: 'AVANCADO', label: 'Avançado', color: 'bg-[#8B6BD9]/15 text-[#BC9EFD] border-[#8B6BD9]/40' },
  { value: 'ESPECIALISTA', label: 'Especialista', color: 'bg-[#8B6BD9]/25 text-[#BC9EFD] border-[#BC9EFD]/50' },
];

export const HardSkillsView: React.FC = () => {
  const [skills, setSkills] = useState<HardSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<HardSkill | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Backend');
  const [level, setLevel] = useState<SkillLevel>('INTERMEDIARIO');
  const [years, setYears] = useState(2);

  // Alerts
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSkills = async () => {
    try {
      const data = await hardSkillApi.getAll();
      setSkills(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar hard skills.');
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
    setCategory('Backend');
    setLevel('INTERMEDIARIO');
    setYears(2);
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (skill: HardSkill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setLevel(skill.level);
    setYears(skill.yearsOfExperience);
    setIsModalOpen(true);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da competência é obrigatório.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (editingSkill) {
        await hardSkillApi.update(editingSkill.id, {
          name,
          category,
          level,
          yearsOfExperience: Number(years),
        });
        setSuccess(`Competência "${name}" atualizada com sucesso!`);
      } else {
        await hardSkillApi.create({
          name,
          category,
          level,
          yearsOfExperience: Number(years),
        });
        setSuccess(`Competência "${name}" adicionada com sucesso!`);
      }
      setIsModalOpen(false);
      await fetchSkills();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar competência técnica.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (skill: HardSkill) => {
    if (!confirm(`Deseja realmente remover a competência "${skill.name}"?`)) return;
    try {
      await hardSkillApi.delete(skill.id);
      setSuccess(`Competência "${skill.name}" removida com sucesso.`);
      await fetchSkills();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover competência.');
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchCategory = selectedCategory === 'Todas' || s.category === selectedCategory;
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Top action header */}
      <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#F5F4F8] flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#BC9EFD]" />
            Hard Skills ({skills.length})
          </h2>
          <p className="text-xs text-[#A7A5B4] mt-1">
            Cadastre tecnologias, linguagens, frameworks e bancos de dados de domínio técnico.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Hard Skill</span>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A7A5B4] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por competência ou categoria (ex: Java, React, Docker)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#222230] border border-[#2D2D40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#8B6BD9] text-[#F5F4F8]'
                  : 'bg-[#222230] text-[#A7A5B4] hover:text-[#F5F4F8] border border-[#2D2D40]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#A7A5B4]">Carregando competências técnicas...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center mx-auto text-[#A7A5B4]">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F5F4F8]">Nenhuma competência técnica encontrada</h3>
          <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
            {searchTerm || selectedCategory !== 'Todas'
              ? 'Tente ajustar os filtros de busca para encontrar suas competências.'
              : 'Comece adicionando as linguagens, frameworks e bancos de dados com os quais você trabalha.'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeira Hard Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const levelConfig =
              SKILL_LEVELS.find((l) => l.value === skill.level) || SKILL_LEVELS[0];
            return (
              <div
                key={skill.id}
                className="rounded-2xl bg-[#222230] border border-[#2D2D40] p-5 hover:border-[#383850] transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider">
                      {skill.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${levelConfig.color}`}
                    >
                      {levelConfig.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F4F8]">
                    {skill.name}
                  </h3>

                  <p className="text-xs text-[#A7A5B4] mt-1">
                    Experiência prática: <strong className="text-[#F5F4F8]">{skill.yearsOfExperience} ano(s)</strong>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1 pt-4 mt-3 border-t border-[#2D2D40]">
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
                <Code2 className="w-5 h-5 text-[#BC9EFD]" />
                {editingSkill ? 'Editar Hard Skill' : 'Nova Hard Skill'}
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
                  Nome da Tecnologia / Ferramenta <span className="text-[#BC9EFD]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Java 17, Spring Boot, React, Docker, PostgreSQL"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Categoria <span className="text-[#BC9EFD]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  >
                    {CATEGORIES.filter((c) => c !== 'Todas').map((c) => (
                      <option key={c} value={c} className="bg-[#222230]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1">
                    Anos de Experiência
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={years}
                    onChange={(e) => setYears(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] text-sm focus:outline-none focus:border-[#BC9EFD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-2">
                  Nível de Proficiência <span className="text-[#BC9EFD]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_LEVELS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setLevel(item.value)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
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
                  {submitting ? 'Salvando...' : 'Salvar Competência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
