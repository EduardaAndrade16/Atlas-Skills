import React, { useEffect, useState } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Target,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Globe,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';

const COMMON_AREAS = [
  'Desenvolvimento Backend',
  'Desenvolvimento Frontend',
  'Engenharia de Dados',
  'DevOps & Cloud',
  'Arquitetura de Software',
  'Inteligência Artificial & Machine Learning',
  'Segurança da Informação',
  'Gestão de Produtos (PM)',
  'Quality Assurance & Testes',
  'Mobile (Android / iOS / Flutter)',
];

export const ProfileView: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [primaryArea, setPrimaryArea] = useState('');
  const [secondaryAreas, setSecondaryAreas] = useState<string[]>([]);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setPrimaryArea(profile.primaryArea || 'Desenvolvimento Backend & Cloud');
      setSecondaryAreas(profile.secondaryAreas || []);
      setCareerGoal(profile.careerGoal || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setGithubUrl(profile.githubUrl || '');
      setPortfolioUrl(profile.portfolioUrl || '');
    }
  }, [profile]);

  const handleAddSecondaryArea = () => {
    const trimmed = newAreaInput.trim();
    if (trimmed && !secondaryAreas.includes(trimmed)) {
      setSecondaryAreas([...secondaryAreas, trimmed]);
      setNewAreaInput('');
    }
  };

  const handleRemoveSecondaryArea = (areaToRemove: string) => {
    setSecondaryAreas(secondaryAreas.filter((a) => a !== areaToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      await profileApi.update({
        headline,
        bio,
        primaryArea,
        secondaryAreas,
        careerGoal,
        phone,
        location,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
      });
      await refreshProfile();
      setSuccess('Perfil profissional atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar perfil profissional.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Apresentação e Headline */}
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-[#F5F4F8] font-bold text-base border-b border-[#2D2D40] pb-3">
            <FileText className="w-5 h-5 text-[#BC9EFD]" />
            <span>Apresentação & Headline Profissional</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
              Título Profissional / Headline <span className="text-[#BC9EFD]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Engenheiro de Software Full Stack | Spring Boot & React"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 focus:outline-none focus:border-[#BC9EFD] text-sm transition-all"
            />
            <p className="text-[11px] text-[#A7A5B4] mt-1">
              Uma síntese concisa do seu posicionamento atual no mercado.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
              Biografia & Resumo de Trajetória
            </label>
            <textarea
              rows={4}
              placeholder="Descreva suas principais realizações, tecnologias de domínio e metodologia de trabalho..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 focus:outline-none focus:border-[#BC9EFD] text-sm transition-all resize-y"
            />
          </div>
        </div>

        {/* Seção 2: Áreas de Interesse & Objetivo */}
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-[#F5F4F8] font-bold text-base border-b border-[#2D2D40] pb-3">
            <Target className="w-5 h-5 text-[#BC9EFD]" />
            <span>Áreas de Interesse & Objetivo de Carreira</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
                Área Principal de Atuação <span className="text-[#BC9EFD]">*</span>
              </label>
              <select
                value={primaryArea}
                onChange={(e) => setPrimaryArea(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] focus:outline-none focus:border-[#BC9EFD] text-sm"
              >
                {COMMON_AREAS.map((area) => (
                  <option key={area} value={area} className="bg-[#222230]">
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
                Cargo ou Objetivo Desejado <span className="text-[#BC9EFD]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Tech Lead / Arquiteta de Soluções Cloud Senior"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 focus:outline-none focus:border-[#BC9EFD] text-sm"
              />
            </div>
          </div>

          {/* Áreas secundárias */}
          <div>
            <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5">
              Áreas Secundárias de Interesse
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ex: DevOps, Arquitetura Distribuída, Micro-frontends"
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSecondaryArea();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
              />
              <button
                type="button"
                onClick={handleAddSecondaryArea}
                className="px-4 py-2 rounded-xl bg-[#28283A] hover:bg-[#32324A] text-[#F5F4F8] text-xs font-semibold flex items-center gap-1.5 border border-[#2E2E40] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#BC9EFD]" />
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {secondaryAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8B6BD9]/15 border border-[#BC9EFD]/30 text-[#BC9EFD] text-xs font-medium"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveSecondaryArea(area)}
                    className="text-[#BC9EFD]/70 hover:text-[#BC9EFD] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {secondaryAreas.length === 0 && (
                <span className="text-xs text-[#A7A5B4]/70 italic">
                  Nenhuma área secundária adicionada. Digite acima e clique em Adicionar.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Seção 3: Dados de Contato e Presença Digital */}
        <div className="bg-[#222230] border border-[#2D2D40] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-[#F5F4F8] font-bold text-base border-b border-[#2D2D40] pb-3">
            <Globe className="w-5 h-5 text-[#BC9EFD]" />
            <span>Localização & Presença Digital</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A7A5B4]" />
                Cidade / Estado
              </label>
              <input
                type="text"
                placeholder="Ex: São Paulo, SP - Brasil"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#A7A5B4]" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="Ex: +55 (11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-[#A7A5B4]" />
                Perfil no LinkedIn
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/seu-perfil"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-[#A7A5B4]" />
                Perfil no GitHub
              </label>
              <input
                type="url"
                placeholder="https://github.com/seu-usuario"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7A5B4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#A7A5B4]" />
              Website ou Portfólio Pessoal
            </label>
            <input
              type="url"
              placeholder="https://seusite.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2E2E40] text-[#F5F4F8] placeholder-[#A7A5B4]/50 text-sm focus:outline-none focus:border-[#BC9EFD]"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#BC9EFD] hover:bg-[#8B6BD9] text-[#1A1A24] hover:text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#1A1A24] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Informações do Perfil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
