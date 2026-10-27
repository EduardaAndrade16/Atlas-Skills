import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Code2,
  HeartHandshake,
  BookOpen,
  Award,
  FolderGit2,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Circle,
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  ChevronRight,
  Flag,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { DashboardSummary } from '../types';

// Subviews
import { ProfileView } from './ProfileView';
import { HardSkillsView } from './HardSkillsView';
import { SoftSkillsView } from './SoftSkillsView';
import { EducationView } from './EducationView';
import { CoursesView } from './CoursesView';
import { CertificationsView } from './CertificationsView';
import { ProjectsView } from './ProjectsView';
import { ExperiencesView } from './ExperiencesView';

export type StepId =
  | 'apresentacao'
  | 'hard-skills'
  | 'soft-skills'
  | 'formacao'
  | 'cursos'
  | 'certificacoes'
  | 'projetos'
  | 'experiencias';

interface StepDefinition {
  id: StepId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  guidance: string;
  position: 'left' | 'right' | 'center';
}

const TRAIL_STEPS: StepDefinition[] = [
  {
    id: 'apresentacao',
    order: 1,
    title: 'Apresentação e Objetivos',
    subtitle: 'Título, biografia e metas',
    description: 'Título profissional, biografia, resumo da trajetória e objetivos profissionais.',
    icon: UserCheck,
    guidance: 'Defina seu título profissional, um resumo da sua história e suas principais metas de carreira para orientar sua rota.',
    position: 'left',
  },
  {
    id: 'hard-skills',
    order: 2,
    title: 'Hard Skills',
    subtitle: 'Conhecimentos técnicos e ferramentas',
    description: 'Conhecimentos técnicos, linguagens, ferramentas e tecnologias dominadas.',
    icon: Code2,
    guidance: 'Adicione as linguagens, frameworks, bancos de dados e ferramentas que compõem sua base técnica.',
    position: 'right',
  },
  {
    id: 'soft-skills',
    order: 3,
    title: 'Soft Skills',
    subtitle: 'Competências comportamentais',
    description: 'Competências comportamentais e habilidades interpessoais.',
    icon: HeartHandshake,
    guidance: 'Mapeie habilidades interpessoais, comunicação, resolução de problemas e capacidade de liderança.',
    position: 'left',
  },
  {
    id: 'formacao',
    order: 4,
    title: 'Formação Acadêmica',
    subtitle: 'Graduação, pós e especializações',
    description: 'Cursos de graduação, pós-graduação, mestrado, cursos técnicos e histórico acadêmico.',
    icon: GraduationCap,
    guidance: 'Cadastre sua formação educacional, instituições de ensino, períodos e áreas de estudo.',
    position: 'right',
  },
  {
    id: 'cursos',
    order: 5,
    title: 'Cursos Realizados',
    subtitle: 'Capacitações e treinamentos',
    description: 'Cursos concluídos, capacitações relevantes e treinamentos complementares.',
    icon: BookOpen,
    guidance: 'Registre cursos concluídos, cargas horárias e instituições que fundamentam seu aprendizado contínuo.',
    position: 'left',
  },
  {
    id: 'certificacoes',
    order: 6,
    title: 'Certificações',
    subtitle: 'Credenciais e exames oficiais',
    description: 'Certificados e credenciais profissionais reconhecidas pelo mercado.',
    icon: Award,
    guidance: 'Destaque suas credenciais oficiais (ex: AWS, Oracle, Google Cloud, Microsoft, Cisco).',
    position: 'right',
  },
  {
    id: 'projetos',
    order: 7,
    title: 'Projetos de Portfólio',
    subtitle: 'Aplicações e realizações',
    description: 'Projetos desenvolvidos, descrições, tecnologias utilizadas e links relevantes.',
    icon: FolderGit2,
    guidance: 'Demonstre na prática seu código, arquitetura e realizações em projetos pessoais ou profissionais.',
    position: 'left',
  },
  {
    id: 'experiencias',
    order: 8,
    title: 'Experiências Profissionais',
    subtitle: 'Vivências e histórico de mercado',
    description: 'Experiências de trabalho, estágios e outras vivências profissionais.',
    icon: Briefcase,
    guidance: 'Compartilhe suas atuações corporativas, cargos ocupados, modelos de trabalho e impacto gerado.',
    position: 'center',
  },
];

