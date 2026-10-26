import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  HeartHandshake,
  Linkedin,
  FileText,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Clock,
  Settings,
  HelpCircle,
  Tag,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { aiApi, trackApi } from '../services/api';
import {
  CourseMaterial,
  PersonalizedLearningTrack,
  TrackActivity,
  TrackCategory,
  TrackCategoryKey,
  TrackModule,
} from '../types';

export const CoursesAndTracksView: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 0;

  // View Mode: 'roadmap' (compact 4-step home) | 'category' (modules & activities)
  const [currentView, setCurrentView] = useState<'roadmap' | 'category'>('roadmap');

  // Categories & Modules
  const [categories, setCategories] = useState<TrackCategory[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TrackCategoryKey>('hard-skills');
  const [allModules, setAllModules] = useState<TrackModule[]>([]);
  const [modules, setModules] = useState<TrackModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [personalizedTracks, setPersonalizedTracks] = useState<PersonalizedLearningTrack[]>([]);
  const [isGeneratingTrack, setIsGeneratingTrack] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Selected Activity Detail View
  const [selectedActivity, setSelectedActivity] = useState<TrackActivity | null>(null);

  // Administration State (Discreet access)
  const [adminMode, setAdminMode] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<TrackModule | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<TrackActivity | null>(null);
  const [actTitle, setActTitle] = useState('');
  const [actWhy, setActWhy] = useState('');
  const [actWhat, setActWhat] = useState('');

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [targetActivityId, setTargetActivityId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePlatform, setCoursePlatform] = useState('');
  const [courseUrl, setCourseUrl] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseIsFree, setCourseIsFree] = useState(true);
  const [courseDuration, setCourseDuration] = useState('');
  const [courseLevel, setCourseLevel] = useState('');
  const [courseModality, setCourseModality] = useState('');
  const [coursePrice, setCoursePrice] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load initial categories, modules, and user progress
  const loadData = async () => {
    setLoading(true);
    try {
      const cats = trackApi.getCategories();
      setCategories(cats);
      const adminModules = await trackApi.getModules();
      const savedTracks = trackApi.getPersonalizedTracks(userId);
      setPersonalizedTracks(savedTracks);
      const allMods = [...adminModules, ...savedTracks.flatMap((track) => track.modules)];
      setAllModules(allMods);

      const userProg = trackApi.getUserProgress(userId);
      setProgressMap(userProg);

      // Filter for current category
      const currentCatMods = allMods.filter((m) => m.categoryKey === selectedCategoryKey);
      setModules(currentCatMods);

      // Expand first module by default if not set
      if (currentCatMods.length > 0 && Object.keys(expandedModules).length === 0) {
        setExpandedModules({ [currentCatMods[0].id]: true });
      }
    } catch (err) {
      console.warn('Erro ao carregar trilhas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategoryKey, userId]);

  // Navigate to category screen
  const handleOpenCategory = (catKey: TrackCategoryKey) => {
    setSelectedCategoryKey(catKey);
    const catMods = allModules.filter((m) => m.categoryKey === catKey);
    setModules(catMods);
    if (catMods.length > 0) {
      setExpandedModules({ [catMods[0].id]: true });
    }
    setCurrentView('category');
    setSelectedActivity(null);
  };

  // Toggle Module Accordion
  const toggleModuleAccordion = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Toggle Activity Completion
  const handleToggleActivity = (activityId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = trackApi.toggleActivityProgress(userId, activityId);
    setProgressMap(updated);

    const isNowDone = updated[activityId];
    showToast(isNowDone ? 'Atividade concluída!' : 'Atividade desmarcada.');
  };

  const handleGenerateTrack = async () => {
    setIsGeneratingTrack(true);
    setGenerationError(null);
    try {
      if (!user) throw new Error('Entre na sua conta para gerar uma trilha personalizada.');
      const draft = await aiApi.generateLearningTrack();
      const generatedAt = new Date().toISOString();
      const trackId = `gemini-${Date.now()}`;
      const track: PersonalizedLearningTrack = {
        id: trackId,
        generatedAt,
        goal: draft.goal,
        competencies: draft.competencies,
        modules: draft.modules.map((module, moduleIndex) => {
          const moduleId = `${trackId}-module-${moduleIndex + 1}`;
          return {
            ...module,
            id: moduleId,
            isAiGenerated: true,
            generatedAt,
            goal: draft.goal,
            competencies: draft.competencies,
            activities: module.activities.map((activity, activityIndex) => ({
              ...activity,
              id: `${trackId}-activity-${moduleIndex + 1}-${activityIndex + 1}`,
              moduleId,
            })),
          };
        }),
      };
      trackApi.savePersonalizedTrack(user.id, track);
      const savedTracks = [...personalizedTracks, track];
      const adminModules = await trackApi.getModules();
      const nextModules = [...adminModules, ...savedTracks.flatMap((saved) => saved.modules)];
      setPersonalizedTracks(savedTracks);
      setAllModules(nextModules);
      const firstCategory = track.modules[0]?.categoryKey || selectedCategoryKey;
      setSelectedCategoryKey(firstCategory);
      setModules(nextModules.filter((module) => module.categoryKey === firstCategory));
      setExpandedModules({ [track.modules[0].id]: true });
      setCurrentView('category');
      setSelectedActivity(null);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Não foi possível gerar a trilha.');
    } finally {
      setIsGeneratingTrack(false);
    }
  };

  // Stats helper for any category key
  const getCategoryProgress = (catKey: TrackCategoryKey) => {
    const catMods = allModules.filter((m) => m.categoryKey === catKey);
    let totalActs = 0;
    let completedActs = 0;

    catMods.forEach((mod) => {
      (mod.activities || []).forEach((act) => {
        totalActs++;
        if (progressMap[act.id]) {
          completedActs++;
        }
      });
    });

    const percent = totalActs > 0 ? Math.round((completedActs / totalActs) * 100) : 0;
    return { totalActs, completedActs, percent };
  };

  // Current category stats
  const currentCategory = categories.find((c) => c.key === selectedCategoryKey);
  const latestPersonalizedTrack = personalizedTracks[personalizedTracks.length - 1];
  const currentCategoryStats = useMemo(() => {
    return getCategoryProgress(selectedCategoryKey);
  }, [allModules, selectedCategoryKey, progressMap]);

  // Category Icon helper
  const getCategoryIcon = (key: TrackCategoryKey) => {
    switch (key) {
      case 'hard-skills':
        return Code2;
      case 'soft-skills':
        return HeartHandshake;
      case 'linkedin':
        return Linkedin;
      case 'curriculo':
        return FileText;
      default:
        return BookOpen;
    }
  };

  // ================= ADMIN HANDLERS =================
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    if (editingModule) {
      await trackApi.updateModule(editingModule.id, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim(),
      });
      showToast('Módulo atualizado!');
    } else {
      await trackApi.addModule(selectedCategoryKey, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim(),
      });
      showToast('Novo módulo criado!');
    }
    setModuleModalOpen(false);
    setEditingModule(null);
    setModuleTitle('');
    setModuleDesc('');
    await loadData();
  };

  const handleDeleteModule = async (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir este módulo e todas as suas atividades?')) return;
    await trackApi.deleteModule(moduleId);
    showToast('Módulo excluído.');
    await loadData();
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    const items = actWhat
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

    if (editingActivity) {
      await trackApi.updateActivity(editingActivity.id, {
        title: actTitle.trim(),
        whyLearn: actWhy.trim(),
        whatYouWillLearn: items,
      });
      showToast('Atividade atualizada!');
    } else if (targetModuleId) {
      await trackApi.addActivity(targetModuleId, {
        title: actTitle.trim(),
        whyLearn: actWhy.trim(),
        whatYouWillLearn: items,
      });
      showToast('Nova atividade adicionada!');
    }
    setActivityModalOpen(false);
    setEditingActivity(null);
    setActTitle('');
    setActWhy('');
    setActWhat('');
    await loadData();
  };

  const handleDeleteActivity = async (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta atividade?')) return;
    await trackApi.deleteActivity(activityId);
    showToast('Atividade excluída.');
    if (selectedActivity?.id === activityId) setSelectedActivity(null);
    await loadData();
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetActivityId || !courseTitle.trim() || !coursePlatform.trim()) return;

    await trackApi.addCourse(targetActivityId, {
      title: courseTitle.trim(),
      platform: coursePlatform.trim(),
      url: courseUrl.trim(),
      description: courseDesc.trim(),
      isFree: courseIsFree,
      estimatedDuration: courseDuration.trim() || undefined,
      level: courseLevel.trim() || undefined,
      modality: courseModality.trim() || undefined,
      price: coursePrice ? Number(coursePrice) : undefined,
      isDemo: false,
    });

    showToast('Curso associado com sucesso!');
    setCourseModalOpen(false);
    setCourseTitle('');
    setCoursePlatform('');
    setCourseUrl('');
    setCourseDesc('');
    setCourseDuration('');
    setCourseLevel('');
    setCourseModality('');
    setCoursePrice('');
    await loadData();

    // Refresh selected activity if open
    const allMods = await trackApi.getModules(selectedCategoryKey);
    for (const m of allMods) {
      const match = m.activities.find((a) => a.id === targetActivityId);
      if (match) {
        setSelectedActivity(match);
        break;
      }
    }
  };

  const handleDeleteCourse = async (activityId: string, courseId: string) => {
    if (!confirm('Deseja remover este curso da atividade?')) return;
    await trackApi.deleteCourse(activityId, courseId);
    showToast('Curso removido.');
    await loadData();

    const allMods = await trackApi.getModules(selectedCategoryKey);
    for (const m of allMods) {
      const match = m.activities.find((a) => a.id === activityId);
      if (match) {
        setSelectedActivity(match);
        break;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E2A] border border-[#BC9EFD]/50 rounded-xl p-3.5 shadow-xl flex items-center gap-2.5 max-w-sm animate-fade-in text-xs text-[#F5F4F8]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. COMPACT ROADMAP HOME VIEW (NO BANNERS, NO LARGE CARDS) */}
      {/* ======================================================== */}
      {currentView === 'roadmap' && (
        <div className="py-4 sm:py-6 space-y-10 animate-fade-in">
          {/* Acesso discreto à administração */}
          <div className="flex justify-end">
            <button
              onClick={() => setAdminMode(!adminMode)}
              className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 border ${
                adminMode
                  ? 'bg-[#8B6BD9]/20 text-[#BC9EFD] border-[#BC9EFD]/40'
                  : 'text-[#767487] hover:text-[#A7A5B4] border-transparent hover:border-[#2D2D40]'
              }`}
              title="Administração de conteúdos"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {adminMode ? 'Edição ativa' : 'Admin'}
              </span>
            </button>
          </div>

          <section className="rounded-2xl border border-[#2D2D40] bg-[#222230] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#BC9EFD]">
                  <Sparkles className="h-4 w-4" />
                  Gemini · trilha personalizada
                </div>
                <h2 className="text-lg font-bold text-[#F5F4F8]">Aprenda em direção ao seu objetivo</h2>
                <p className="max-w-2xl text-xs leading-relaxed text-[#A7A5B4]">
                  A IA usa seu perfil, competências e histórico cadastrados, além dos materiais reais do catálogo.
                  Dados de contato e links pessoais não são enviados.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateTrack}
                disabled={isGeneratingTrack || !user}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#8B6BD9] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#9D80E6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingTrack
                  ? <><Sparkles className="h-4 w-4 animate-pulse" />Gerando trilha...</>
                  : <><Sparkles className="h-4 w-4" />{latestPersonalizedTrack ? 'Gerar novamente' : 'Gerar minha trilha'}</>}
              </button>
            </div>
            {generationError && (
              <div role="alert" className="rounded-xl border border-rose-800/70 bg-rose-950/30 p-3 text-xs text-rose-200">
                {generationError}
              </div>
            )}
            {latestPersonalizedTrack ? (
              <div className="rounded-xl border border-[#2D2D40] bg-[#1A1A24] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A7A5B4]">
                  Última trilha · {new Date(latestPersonalizedTrack.generatedAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#F5F4F8]">{latestPersonalizedTrack.goal}</p>
                {latestPersonalizedTrack.competencies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {latestPersonalizedTrack.competencies.map((competency) => (
                      <span key={competency} className="rounded-full border border-[#BC9EFD]/30 bg-[#8B6BD9]/10 px-2.5 py-1 text-[10px] text-[#D4CDE6]">
                        {competency}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-[#2D2D40] bg-[#1A1A24] p-4 text-xs text-[#A7A5B4]">
                Nenhuma trilha personalizada foi gerada. Atualize seu objetivo e competências no perfil e gere uma nova trilha.
              </p>
            )}
          </section>

          {/* Compact 4-Step Category Roadmap */}
          <div className="pt-2">
            {/* Desktop / Tablet: Horizontal Subtle Connected Path */}
            <div className="hidden sm:block relative">
              {/* Thin connecting line behind nodes */}
              <div className="absolute top-7 left-12 right-12 h-[2px] bg-[#2D2D40] -z-0" />

              <div className="grid grid-cols-4 gap-4 relative z-10">
                {categories.map((cat, index) => {
                  const Icon = getCategoryIcon(cat.key);
                  const stats = getCategoryProgress(cat.key);
                  const isStarted = stats.completedActs > 0;
                  const isCompleted = stats.totalActs > 0 && stats.completedActs === stats.totalActs;

                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleOpenCategory(cat.key)}
                      className="group flex flex-col items-center text-center cursor-pointer focus:outline-none transition-all p-3 rounded-2xl hover:bg-[#1E1E2A]/40"
                    >
                      {/* Step Circle Node */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 border ${
                          isCompleted
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : isStarted
                            ? 'bg-[#8B6BD9]/20 border-[#BC9EFD] text-[#BC9EFD] shadow-sm shadow-[#8B6BD9]/20'
                            : 'bg-[#1E1E2A] border-[#2D2D40] text-[#A7A5B4] group-hover:border-[#BC9EFD]/60 group-hover:text-[#BC9EFD] group-hover:scale-105'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Step Label */}
                      <span className="text-sm font-semibold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors mt-3">
                        {cat.title}
                      </span>

                      {/* Subtle Progress / Status Indicator */}
                      <span className="text-[11px] text-[#A7A5B4] mt-1 font-mono">
                        {stats.totalActs > 0
                          ? isCompleted
                            ? 'Concluída'
                            : `${stats.completedActs}/${stats.totalActs} concluídas`
                          : 'Disponível'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile: Vertical Compact Stepped Path */}
            <div className="sm:hidden relative pl-6 space-y-6">
              {/* Thin vertical connecting line */}
              <div className="absolute left-[31px] top-4 bottom-4 w-[2px] bg-[#2D2D40] -z-0" />

              {categories.map((cat, index) => {
                const Icon = getCategoryIcon(cat.key);
                const stats = getCategoryProgress(cat.key);
                const isStarted = stats.completedActs > 0;
                const isCompleted = stats.totalActs > 0 && stats.completedActs === stats.totalActs;

                return (
                  <button
                    key={cat.key}
                    onClick={() => handleOpenCategory(cat.key)}
                    className="group w-full flex items-center gap-4 text-left cursor-pointer focus:outline-none p-2.5 rounded-xl hover:bg-[#1E1E2A]/50 transition-all relative z-10"
                  >
                    {/* Step Node */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : isStarted
                          ? 'bg-[#8B6BD9]/20 border-[#BC9EFD] text-[#BC9EFD]'
                          : 'bg-[#1E1E2A] border-[#2D2D40] text-[#A7A5B4] group-hover:border-[#BC9EFD] group-hover:text-[#BC9EFD]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Step Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-[#A7A5B4] mt-0.5">
                        {stats.totalActs > 0
                          ? `${stats.completedActs} de ${stats.totalActs} atividades concluídas`
                          : 'Explorar trilha'}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#767487] group-hover:text-[#BC9EFD] transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SPECIFIC CATEGORY VIEW (EXPANDABLE MODULES ACCORDION) */}
      {/* ======================================================== */}
      {currentView === 'category' && currentCategory && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar with Clean Back Button and Category Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2D2D40]/60">
            <div>
              <button
                onClick={() => setCurrentView('roadmap')}
                className="inline-flex items-center gap-1.5 text-xs text-[#A7A5B4] hover:text-[#BC9EFD] font-medium transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para Trilhas</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8B6BD9]/20 border border-[#BC9EFD]/40 text-[#BC9EFD] flex items-center justify-center">
                  {(() => {
                    const Icon = getCategoryIcon(currentCategory.key);
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F4F8]">
                    {currentCategory.title}
                  </h2>
                  <p className="text-xs text-[#A7A5B4]">{currentCategory.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Subtle Progress Stats & Admin Trigger */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-mono font-semibold text-[#BC9EFD]">
                  {currentCategoryStats.completedActs} de {currentCategoryStats.totalActs} concluídas
                </span>
                <div className="w-28 bg-[#2D2D40] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B6BD9] to-[#BC9EFD] rounded-full transition-all duration-300"
                    style={{ width: `${currentCategoryStats.percent}%` }}
                  />
                </div>
              </div>

              {adminMode && (
                <button
                  onClick={() => {
                    setEditingModule(null);
                    setModuleTitle('');
                    setModuleDesc('');
                    setModuleModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#8B6BD9] hover:bg-[#9D80E6] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Módulo</span>
                </button>
              )}
            </div>
          </div>

          {latestPersonalizedTrack && modules.some((module) => module.isAiGenerated) && (
            <section className="rounded-xl border border-[#BC9EFD]/20 bg-[#8B6BD9]/10 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#BC9EFD]">Objetivo da trilha Gemini</p>
              <p className="mt-1 text-sm font-semibold text-[#F5F4F8]">{latestPersonalizedTrack.goal}</p>
              <p className="mt-1 text-[11px] text-[#A7A5B4]">
                As trilhas anteriores e seu progresso foram mantidos.
              </p>
            </section>
          )}

          {/* Modules Accordion List */}
          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#A7A5B4]">
                <div className="w-5 h-5 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Carregando módulos...
              </div>
            ) : modules.length === 0 ? (
              <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-10 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-[#8B6BD9] mx-auto opacity-60" />
                <h4 className="text-sm font-semibold text-[#F5F4F8]">
                  Nenhum conteúdo disponível nesta categoria
                </h4>
                <p className="text-xs text-[#A7A5B4] max-w-sm mx-auto">
                  Gere uma trilha personalizada ou cadastre conteúdos reais no catálogo.
                </p>
                {adminMode && (
                  <button
                    onClick={() => {
                      setEditingModule(null);
                      setModuleTitle('');
                      setModuleDesc('');
                      setModuleModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#BC9EFD] text-[#1A1A24] font-bold text-xs mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Primeiro Módulo</span>
                  </button>
                )}
              </div>
            ) : (
              modules.map((module) => {
                const isExpanded = expandedModules[module.id] ?? false;
                const acts = module.activities || [];
                const completedCount = acts.filter((a) => progressMap[a.id]).length;

                return (
                  <div
                    key={module.id}
                    className="rounded-xl bg-[#1E1E2A] border border-[#2D2D40] overflow-hidden transition-all"
                  >
                    {/* Module Accordion Header */}
                    <div
                      onClick={() => toggleModuleAccordion(module.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#222232] transition-colors select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-[#1A1A24] border border-[#2D2D40] flex items-center justify-center text-xs font-mono font-bold text-[#BC9EFD] shrink-0">
                          {module.order}
                        </span>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#F5F4F8] truncate">
                            {module.title}
                          </h4>
                          {module.description && (
                            <p className="text-xs text-[#A7A5B4] truncate mt-0.5">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Meta & Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-[#A7A5B4]">
                          {completedCount}/{acts.length}
                        </span>

                        {adminMode && !module.isAiGenerated && (
                          <div
                            className="flex items-center gap-1 mr-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setTargetModuleId(module.id);
                                setEditingActivity(null);
                                setActTitle('');
                                setActWhy('');
                                setActWhat('');
                                setActivityModalOpen(true);
                              }}
                              className="p-1 rounded bg-[#1A1A24] text-[#BC9EFD] hover:text-white border border-[#2D2D40] text-[10px] px-1.5"
                              title="Adicionar atividade"
                            >
                              + Ativ
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingModule(module);
                                setModuleTitle(module.title);
                                setModuleDesc(module.description || '');
                                setModuleModalOpen(true);
                              }}
                              className="p-1 rounded bg-[#1A1A24] text-[#A7A5B4] hover:text-[#F5F4F8] border border-[#2D2D40]"
                              title="Editar módulo"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteModule(module.id, e)}
                              className="p-1 rounded bg-[#1A1A24] text-[#A7A5B4] hover:text-rose-400 border border-[#2D2D40]"
                              title="Excluir módulo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <ChevronDown
                          className={`w-4 h-4 text-[#A7A5B4] transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-[#BC9EFD]' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Module Activities Toggle Content */}
                    {isExpanded && (
                      <div className="border-t border-[#2D2D40] bg-[#1A1A24]/70 p-3 space-y-2">
                        {acts.length === 0 ? (
                          <p className="text-center text-xs text-[#767487] py-3">
                            Nenhuma atividade cadastrada neste módulo.
                          </p>
                        ) : (
                          acts.map((act) => {
                            const isDone = progressMap[act.id] ?? false;
                            const freeCount = (act.courses || []).filter((c) => c.isFree).length;
                            const paidCount = (act.courses || []).filter((c) => !c.isFree).length;

                            return (
                              <div
                                key={act.id}
                                onClick={() => setSelectedActivity(act)}
                                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                                  isDone
                                    ? 'bg-[#1E1E2A]/70 border-[#2D2D40]'
                                    : 'bg-[#1E1E2A] border-[#2D2D40] hover:border-[#8B6BD9]/40 hover:bg-[#222232]'
                                }`}
                              >
                                {/* Checkbox & Title */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleActivity(act.id, e)}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                      isDone
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : 'bg-[#1A1A24] text-[#767487] border border-[#2D2D40] hover:border-[#BC9EFD] hover:text-[#BC9EFD]'
                                    }`}
                                    aria-label="Concluir atividade"
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <h5
                                      className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                                        isDone
                                          ? 'text-[#767487] line-through'
                                          : 'text-[#F5F4F8] group-hover:text-[#BC9EFD]'
                                      }`}
                                    >
                                      {act.title}
                                    </h5>
                                    <span className="text-[10px] text-[#A7A5B4]">
                                      {freeCount > 0 ? `${freeCount} curso(s)` : 'Conteúdo guiado'}
                                      {paidCount > 0 && ` · ${paidCount} pago(s)`}
                                    </span>
                                  </div>
                                </div>

                                {/* Right Action */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {adminMode && (
                                    <div
                                      className="flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={() => {
                                          setTargetActivityId(act.id);
                                          setCourseTitle('');
                                          setCoursePlatform('');
                                          setCourseUrl('');
                                          setCourseDesc('');
                                          setCourseIsFree(true);
                                          setCourseDuration('');
                                          setCourseLevel('');
                                          setCourseModality('');
                                          setCoursePrice('');
                                          setCourseModalOpen(true);
                                        }}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1A24] text-[#BC9EFD] border border-[#2D2D40]"
                                        title="Adicionar curso"
                                      >
                                        + Curso
                                      </button>
                                      <button
                                        onClick={() => {
                                          setTargetModuleId(module.id);
                                          setEditingActivity(act);
                                          setActTitle(act.title);
                                          setActWhy(act.whyLearn || '');
                                          setActWhat((act.whatYouWillLearn || []).join('\n'));
                                          setActivityModalOpen(true);
                                        }}
                                        className="p-1 rounded bg-[#1A1A24] text-[#A7A5B4] hover:text-[#F5F4F8] border border-[#2D2D40]"
                                        title="Editar atividade"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteActivity(act.id, e)}
                                        className="p-1 rounded bg-[#1A1A24] text-[#A7A5B4] hover:text-rose-400 border border-[#2D2D40]"
                                        title="Excluir atividade"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  <span className="text-xs text-[#BC9EFD] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                                    <span>Ver</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ACTIVITY DETAILS SCREEN / MODAL                             */}
      {/* ============================================================== */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-[#1A1A24] flex flex-col overflow-hidden animate-fade-in">
          {/* Top Bar with Prominent "X" and Status */}
          <header className="h-16 bg-[#1E1E2A] border-b border-[#2D2D40] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 shadow-sm z-30">
            {/* Left: Back to Category */}
            <button
              onClick={() => setSelectedActivity(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A24] hover:bg-[#262638] border border-[#2D2D40] text-xs font-semibold text-[#F5F4F8] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#BC9EFD]" />
              <span>Voltar</span>
            </button>

            {/* Center: Title */}
            <div className="text-center truncate px-2">
              <span className="text-[10px] font-mono text-[#BC9EFD] uppercase tracking-wider block">
                {currentCategory?.title}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-[#F5F4F8] truncate max-w-sm sm:max-w-md">
                {selectedActivity.title}
              </h2>
            </div>

            {/* Right: Toggle Completion & Close "X" Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleToggleActivity(selectedActivity.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  progressMap[selectedActivity.id]
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-[#8B6BD9] hover:bg-[#9D80E6] text-white shadow-sm'
                }`}
              >
                {progressMap[selectedActivity.id] ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Concluída</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5" />
                    <span>Marcar como Concluída</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1.5 rounded-lg bg-[#1A1A24] hover:bg-[#262638] text-[#A7A5B4] hover:text-[#F5F4F8] border border-[#2D2D40] transition-colors"
                aria-label="Fechar detalhes"
                title="Fechar e voltar à tela anterior"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Activity Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header Box */}
              <div className="rounded-xl bg-[#1E1E2A] border border-[#2D2D40] p-5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#8B6BD9]/15 text-[#BC9EFD]">
                    Atividade de Desenvolvimento
                  </span>
                  {progressMap[selectedActivity.id] && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Concluída
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#F5F4F8]">
                  {selectedActivity.title}
                </h3>
              </div>

              {/* 1. Por que aprender */}
              <div className="rounded-xl bg-[#1E1E2A] border border-[#2D2D40] p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F5F4F8] border-b border-[#2D2D40] pb-2">
                  <HelpCircle className="w-4 h-4 text-[#BC9EFD]" />
                  <span>Por que aprender</span>
                </div>
                <p className="text-xs sm:text-sm text-[#D4CDE6] leading-relaxed">
                  {selectedActivity.whyLearn ||
                    'Conteúdo fundamental para a evolução das suas competências e aplicação profissional consciente.'}
                </p>
              </div>

              {/* 2. O que você vai aprender */}
              <div className="rounded-xl bg-[#1E1E2A] border border-[#2D2D40] p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F5F4F8] border-b border-[#2D2D40] pb-2">
                  <Sparkles className="w-4 h-4 text-[#BC9EFD]" />
                  <span>O que você vai aprender</span>
                </div>
                <ul className="space-y-2 pt-1">
                  {(selectedActivity.whatYouWillLearn || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#D4CDE6]">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#8B6BD9]/30 text-[#BC9EFD] flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                        ✓
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Cursos Gratuitos */}
              <div className="rounded-xl bg-[#1E1E2A] border border-[#2D2D40] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#2D2D40] pb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Cursos Gratuitos</span>
                  </div>
                  <span className="text-[11px] text-[#A7A5B4]">
                    Materiais abertos e capacitações sem custo
                  </span>
                </div>

                {(() => {
                  const freeList = (selectedActivity.courses || []).filter((c) => c.isFree);
                  if (freeList.length === 0) {
                    return (
                      <div className="p-4 rounded-lg bg-[#1A1A24] border border-[#2D2D40] text-center text-xs text-[#A7A5B4]">
                        Não foi encontrado um recurso correspondente no catálogo cadastrado.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {freeList.map((course) => (
                        <div
                          key={course.id}
                          className="rounded-lg bg-[#1A1A24] border border-[#2D2D40] p-3.5 flex flex-col justify-between space-y-2.5"
                        >
                          <div className="space-y-1">
                            <span className="font-semibold text-emerald-400 text-[11px] block">
                              {course.platform}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-[#F5F4F8] leading-snug">
                              {course.title}
                            </h4>
                            <p className="text-xs text-[#A7A5B4] line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                            {(course.level || course.modality || typeof course.price === 'number') && (
                              <p className="text-[10px] text-[#767487]">
                                {[course.level, course.modality, typeof course.price === 'number' ? `R$ ${course.price.toFixed(2)}` : '']
                                  .filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#2D2D40] flex items-center justify-between text-xs">
                            {course.estimatedDuration && (
                              <span className="text-[10px] text-[#767487] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-400" />
                                {course.estimatedDuration}
                              </span>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                              {adminMode && !selectedActivity.id.startsWith('gemini-') && (
                                <button
                                  onClick={() =>
                                    handleDeleteCourse(selectedActivity.id, course.id)
                                  }
                                  className="text-xs text-rose-400 hover:text-rose-300 p-1"
                                  title="Remover curso"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {course.url ? (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                                >
                                  <span>Acessar</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-[#767487]">Link não informado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* 4. Cursos Pagos (Opcional) */}
              <div className="rounded-xl bg-[#1E1E2A] border border-[#2D2D40] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#2D2D40] pb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#BC9EFD]">
                    <Tag className="w-4 h-4 text-[#BC9EFD]" />
                    <span>Cursos Pagos (Opcional)</span>
                  </div>
                  <span className="text-[11px] text-[#A7A5B4]">
                    Para quem deseja investir em formações complementares
                  </span>
                </div>

                {(() => {
                  const paidList = (selectedActivity.courses || []).filter((c) => !c.isFree);
                  if (paidList.length === 0) {
                    return (
                      <div className="p-4 rounded-lg bg-[#1A1A24] border border-[#2D2D40] text-center text-xs text-[#A7A5B4]">
                        Não foi encontrado um recurso correspondente no catálogo cadastrado.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paidList.map((course) => (
                        <div
                          key={course.id}
                          className="rounded-lg bg-[#1A1A24] border border-[#2D2D40] p-3.5 flex flex-col justify-between space-y-2.5"
                        >
                          <div className="space-y-1">
                            <span className="font-semibold text-[#BC9EFD] text-[11px] block">
                              {course.platform}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-[#F5F4F8] leading-snug">
                              {course.title}
                            </h4>
                            <p className="text-xs text-[#A7A5B4] line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                            {(course.level || course.modality || typeof course.price === 'number') && (
                              <p className="text-[10px] text-[#767487]">
                                {[course.level, course.modality, typeof course.price === 'number' ? `R$ ${course.price.toFixed(2)}` : '']
                                  .filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#2D2D40] flex items-center justify-between text-xs">
                            {course.estimatedDuration && (
                              <span className="text-[10px] text-[#767487] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#BC9EFD]" />
                                {course.estimatedDuration}
                              </span>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                              {adminMode && !selectedActivity.id.startsWith('gemini-') && (
                                <button
                                  onClick={() =>
                                    handleDeleteCourse(selectedActivity.id, course.id)
                                  }
                                  className="text-xs text-rose-400 hover:text-rose-300 p-1"
                                  title="Remover curso"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {course.url ? (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#BC9EFD] hover:text-[#9D80E6]"
                                >
                                  <span>Acessar</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-[#767487]">Link não informado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODALS DE ADMINISTRAÇÃO (MÓDULO, ATIVIDADE, CURSO)           */}
      {/* ============================================================== */}

      {/* Modal: Módulo */}
      {moduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1E1E2A] border border-[#2D2D40] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5F4F8]">
                {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
              </h3>
              <button
                onClick={() => setModuleModalOpen(false)}
                className="text-[#A7A5B4] hover:text-[#F5F4F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-3">
              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">Título do Módulo *</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Ex: Módulo 1: Fundamentos"
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8] focus:border-[#BC9EFD]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Breve resumo dos conceitos deste módulo..."
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8] focus:border-[#BC9EFD]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1A1A24] text-xs text-[#A7A5B4] hover:text-[#F5F4F8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B6BD9] hover:bg-[#9D80E6] text-white text-xs font-semibold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Atividade */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1E1E2A] border border-[#2D2D40] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5F4F8]">
                {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
              </h3>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="text-[#A7A5B4] hover:text-[#F5F4F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3">
              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">Título da Atividade *</label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="Ex: Sistemas Operacionais"
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">Por que aprender</label>
                <textarea
                  rows={3}
                  value={actWhy}
                  onChange={(e) => setActWhy(e.target.value)}
                  placeholder="Explique a relevância para o mercado e trajetória profissional..."
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">
                  O que você vai aprender (um item por linha)
                </label>
                <textarea
                  rows={3}
                  value={actWhat}
                  onChange={(e) => setActWhat(e.target.value)}
                  placeholder="Estrutura de processos e threads&#10;Gerenciamento de memória&#10;Sistemas de arquivos"
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivityModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1A1A24] text-xs text-[#A7A5B4]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B6BD9] text-white text-xs font-semibold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Curso */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1E1E2A] border border-[#2D2D40] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5F4F8]">Adicionar Curso à Atividade</h3>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="text-[#A7A5B4] hover:text-[#F5F4F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3">
              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">Título do Curso *</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Ex: Introdução a Sistemas Operacionais"
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A7A5B4] mb-1">Plataforma *</label>
                  <input
                    type="text"
                    required
                    value={coursePlatform}
                    onChange={(e) => setCoursePlatform(e.target.value)}
                    placeholder="Ex: Coursera, YouTube, Udemy"
                    className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A7A5B4] mb-1">Duração Estimada</label>
                  <input
                    type="text"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="Ex: 8 horas"
                    className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">Link de Acesso</label>
                <input
                  type="url"
                  value={courseUrl}
                  onChange={(e) => setCourseUrl(e.target.value)}
                  placeholder="https://... (opcional)"
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#A7A5B4] mb-1">Nível</label>
                  <input
                    type="text"
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                    placeholder="Intermediário"
                    className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A7A5B4] mb-1">Modalidade</label>
                  <input
                    type="text"
                    value={courseModality}
                    onChange={(e) => setCourseModality(e.target.value)}
                    placeholder="Online"
                    className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A7A5B4] mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#A7A5B4] mb-1">Breve Descrição</label>
                <textarea
                  rows={2}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Resumo do conteúdo programático..."
                  className="w-full bg-[#1A1A24] border border-[#2D2D40] rounded-lg px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFreeCheck"
                  checked={courseIsFree}
                  onChange={(e) => setCourseIsFree(e.target.checked)}
                  className="rounded border-[#2D2D40] text-[#8B6BD9] focus:ring-[#BC9EFD]"
                />
                <label htmlFor="isFreeCheck" className="text-xs text-[#F5F4F8]">
                  Curso gratuito (sem custos para o usuário)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1A1A24] text-xs text-[#A7A5B4]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B6BD9] text-white text-xs font-semibold"
                >
                  Salvar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
