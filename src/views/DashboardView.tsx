import React, { useEffect, useState } from 'react';
import {
  Code2,
  HeartHandshake,
  BookOpen,
  Award,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Target,
  ExternalLink,
  ChevronRight,
  MapPin,
  Mail,
  Linkedin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { DashboardSummary } from '../types';
import { ActiveTab } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await profileApi.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Erro ao carregar sumário:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const statsCards = [
    {
      title: 'Hard Skills',
      count: summary?.hardSkillsCount ?? 0,
      icon: Code2,
      tab: 'profile' as ActiveTab,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      description: 'Linguagens, frameworks e ferramentas',
    },
    {
      title: 'Soft Skills',
      count: summary?.softSkillsCount ?? 0,
      icon: HeartHandshake,
      tab: 'profile' as ActiveTab,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
      description: 'Comportamento e inteligência emocional',
    },
    {
      title: 'Cursos & Trilhas',
      count: summary?.coursesCount ?? 0,
      icon: BookOpen,
      tab: 'courses-tracks' as ActiveTab,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      description: 'Formação continuada e bootcamps',
    },
    {
      title: 'Certificações',
      count: summary?.certificationsCount ?? 0,
      icon: Award,
      tab: 'profile' as ActiveTab,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      description: 'Chaves e títulos técnicos validados',
    },
    {
      title: 'Projetos',
      count: summary?.projectsCount ?? 0,
      icon: FolderGit2,
      tab: 'profile' as ActiveTab,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
      description: 'Aplicações práticas e repositórios',
    },
    {
      title: 'Experiências',
      count: summary?.experiencesCount ?? 0,
      icon: Briefcase,
      tab: 'profile' as ActiveTab,
      color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-400',
      description: 'Histórico e trajetória de mercado',
    },
    {
      title: 'Formação Acadêmica',
      count: summary?.educationCount ?? 0,
      icon: GraduationCap,
      tab: 'profile' as ActiveTab,
      color: 'from-violet-500/20 to-indigo-500/10 border-violet-500/30 text-violet-400',
      description: 'Graduação, pós e especializações',
    },
  ];

  const completion = summary?.completionPercentage || 65;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Atlas Skills Platform v1.0
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bem-vindo(a), <span className="text-indigo-400">{user?.name}</span>!
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              {profile?.headline || 'Gerencie seu perfil técnico, mapeie suas competências e mantenha sua trajetória profissional pronta para oportunidades.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              {profile?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.location}
                </span>
              )}
              {user?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Profile Completeness Gauge */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 min-w-[260px] flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nível de Preenchimento
              </span>
              <span className="text-lg font-extrabold text-indigo-400 font-mono">
                {completion}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              {completion === 100
                ? 'Perfil completo e pronto para recomendações!'
                : 'Cadastre suas certificações e projetos para alcançar 100% de precisão.'}
            </p>
            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold transition-all border border-indigo-500/30 flex items-center justify-center gap-1.5"
            >
              <span>Completar Perfil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Section Counters */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Estrutura do Perfil & Seções
          </h3>
          <span className="text-xs text-slate-400">Selecione um cartão para gerenciar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.tab}
                onClick={() => onNavigate(card.tab)}
                className={`group cursor-pointer rounded-2xl bg-slate-900/80 border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/50 ${card.color}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-white font-mono">
                    {card.count}
                  </span>
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                  {card.title}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Career Objective & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Objective & Focus Areas */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800/80 pb-3">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>Foco de Carreira</span>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Objetivo Profissional
            </label>
            <p className="text-sm font-semibold text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {profile?.careerGoal || 'Não especificado. Clique para definir.'}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Área de Atuação Principal
            </label>
            <p className="text-sm font-medium text-indigo-300 bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-900/40">
              {profile?.primaryArea || 'Área profissional não informada'}
            </p>
          </div>

          {profile?.secondaryAreas && profile.secondaryAreas.length > 0 && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Áreas Secundárias
              </label>
              <div className="flex flex-wrap gap-1.5">
                {profile.secondaryAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>Editar Objetivos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Skills & Readiness */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span>Competências Técnicas em Destaque</span>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {summary?.topSkills && summary.topSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary.topSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white">{skill.name}</h5>
                    <span className="text-xs text-slate-400">{skill.category} • {skill.yearsOfExperience} ano(s)</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      skill.level === 'ESPECIALISTA'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                        : skill.level === 'AVANCADO'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                        : skill.level === 'INTERMEDIARIO'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">Nenhuma hard skill cadastrada ainda.</p>
              <button
                onClick={() => onNavigate('profile')}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:underline"
              >
                + Adicionar primeira competência
              </button>
            </div>
          )}

          {/* AI Banner Teaser */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-cyan-200">
                  Pronto para a Próxima Fase: Cursos, Trilhas & Vagas
                </h5>
                <p className="text-xs text-slate-300">
                  A arquitetura e os contratos REST da Atlas Skills já suportam a ingestão deste perfil para cálculo de lacunas e recomendação inteligente.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('courses-tracks')}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md shadow-cyan-950"
            >
              Explorar Trilhas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