interface ProfileHubViewProps {
  onNavigateToCourses?: () => void;
}

export const ProfileHubView: React.FC<ProfileHubViewProps> = ({ onNavigateToCourses }) => {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activeStageId, setActiveStageId] = useState<StepId | null>(null);
  const [saveToast, setSaveToast] = useState<{ visible: boolean; stepTitle: string } | null>(null);

  const fetchSummary = async () => {
    try {
      const data = await profileApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.warn('Erro ao carregar resumo do perfil:', err);
    }
  };

  useEffect(() => {
    fetchSummary();

    const handleDataChange = () => {
      fetchSummary();
    };

    window.addEventListener('atlas_data_changed', handleDataChange);
    return () => window.removeEventListener('atlas_data_changed', handleDataChange);
  }, []);

  // Determine completion of each stage based on real saved form data:
  // Se a pessoa realizar ao menos um cadastro na etapa, ela é considerada como concluída
  const stageStatusMap = useMemo(() => {
    const isStep1Done = Boolean(
      profile?.headline?.trim() ||
      profile?.careerGoal?.trim() ||
      profile?.bio?.trim() ||
      profile?.primaryArea?.trim() ||
      profile?.phone?.trim() ||
      profile?.location?.trim()
    );
    const isStep2Done = (summary?.hardSkillsCount ?? 0) >= 1;
    const isStep3Done = (summary?.softSkillsCount ?? 0) >= 1;
    const isStep4Done = (summary?.educationCount ?? 0) >= 1;
    const isStep5Done = (summary?.coursesCount ?? 0) >= 1;
    const isStep6Done = (summary?.certificationsCount ?? 0) >= 1;
    const isStep7Done = (summary?.projectsCount ?? 0) >= 1;
    const isStep8Done = (summary?.experiencesCount ?? 0) >= 1;

    return {
      apresentacao: {
        isCompleted: isStep1Done,
        metric: isStep1Done
          ? 'Dados do perfil profissional cadastrados'
          : 'Pendente: preencha ao menos uma informação do perfil',
      },
      'hard-skills': {
        isCompleted: isStep2Done,
        metric: isStep2Done
          ? `${summary?.hardSkillsCount} tecnologia(s) cadastrada(s)`
          : 'Pendente: adicione ao menos 1 tecnologia',
      },
      'soft-skills': {
        isCompleted: isStep3Done,
        metric: isStep3Done
          ? `${summary?.softSkillsCount} competência(s) comportamental(is)`
          : 'Pendente: adicione ao menos 1 soft skill',
      },
      formacao: {
        isCompleted: isStep4Done,
        metric: isStep4Done
          ? `${summary?.educationCount} formação(ões) acadêmica(s)`
          : 'Pendente: adicione ao menos 1 formação acadêmica',
      },
      cursos: {
        isCompleted: isStep5Done,
        metric: isStep5Done
          ? `${summary?.coursesCount} curso(s) registrado(s)`
          : 'Pendente: adicione ao menos 1 curso',
      },
      certificacoes: {
        isCompleted: isStep6Done,
        metric: isStep6Done
          ? `${summary?.certificationsCount} credencial(is) profissional(is)`
          : 'Pendente: cadastre ao menos 1 certificação',
      },
      projetos: {
        isCompleted: isStep7Done,
        metric: isStep7Done
          ? `${summary?.projectsCount} projeto(s) no portfólio`
          : 'Pendente: cadastre ao menos 1 projeto',
      },
      experiencias: {
        isCompleted: isStep8Done,
        metric: isStep8Done
          ? `${summary?.experiencesCount} experiência(s) de mercado`
          : 'Pendente: registre ao menos 1 experiência',
      },
    };
  }, [profile, summary]);

  const completedCount = useMemo(() => {
    return Object.values(stageStatusMap).filter((s) => s.isCompleted).length;
  }, [stageStatusMap]);

  const completionPercentage = Math.round((completedCount / 8) * 100);

  // Identify next recommended step in order (first uncompleted step)
  const nextRecommendedStep = useMemo(() => {
    return TRAIL_STEPS.find((step) => !stageStatusMap[step.id]?.isCompleted) || null;
  }, [stageStatusMap]);

  const isMapFullyCompleted = completedCount === 8;

  const currentActiveStepDef = TRAIL_STEPS.find((s) => s.id === activeStageId);
  const currentStepIndex = TRAIL_STEPS.findIndex((s) => s.id === activeStageId);

  const handleOpenStep = (stepId: StepId) => {
    setActiveStageId(stepId);
  };

  const handleCloseStep = () => {
    setActiveStageId(null);
    fetchSummary();
  };

  const handleNavigateStep = (direction: 'next' | 'prev') => {
    if (currentStepIndex === -1) return;
    const newIndex = direction === 'next' ? currentStepIndex + 1 : currentStepIndex - 1;
    if (newIndex >= 0 && newIndex < TRAIL_STEPS.length) {
      setActiveStageId(TRAIL_STEPS[newIndex].id);
      fetchSummary();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 relative">
      {/* Save Feedback Banner */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#222232] border border-[#BC9EFD]/50 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-md animate-fade-in">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#F5F4F8] truncate">
              {saveToast.stepTitle} salvo com sucesso!
            </p>
            <p className="text-[11px] text-[#A7A5B4]">
              A Trilha do Atlas foi atualizada em tempo real.
            </p>
          </div>
          <button
            onClick={() => setSaveToast(null)}
            className="text-[#A7A5B4] hover:text-[#F5F4F8] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Overview Header Card */}
      <div className="rounded-3xl bg-[#222230] border border-[#2D2D40] p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle decorative background cartographic grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#BC9EFD_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Identification */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-[#8B6BD9]/20 border border-[#BC9EFD]/50 flex items-center justify-center text-[#BC9EFD] font-bold text-2xl shrink-0 shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4F8] tracking-tight truncate">
                  {user?.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B6BD9]/15 text-[#BC9EFD] border border-[#BC9EFD]/30">
                  <Compass className="w-3.5 h-3.5" />
                  Trilha do Atlas
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#BC9EFD] font-medium truncate">
                {profile?.headline || 'Engenharia de Software & Arquitetura'}
              </p>
              <p className="text-xs sm:text-sm text-[#A7A5B4] truncate flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#8B6BD9] shrink-0" />
                <span>
                  {profile?.careerGoal
                    ? `Objetivo: ${profile.careerGoal}`
                    : 'Defina seu objetivo na etapa 01 da trilha'}
                </span>
              </p>
            </div>
          </div>

          {/* Progress Indicators & Expedition Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Journey Metric Box */}
            <div className="bg-[#1A1A24] border border-[#2E2E42] rounded-2xl p-4 sm:min-w-[280px] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#A7A5B4]">
                  <span>Progresso do Perfil</span>
                  <span className="text-[11px] text-[#BC9EFD] font-normal">
                    ({completedCount} de 8 etapas)
                  </span>
                </div>
                <span className="font-mono font-bold text-[#BC9EFD] text-sm">
                  {completionPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#272738] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8B6BD9] to-[#BC9EFD] rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              {/* Contextual guidance message */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                {isMapFullyCompleted ? (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mapa 100% concluído!
                  </span>
                ) : nextRecommendedStep ? (
                  <span className="text-[11px] text-[#A7A5B4] truncate">
                    Recomendado: <strong className="text-[#BC9EFD] font-semibold">{nextRecommendedStep.title}</strong>
                  </span>
                ) : null}

                <span className="text-[10px] font-mono text-[#A7A5B4]/70 shrink-0">
                  {8 - completedCount} pendente(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Unlocked State Banner: All 8 stages completed */}
      {isMapFullyCompleted && (
        <div className="rounded-3xl bg-gradient-to-r from-[#241F3A] via-[#2A2346] to-[#1F1D2C] border-2 border-[#BC9EFD]/50 p-6 sm:p-8 shadow-xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-[#BC9EFD]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Jornada Concluída com Sucesso
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F4F8] tracking-tight">
                Seu mapa profissional está completo!
              </h3>
              <p className="text-xs sm:text-sm text-[#D4CDE6] leading-relaxed">
                Com base nas suas competências, objetivos, formação acadêmica, experiências e certificações cadastradas, o <strong>AtlasSkills</strong> mapeou com precisão o seu perfil técnico e comportamental. A próxima fase da plataforma está totalmente liberada.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <button
                onClick={onNavigateToCourses}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#BC9EFD] to-[#8B6BD9] hover:from-[#CDAFFD] hover:to-[#9B7BE9] text-[#1A1A24] hover:text-white font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.02]"
              >
                <span>Avançar para Cursos e Trilhas</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Central Atlas Trail Map Section */}
      <div className="rounded-3xl bg-[#1E1E2A]/90 border border-[#2A2A3B] p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle exploration watermark background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-[#BC9EFD]/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#BC9EFD]/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#BC9EFD]/5 rounded-full pointer-events-none" />

        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B6BD9]/15 border border-[#BC9EFD]/30 text-[#BC9EFD] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            Mapa da Jornada Profissional
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F4F8] tracking-tight">
            A Trilha do Atlas
          </h3>
          <p className="text-xs sm:text-sm text-[#A7A5B4]">
            Explore e complete cada uma das 8 etapas do seu perfil para desbloquear oportunidades personalizadas de especialização e mercado.
          </p>
        </div>

        {/* Sinuous Roadmap Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Desktop Sinuous Connecting SVG Path for 8 steps */}
          <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 1320"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="trailGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B6BD9" />
                  <stop offset="50%" stopColor="#BC9EFD" />
                  <stop offset="100%" stopColor="#CDAFFD" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Base Inactive Dashed Track */}
              <path
                d="M 230 80 
                   C 230 160, 570 160, 570 240
                   C 570 320, 230 320, 230 400
                   C 230 480, 570 480, 570 560
                   C 570 640, 230 640, 230 720
                   C 230 800, 570 800, 570 880
                   C 570 960, 230 960, 230 1040
                   C 230 1120, 400 1120, 400 1200"
                stroke="#2E2E42"
                strokeWidth="4"
                strokeDasharray="8 8"
                fill="none"
              />

              {/* Glowing Dynamic Active Segment */}
              <path
                d="M 230 80 
                   C 230 160, 570 160, 570 240
                   C 570 320, 230 320, 230 400
                   C 230 480, 570 480, 570 560
                   C 570 640, 230 640, 230 720
                   C 230 800, 570 800, 570 880
                   C 570 960, 230 960, 230 1040
                   C 230 1120, 400 1120, 400 1200"
                stroke="url(#trailGradientActive)"
                strokeWidth="4"
                strokeDasharray="1600"
                strokeDashoffset={1600 - (1600 * completionPercentage) / 100}
                strokeLinecap="round"
                filter="url(#glow)"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          {/* Mobile Continuous Vertical Guide Line */}
          <div className="md:hidden absolute left-7 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#8B6BD9] via-[#BC9EFD] to-[#2E2E42] pointer-events-none z-0" />

          {/* The 8 Interactive Trail Step Nodes */}
          <div className="relative z-10 space-y-8 sm:space-y-12">
            {TRAIL_STEPS.map((step) => {
              const Icon = step.icon;
              const status = stageStatusMap[step.id];
              const isCompleted = status?.isCompleted;
              const isRecommended = nextRecommendedStep?.id === step.id;
              const isSelected = activeStageId === step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    step.position === 'left'
                      ? 'md:justify-start'
                      : step.position === 'right'
                      ? 'md:justify-end'
                      : 'md:justify-center'
                  } relative pl-16 md:pl-0`}
                >
                  {/* Waypoint Marker Pin */}
                  <div
                    className={`absolute md:relative z-20 flex items-center justify-center transition-all ${
                      'left-0 md:left-auto top-1/2 -translate-y-1/2'
                    } ${
                      step.position === 'left'
                        ? 'md:order-2 md:ml-4'
                        : step.position === 'right'
                        ? 'md:order-1 md:mr-4'
                        : 'md:order-2 md:mx-4'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenStep(step.id)}
                      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                        isCompleted
                          ? 'bg-[#8B6BD9] text-white border-2 border-[#CDAFFD] shadow-[#8B6BD9]/30 hover:scale-105'
                          : isRecommended
                          ? 'bg-[#1A1A24] text-[#BC9EFD] border-2 border-[#BC9EFD] ring-4 ring-[#BC9EFD]/25 hover:scale-105'
                          : 'bg-[#1A1A24] text-[#A7A5B4] border-2 border-[#2E2E42] hover:border-[#8B6BD9] hover:text-[#F5F4F8]'
                      }`}
                      aria-label={`Abrir etapa ${step.title}`}
                    >
                      {/* Pulsing halo on recommended step */}
                      {isRecommended && (
                        <span className="absolute -inset-1 rounded-2xl bg-[#BC9EFD]/20 animate-ping pointer-events-none" />
                      )}

                      {isCompleted ? (
                        <Check className="w-6 h-6 stroke-[3]" />
                      ) : (
                        <span className="font-mono font-bold text-sm">
                          0{step.order}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Stage Card */}
                  <div
                    onClick={() => handleOpenStep(step.id)}
                    className={`w-full md:w-[380px] p-5 rounded-2xl border transition-all cursor-pointer group ${
                      step.position === 'left'
                        ? 'md:order-1'
                        : step.position === 'right'
                        ? 'md:order-2'
                        : 'md:order-1'
                    } ${
                      isSelected
                        ? 'bg-[#28263A] border-[#BC9EFD] shadow-lg ring-1 ring-[#BC9EFD]/40'
                        : isCompleted
                        ? 'bg-[#222230] border-[#37354A] hover:border-[#8B6BD9]/60 hover:bg-[#252536]'
                        : isRecommended
                        ? 'bg-[#232134] border-[#BC9EFD]/50 shadow-md hover:border-[#BC9EFD] hover:bg-[#27243B]'
                        : 'bg-[#1E1E2A] border-[#2A2A3B] hover:border-[#3E3E54] hover:bg-[#222230]'
                    }`}
                  >
                    {/* Card Top: Order and Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isCompleted
                              ? 'bg-[#8B6BD9]/25 text-[#BC9EFD]'
                              : isRecommended
                              ? 'bg-[#BC9EFD]/20 text-[#BC9EFD]'
                              : 'bg-[#2A2A3B] text-[#A7A5B4]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono font-bold text-[#A7A5B4]">
                          ETAPA 0{step.order}
                        </span>
                      </div>

                      {/* Status label badge */}
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluído
                        </span>
                      ) : isRecommended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#BC9EFD]/20 text-[#BC9EFD] border border-[#BC9EFD]/40 animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          Recomendado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1A1A24] text-[#A7A5B4] border border-[#2D2D40]">
                          <Circle className="w-2.5 h-2.5" />
                          Pendente
                        </span>
                      )}
                    </div>

                    {/* Stage Title & Subtitle */}
                    <h4 className="text-base font-bold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#A7A5B4] mt-1 line-clamp-2 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Progress / Saved Data Metric */}
                    <div className="mt-3.5 pt-3 border-t border-[#2A2A3B] flex items-center justify-between text-xs">
                      <span className="text-[#A7A5B4] truncate text-[11px]">
                        {status?.metric}
                      </span>
                      <span className="text-[#BC9EFD] font-semibold text-[11px] flex items-center gap-1 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
                        <span>{isCompleted ? 'Editar' : 'Preencher'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FULL-SCREEN DEDICATED WORKSPACE VIEW */}
      {activeStageId && currentActiveStepDef && (
        <div className="fixed inset-0 z-50 bg-[#1A1A24] flex flex-col overflow-hidden animate-fade-in">
          {/* Top Sticky Bar with Prominent "X" Close Button */}
          <header className="h-16 sm:h-20 bg-[#1E1E2A] border-b border-[#2E2E42] px-3.5 sm:px-8 flex items-center justify-between gap-2.5 sm:gap-4 shrink-0 shadow-lg z-30">
            {/* Left: Return to Trail Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseStep}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#242436] hover:bg-[#2E2E42] border border-[#37374D] text-xs font-semibold text-[#F5F4F8] transition-all cursor-pointer group shadow-sm"
              >
                <Compass className="w-4 h-4 text-[#BC9EFD] transition-transform group-hover:rotate-45" />
                <span className="hidden sm:inline">Voltar ao Mapa da Trilha</span>
                <span className="sm:hidden">Voltar</span>
              </button>
            </div>

            {/* Center: Stage Title (Clean, no sequence or completion badges) */}
            <div className="flex items-center justify-center text-center min-w-0 px-2 flex-1">
              <h2 className="text-sm sm:text-lg font-bold text-[#F5F4F8] truncate max-w-[200px] sm:max-w-md">
                {currentActiveStepDef.title}
              </h2>
            </div>

            {/* Right: Step Switchers & Prominent "X" Close Button */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentStepIndex <= 0}
                  onClick={() => handleNavigateStep('prev')}
                  className="p-2.5 rounded-xl bg-[#242436] hover:bg-[#2E2E42] border border-[#37374D] text-[#A7A5B4] hover:text-[#F5F4F8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Etapa anterior"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentStepIndex >= TRAIL_STEPS.length - 1}
                  onClick={() => handleNavigateStep('next')}
                  className="p-2.5 rounded-xl bg-[#242436] hover:bg-[#2E2E42] border border-[#37374D] text-[#A7A5B4] hover:text-[#F5F4F8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Próxima etapa"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Prominent "X" Button to Close Fullscreen */}
              <button
                type="button"
                onClick={handleCloseStep}
                className="p-2.5 sm:p-3 rounded-xl bg-[#28283C] hover:bg-rose-950/40 text-[#A7A5B4] hover:text-rose-300 border border-[#3A3A52] hover:border-rose-800/50 transition-all cursor-pointer shadow-md group"
                aria-label="Fechar e voltar à tela anterior"
                title="Fechar e voltar à tela anterior"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </header>

          {/* Full Screen Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Guidance Info Card */}
              <div className="rounded-2xl bg-[#222232] border border-[#2E2E42] p-5 flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#8B6BD9]/20 text-[#BC9EFD] border border-[#BC9EFD]/40 flex items-center justify-center shrink-0">
                    <currentActiveStepDef.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#F5F4F8]">
                      {currentActiveStepDef.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A7A5B4] leading-relaxed">
                      {currentActiveStepDef.guidance}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Form Subview */}
              <div className="rounded-2xl">
                {activeStageId === 'apresentacao' && <ProfileView />}
                {activeStageId === 'hard-skills' && <HardSkillsView />}
                {activeStageId === 'soft-skills' && <SoftSkillsView />}
                {activeStageId === 'formacao' && <EducationView />}
                {activeStageId === 'cursos' && <CoursesView />}
                {activeStageId === 'certificacoes' && <CertificationsView />}
                {activeStageId === 'projetos' && <ProjectsView />}
                {activeStageId === 'experiencias' && <ExperiencesView />}
              </div>
            </div>
          </div>

          {/* Bottom Bar with Actions */}
          <footer className="h-18 bg-[#1E1E2A] border-t border-[#2E2E42] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 shadow-lg z-20">
            <button
              type="button"
              onClick={handleCloseStep}
              className="px-5 py-2.5 rounded-xl bg-[#242436] hover:bg-[#2E2E42] border border-[#37374D] text-xs font-semibold text-[#A7A5B4] hover:text-[#F5F4F8] transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#BC9EFD]" />
              <span>Voltar à Trilha do Atlas</span>
            </button>

            <div className="flex items-center gap-3">
              {currentStepIndex < TRAIL_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => handleNavigateStep('next')}
                  className="px-5 py-2.5 rounded-xl bg-[#8B6BD9] hover:bg-[#7A5AC8] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>
                    Seguir para Etapa 0{currentStepIndex + 2} (
                    {TRAIL_STEPS[currentStepIndex + 1]?.title})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleCloseStep();
                    if (isMapFullyCompleted && onNavigateToCourses) {
                      onNavigateToCourses();
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#BC9EFD] hover:bg-[#CDAFFD] text-[#1A1A24] text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>
                    {isMapFullyCompleted
                      ? 'Concluir e Ir para Cursos e Trilhas'
                      : 'Finalizar e Ver Mapa'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};
