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
  ArrowRight,
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
  RefreshCw,
  AlertCircle,
  Target,
  Compass,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackApi } from '../services/api';
import {
  CourseMaterial,
  TrackActivity,
  TrackCategory,
  TrackCategoryKey,
  TrackModule,
} from '../types';

interface CoursesAndTracksViewProps {
  onNavigateToProfile?: () => void;
}

export const CoursesAndTracksView: React.FC<CoursesAndTracksViewProps> = ({ onNavigateToProfile }) => {
  const { user, profile } = useAuth();
  const userId = user?.id || 1;

  // View Mode: 'roadmap' (compact 4-step home) | 'category' (modules & activities)
  const [currentView, setCurrentView] = useState<'roadmap' | 'category'>('roadmap');

  // Categories & Modules
  const [categories, setCategories] = useState<TrackCategory[]>([]);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TrackCategoryKey>('hard-skills');
  const [allModules, setAllModules] = useState<TrackModule[]>([]);
  const [modules, setModules] = useState<TrackModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Profile readiness state (IA não deve gerar trilhas sem teste/habilidades respondidas)
  const [requiresProfile, setRequiresProfile] = useState<boolean>(false);
  const [profileStatus, setProfileStatus] = useState<any>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Gemini AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  const [userGoal, setUserGoal] = useState<string>('');
  const [userArea, setUserArea] = useState<string>('');

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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load personalized tracks from API/Encrypted Storage
  const loadData = async () => {
    setLoading(true);
    setGenerationError(null);
    try {
      const res = await trackApi.getPersonalizedTracks();

      // Sem responder o teste de perfil e cadastrar habilidades, NÃO gera as trilhas
      if (res && res.requiresProfile) {
        setRequiresProfile(true);
        setProfileStatus(res.profileStatus || null);
        setHasGenerated(false);
        setCategories([]);
        setAllModules([]);
        setLoading(false);
        return;
      }

      setRequiresProfile(false);
      setProfileStatus(res?.profileStatus || null);

      if (res && res.hasGenerated && res.tracks) {
        setHasGenerated(true);
        setCategories(res.tracks.categories || []);
        setAllModules(res.tracks.modules || []);
        setUserGoal(res.tracks.userGoal || profile?.careerGoal || '');
        setUserArea(res.tracks.userArea || profile?.primaryArea || '');
        setLastGeneratedAt(res.tracks.generatedAt || null);
        setProgressMap(res.progress || {});

        const currentCatMods = (res.tracks.modules || []).filter(
          (m) => m.categoryKey === selectedCategoryKey
        );
        setModules(currentCatMods);

        if (currentCatMods.length > 0 && Object.keys(expandedModules).length === 0) {
          setExpandedModules({ [currentCatMods[0].id]: true });
        }
      } else {
        // Perfil preenchido, mas ainda não gerou trilhas com Gemini
        setHasGenerated(false);
        setCategories([]);
        setAllModules([]);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar dados das trilhas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Sincroniza automaticamente quando o usuário cadastra habilidades no perfil
    const handleDataChanged = () => {
      loadData();
    };
    window.addEventListener('atlas_data_changed', handleDataChanged);
    return () => window.removeEventListener('atlas_data_changed', handleDataChanged);
  }, []);

  // Update filtered modules when selectedCategoryKey or allModules changes
  useEffect(() => {
    const catMods = allModules.filter((m) => m.categoryKey === selectedCategoryKey);
    setModules(catMods);
    if (catMods.length > 0 && !expandedModules[catMods[0].id]) {
      setExpandedModules((prev) => ({ ...prev, [catMods[0].id]: true }));
    }
  }, [selectedCategoryKey, allModules]);

  // Handle Dynamic Gemini Generation
  const handleGenerateTracks = async (isManualRefresh = true) => {
    if (requiresProfile) {
      if (onNavigateToProfile) onNavigateToProfile();
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await trackApi.generatePersonalizedTracks();

      if (res && res.requiresProfile) {
        setRequiresProfile(true);
        setProfileStatus(res.profileStatus);
        setGenerationError(
          res.message || 'Sem responder o teste de perfil, não é possível gerar as trilhas.'
        );
        return;
      }

      if (res && res.tracks) {
        setHasGenerated(true);
        setRequiresProfile(false);
        setCategories(res.tracks.categories || []);
        setAllModules(res.tracks.modules || []);
        setUserGoal(res.tracks.userGoal || profile?.careerGoal || '');
        setUserArea(res.tracks.userArea || profile?.primaryArea || '');
        setLastGeneratedAt(res.tracks.generatedAt || new Date().toISOString());
        setProgressMap(res.progress || {});

        const currentCatMods = (res.tracks.modules || []).filter(
          (m) => m.categoryKey === selectedCategoryKey
        );
        setModules(currentCatMods);

        if (currentCatMods.length > 0) {
          setExpandedModules({ [currentCatMods[0].id]: true });
        }

        if (isManualRefresh) {
          showToast('Trilhas personalizadas geradas com sucesso pelo Gemini!');
        }
      }
    } catch (err: any) {
      console.error('Falha ao gerar trilhas personalizadas:', err);
      setGenerationError(
        err?.message ||
          'Não foi possível conectar ao Gemini para gerar as trilhas. Você pode tentar novamente.'
      );
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

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
    showToast(isNowDone ? 'Atividade concluída com sucesso!' : 'Atividade desmarcada.');
  };

  // Real Stats helper for any category key (calculated from actual generated activities)
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

  // Overall progress across all 4 categories
  const overallProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    allModules.forEach((m) => {
      (m.activities || []).forEach((a) => {
        total++;
        if (progressMap[a.id]) completed++;
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [allModules, progressMap]);

  // Current category
  const currentCategory = categories.find((c) => c.key === selectedCategoryKey) || {
    key: selectedCategoryKey,
    title: selectedCategoryKey === 'hard-skills' ? 'Hard Skills' : selectedCategoryKey === 'soft-skills' ? 'Soft Skills' : selectedCategoryKey === 'linkedin' ? 'LinkedIn' : 'Currículo',
    subtitle: 'Trilha de Aprendizagem',
    description: 'Trilha personalizada de desenvolvimento de competências.',
  };

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
        whatYouWillLearn: items.length > 0 ? items : ['Conteúdo prático para aplicação real.'],
      });
      showToast('Atividade atualizada!');
    } else if (targetModuleId) {
      await trackApi.addActivity(targetModuleId, {
        title: actTitle.trim(),
        whyLearn: actWhy.trim(),
        whatYouWillLearn: items.length > 0 ? items : ['Conteúdo prático para aplicação real.'],
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
      url: courseUrl.trim() || 'https://www.google.com',
      description: courseDesc.trim() || 'Material recomendado para aprofundamento na atividade.',
      isFree: courseIsFree,
      estimatedDuration: courseDuration.trim() || 'Sob demanda',
      isDemo: false,
    });

    showToast('Curso associado com sucesso!');
    setCourseModalOpen(false);
    setCourseTitle('');
    setCoursePlatform('');
    setCourseUrl('');
    setCourseDesc('');
    setCourseDuration('');
    await loadData();

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
    <div className="max-w-5xl mx-auto space-y-8 pb-16 relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E2A] border border-[#BC9EFD]/50 rounded-xl p-3.5 shadow-2xl flex items-center gap-2.5 max-w-sm animate-fade-in text-xs text-[#F5F4F8]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 1. COMPACT ROADMAP HOME VIEW                             */}
      {/* ======================================================== */}
      {currentView === 'roadmap' && (
        <div className="space-y-8 animate-fade-in">
          {/* Loading State */}
          {loading && (
            <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#A7A5B4]">Verificando competências cadastradas e trilhas pedagógicas...</p>
            </div>
          )}

          {/* ESTADO 1: SEM RESPONDER O TESTE DE PERFIL / HABILIDADES */}
          {!loading && requiresProfile && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-r from-[#201C2E] via-[#241F36] to-[#1E1B2B] border-2 border-[#BC9EFD]/40 p-6 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-[#BC9EFD]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B6BD9]/20 border border-[#BC9EFD]/40 text-[#BC9EFD] text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Google Gemini • Aguardando Dados Reais do Perfil
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F4F8] tracking-tight">
                    Responda suas habilidades no Perfil Profissional para gerar suas trilhas
                  </h2>
                  <p className="text-xs sm:text-sm text-[#D4CDE6] leading-relaxed">
                    Para garantir que as trilhas sejam <strong>estritamente personalizadas</strong> e reflitam seu momento real sem dados fictícios, o <strong>Google Gemini</strong> precisa analisar seus objetivos de carreira, hard skills técnicas dominadas e soft skills comportamentais. Sem essas respostas no perfil, as trilhas não são geradas.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={onNavigateToProfile}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#8B6BD9] to-[#BC9EFD] hover:from-[#7B5BC9] hover:to-[#AC8EED] text-[#1A1A24] hover:text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Ir para o Perfil Profissional e Cadastrar Habilidades</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => loadData()}
                      className="px-4 py-3.5 rounded-xl bg-[#242436] hover:bg-[#2D2D42] text-[#A7A5B4] hover:text-[#F5F4F8] border border-[#37374D] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Verificar Atualizações</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Checklist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    profileStatus?.hasGoalOrArea
                      ? 'bg-[#1E1E2A] border-emerald-500/40'
                      : 'bg-[#1E1E2A] border-[#2D2D40]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-[#BC9EFD]" />
                    {profileStatus?.hasGoalOrArea ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        Preenchido
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        Pendente
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F4F8]">Área e Metas</h4>
                  <p className="text-xs text-[#A7A5B4] mt-1">
                    {profileStatus?.hasGoalOrArea
                      ? `${profileStatus.primaryArea || profileStatus.careerGoal}`
                      : 'Informe sua área ou meta profissional no Perfil'}
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    (profileStatus?.hardSkillsCount ?? 0) > 0
                      ? 'bg-[#1E1E2A] border-emerald-500/40'
                      : 'bg-[#1E1E2A] border-[#2D2D40]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Code2 className="w-5 h-5 text-[#BC9EFD]" />
                    {(profileStatus?.hardSkillsCount ?? 0) > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        {profileStatus.hardSkillsCount} cadastrada(s)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        Pendente
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F4F8]">Hard Skills</h4>
                  <p className="text-xs text-[#A7A5B4] mt-1">
                    {(profileStatus?.hardSkillsCount ?? 0) > 0
                      ? 'Competências técnicas cadastradas com sucesso'
                      : 'Adicione suas tecnologias e níveis de conhecimento'}
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    (profileStatus?.softSkillsCount ?? 0) > 0
                      ? 'bg-[#1E1E2A] border-emerald-500/40'
                      : 'bg-[#1E1E2A] border-[#2D2D40]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <HeartHandshake className="w-5 h-5 text-[#BC9EFD]" />
                    {(profileStatus?.softSkillsCount ?? 0) > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        {profileStatus.softSkillsCount} cadastrada(s)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        Pendente
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F4F8]">Soft Skills</h4>
                  <p className="text-xs text-[#A7A5B4] mt-1">
                    {(profileStatus?.softSkillsCount ?? 0) > 0
                      ? 'Competências comportamentais cadastradas'
                      : 'Cadastre suas habilidades comportamentais e de liderança'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ESTADO 2: PERFIL PREENCHIDO MAS TRILHAS AINDA NÃO GERADAS */}
          {!loading && !requiresProfile && !hasGenerated && (
            <div className="rounded-3xl bg-gradient-to-r from-[#201C2E] via-[#241F36] to-[#1E1B2B] border-2 border-[#BC9EFD]/50 p-6 sm:p-8 shadow-xl text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Perfil Respondido com Sucesso!
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F4F8]">
                Tudo pronto para gerar suas trilhas com Google Gemini
              </h3>
              <p className="text-xs sm:text-sm text-[#D4CDE6] max-w-xl mx-auto leading-relaxed">
                Identificamos suas competências cadastradas em <strong>{userArea || profile?.primaryArea || 'sua área'}</strong> e seu objetivo de <strong>{userGoal || profile?.careerGoal || 'especialização'}</strong>. Clique no botão abaixo para que o Gemini elabore as 4 trilhas hiperpersonalizadas para o seu perfil.
              </p>
              <div>
                <button
                  onClick={() => handleGenerateTracks(true)}
                  disabled={isGenerating}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#8B6BD9] to-[#BC9EFD] hover:from-[#7B5BC9] hover:to-[#AC8EED] text-[#1A1A24] hover:text-white font-extrabold text-sm transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Gerando com Gemini...' : 'Gerar 4 Trilhas Personalizadas com Gemini'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ESTADO 3: TRILHAS GERADAS E PRONTAS PARA ESTUDO */}
          {!loading && !requiresProfile && hasGenerated && (
            <>
              {/* AI Hero Banner with Target and Refresh Button */}
              <div className="rounded-3xl bg-gradient-to-r from-[#201C2E] via-[#241F36] to-[#1E1B2B] border border-[#37324E] p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-[#BC9EFD]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1.5 min-w-0 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B6BD9]/20 border border-[#BC9EFD]/40 text-[#BC9EFD] text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-[#BC9EFD]" />
                        Trilhas Geradas com Google Gemini
                      </span>
                      {lastGeneratedAt && (
                        <span className="text-[11px] text-[#A7A5B4]">
                          Personalizado para suas competências cadastradas
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F4F8] tracking-tight">
                      {userGoal ? `Rumo a: ${userGoal}` : 'Plano de Aprendizagem Personalizado'}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#A7A5B4] leading-relaxed">
                      Trilhas pedagógicas geradas individualmente com base nas suas competências cadastradas, nível de experiência e objetivos de carreira em <strong>{userArea || profile?.primaryArea || 'sua área'}</strong>.
                    </p>
                  </div>

                  {/* Action Buttons & Overall Progress */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleGenerateTracks(true)}
                      disabled={isGenerating}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B6BD9] to-[#BC9EFD] hover:from-[#7B5BC9] hover:to-[#AC8EED] text-[#1A1A24] hover:text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      title="Atualizar trilhas com os dados mais recentes do perfil"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                      />
                      <span>
                        {isGenerating ? 'Gerando com Gemini...' : 'Atualizar Trilhas com IA'}
                      </span>
                    </button>

                    <div className="bg-[#1A1A24] border border-[#2D2D40] rounded-xl px-3.5 py-2 flex items-center justify-between sm:justify-center gap-3 text-xs">
                      <span className="text-[#A7A5B4] text-[11px]">Progresso Global:</span>
                      <span className="font-mono font-bold text-[#BC9EFD]">
                        {overallProgress.completed}/{overallProgress.total} ({overallProgress.percent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Banner with Retry */}
                {generationError && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{generationError}</span>
                    </div>
                    <button
                      onClick={() => handleGenerateTracks(true)}
                      className="px-3 py-1 rounded-lg bg-rose-800/40 hover:bg-rose-700/60 text-white font-semibold text-xs border border-rose-700 transition-colors cursor-pointer shrink-0"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* AI Generating Animation Card */}
          {isGenerating && (
            <div className="rounded-2xl bg-[#1E1E2A] border border-[#BC9EFD]/40 p-6 text-center space-y-3 animate-pulse">
              <div className="w-8 h-8 border-3 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-[#F5F4F8]">
                O Google Gemini está analisando seu perfil profissional...
              </h3>
              <p className="text-xs text-[#A7A5B4] max-w-md mx-auto leading-relaxed">
                Avaliando suas hard skills, soft skills, objetivos e histórico para montar 4 trilhas com módulos ordenados por pré-requisitos, atividades práticas e critérios de conclusão.
              </p>
            </div>
          )}

          {/* 4 Category Cards Grid (Apenas exibidos quando gerados) */}
          {hasGenerated && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.key);
                const stats = getCategoryProgress(cat.key);
                const isStarted = stats.completedActs > 0;
                const isCompleted = stats.totalActs > 0 && stats.completedActs === stats.totalActs;

                return (
                  <div
                    key={cat.key}
                    onClick={() => handleOpenCategory(cat.key)}
                    className="rounded-2xl bg-[#1E1E2A] border border-[#2A2A3B] hover:border-[#8B6BD9]/60 hover:bg-[#222232] p-5 sm:p-6 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Icon + Level Badge + Completed Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors border ${
                              isCompleted
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : isStarted
                                ? 'bg-[#8B6BD9]/20 border-[#BC9EFD] text-[#BC9EFD]'
                                : 'bg-[#1A1A24] border-[#2E2E42] text-[#A7A5B4] group-hover:text-[#BC9EFD] group-hover:border-[#BC9EFD]/40'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7A5B4] block">
                              {cat.subtitle || 'Trilha Personalizada'}
                            </span>
                            <h3 className="text-base font-bold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors leading-tight">
                              {cat.title}
                            </h3>
                          </div>
                        </div>

                        {cat.estimatedLevel && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1A1A24] border border-[#2E2E42] text-[#BC9EFD] shrink-0">
                            {cat.estimatedLevel}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#A7A5B4] line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>

                      {/* Learning Objective Tag */}
                      {cat.learningObjective && (
                        <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#2A2A3B] flex items-start gap-2 text-[11px] text-[#D4CDE6]">
                          <Target className="w-3.5 h-3.5 text-[#BC9EFD] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong>Objetivo:</strong> {cat.learningObjective}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Progress Bar and Navigation Button */}
                    <div className="pt-3 border-t border-[#2A2A3B] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A7A5B4] text-[11px]">Progresso Real:</span>
                        <span className="font-mono font-semibold text-[#BC9EFD] text-[11px]">
                          {stats.completedActs} de {stats.totalActs} atividades ({stats.percent}%)
                        </span>
                      </div>

                      <div className="w-full bg-[#1A1A24] h-2 rounded-full overflow-hidden border border-[#2A2A3B]">
                        <div
                          className="h-full bg-gradient-to-r from-[#8B6BD9] to-[#BC9EFD] rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-[#A7A5B4]">
                          {isCompleted ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Trilha 100% Concluída
                            </span>
                          ) : stats.totalActs > 0 ? (
                            `${stats.totalActs - stats.completedActs} pendente(s)`
                          ) : (
                            'Acessar módulos'
                          )}
                        </span>

                        <span className="text-xs font-semibold text-[#BC9EFD] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Ver Módulos</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SPECIFIC CATEGORY VIEW (EXPANDABLE MODULES ACCORDION) */}
      {/* ======================================================== */}
      {currentView === 'category' && currentCategory && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar with Clean Back Button and Category Header */}
          <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  onClick={() => setCurrentView('roadmap')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#A7A5B4] hover:text-[#BC9EFD] font-medium transition-colors mb-2.5 cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Voltar para Visão Geral das Trilhas</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8B6BD9]/20 border border-[#BC9EFD]/40 text-[#BC9EFD] flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = getCategoryIcon(currentCategory.key);
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-[#F5F4F8]">
                        {currentCategory.title}
                      </h2>
                      {currentCategory.estimatedLevel && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1A1A24] border border-[#2E2E42] text-[#BC9EFD]">
                          Nível: {currentCategory.estimatedLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A7A5B4] mt-0.5">
                      {currentCategory.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Box & AI Refresh */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={() => handleGenerateTracks(true)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-xl bg-[#242436] hover:bg-[#2E2E44] text-[#BC9EFD] hover:text-white border border-[#37374D] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Regerar esta trilha com Gemini"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                  />
                  <span>Atualizar Trilha com IA</span>
                </button>

                <div className="bg-[#1A1A24] border border-[#2D2D40] rounded-xl px-3.5 py-2 text-right">
                  <span className="text-xs font-mono font-bold text-[#BC9EFD] block">
                    {currentCategoryStats.completedActs} de {currentCategoryStats.totalActs} concluídas
                  </span>
                  <div className="w-32 bg-[#2D2D40] h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B6BD9] to-[#BC9EFD] rounded-full transition-all duration-300"
                      style={{ width: `${currentCategoryStats.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Objective Box */}
            {currentCategory.learningObjective && (
              <div className="p-3.5 rounded-xl bg-[#1A1A24] border border-[#2A2A3B] flex items-start gap-2.5 text-xs text-[#D4CDE6]">
                <Target className="w-4 h-4 text-[#BC9EFD] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#BC9EFD] block">Objetivo Pedagógico da Trilha:</strong>
                  <span>{currentCategory.learningObjective}</span>
                </div>
              </div>
            )}
          </div>

          {/* Modules Accordion List */}
          <div className="space-y-3">
            {loading || isGenerating ? (
              <div className="p-8 text-center text-xs text-[#A7A5B4]">
                <div className="w-5 h-5 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Carregando módulos da trilha...
              </div>
            ) : modules.length === 0 ? (
              <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-10 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-[#8B6BD9] mx-auto opacity-60" />
                <h4 className="text-sm font-semibold text-[#F5F4F8]">
                  Nenhum módulo gerado para esta trilha ainda
                </h4>
                <p className="text-xs text-[#A7A5B4] max-w-sm mx-auto">
                  Clique no botão abaixo para gerar módulos e atividades sob medida com o Google Gemini.
                </p>
                <button
                  onClick={() => handleGenerateTracks(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#BC9EFD] text-[#1A1A24] font-bold text-xs shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Trilha com IA</span>
                </button>
              </div>
            ) : (
              modules.map((module) => {
                const isExpanded = expandedModules[module.id] ?? false;
                const acts = module.activities || [];
                const completedCount = acts.filter((a) => progressMap[a.id]).length;
                const isModuleDone = acts.length > 0 && completedCount === acts.length;

                return (
                  <div
                    key={module.id}
                    className="rounded-xl bg-[#1E1E2A] border border-[#2D2D40] overflow-hidden transition-all shadow-sm"
                  >
                    {/* Module Accordion Header */}
                    <div
                      onClick={() => toggleModuleAccordion(module.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#222232] transition-colors select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                            isModuleDone
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#1A1A24] border-[#2D2D40] text-[#BC9EFD]'
                          }`}
                        >
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
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[11px] font-mono text-[#A7A5B4]">
                          {completedCount}/{acts.length} concluídas
                        </span>

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
                            const materialsCount = (act.courses || []).length;

                            return (
                              <div
                                key={act.id}
                                onClick={() => setSelectedActivity(act)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                                  isDone
                                    ? 'bg-[#1A1A24]/90 border-[#2D2D40]'
                                    : 'bg-[#1E1E2A] border-[#2D2D40] hover:border-[#8B6BD9]/50 hover:bg-[#222232]'
                                }`}
                              >
                                {/* Checkbox & Title */}
                                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleActivity(act.id, e)}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors mt-0.5 sm:mt-0 ${
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

                                  <div className="min-w-0 space-y-0.5">
                                    <h5
                                      className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                                        isDone
                                          ? 'text-[#767487] line-through'
                                          : 'text-[#F5F4F8] group-hover:text-[#BC9EFD]'
                                      }`}
                                    >
                                      {act.title}
                                    </h5>
                                    <p className="text-[11px] text-[#A7A5B4] line-clamp-1">
                                      {act.whyLearn || 'Atividade acionável de desenvolvimento profissional.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Right Tags and Details Button */}
                                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2D2D40]/60">
                                  {act.practicalExercise && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#8B6BD9]/15 text-[#BC9EFD] border border-[#BC9EFD]/20">
                                      Prático
                                    </span>
                                  )}

                                  {materialsCount > 0 && (
                                    <span className="text-[10px] text-[#A7A5B4]">
                                      {materialsCount} material(is)
                                    </span>
                                  )}

                                  <span className="text-xs text-[#BC9EFD] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium ml-1">
                                    <span>Ver detalhes</span>
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
      {/* 3. ACTIVITY DETAILS SCREEN / FULLSCREEN DRAWER                 */}
      {/* ============================================================== */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-[#1A1A24] flex flex-col overflow-hidden animate-fade-in">
          {/* Top Bar with Prominent "X" and Status */}
          <header className="h-16 sm:h-20 bg-[#1E1E2A] border-b border-[#2D2D40] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 shadow-md z-30">
            {/* Left: Back to Category */}
            <button
              onClick={() => setSelectedActivity(null)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#242436] hover:bg-[#2D2D42] border border-[#37374D] text-xs font-semibold text-[#F5F4F8] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#BC9EFD]" />
              <span className="hidden sm:inline">Voltar para a Trilha</span>
              <span className="sm:hidden">Voltar</span>
            </button>

            {/* Center: Title */}
            <div className="text-center truncate px-2 min-w-0 flex-1">
              <span className="text-[10px] font-mono text-[#BC9EFD] uppercase tracking-wider block">
                {currentCategory?.title}
              </span>
              <h2 className="text-xs sm:text-base font-bold text-[#F5F4F8] truncate max-w-sm sm:max-w-md mx-auto">
                {selectedActivity.title}
              </h2>
            </div>

            {/* Right: Toggle Completion & Close "X" Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleToggleActivity(selectedActivity.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  progressMap[selectedActivity.id]
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-[#8B6BD9] hover:bg-[#9D80E6] text-white'
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
                    <span>Marcar Concluída</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 sm:p-2.5 rounded-xl bg-[#28283C] hover:bg-rose-950/40 text-[#A7A5B4] hover:text-rose-300 border border-[#3A3A52] hover:border-rose-800/50 transition-all cursor-pointer shadow-sm group"
                aria-label="Fechar detalhes"
                title="Fechar e voltar à tela anterior"
              >
                <X className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </header>

          {/* Activity Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header Box */}
              <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#8B6BD9]/20 text-[#BC9EFD] border border-[#BC9EFD]/30">
                    Atividade de Desenvolvimento
                  </span>
                  {progressMap[selectedActivity.id] && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluída
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F5F4F8]">
                  {selectedActivity.title}
                </h3>
              </div>

              {/* 1. Por que aprender */}
              <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-6 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F5F4F8] border-b border-[#2D2D40] pb-2.5">
                  <HelpCircle className="w-4 h-4 text-[#BC9EFD]" />
                  <span>Por que aprender para o seu objetivo</span>
                </div>
                <p className="text-xs sm:text-sm text-[#D4CDE6] leading-relaxed">
                  {selectedActivity.whyLearn ||
                    'Conteúdo fundamental para a evolução das suas competências e aplicação profissional consciente.'}
                </p>
              </div>

              {/* 2. O que você vai aprender */}
              <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-6 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F5F4F8] border-b border-[#2D2D40] pb-2.5">
                  <Sparkles className="w-4 h-4 text-[#BC9EFD]" />
                  <span>O que você vai dominar</span>
                </div>
                <ul className="space-y-2 pt-1">
                  {(selectedActivity.whatYouWillLearn || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#D4CDE6]">
                      <div className="w-4 h-4 rounded-full bg-[#8B6BD9]/30 text-[#BC9EFD] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        ✓
                      </div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Exercício Prático / Entregável */}
              {selectedActivity.practicalExercise && (
                <div className="rounded-2xl bg-[#201D30] border border-[#BC9EFD]/40 p-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#BC9EFD] border-b border-[#BC9EFD]/20 pb-2.5">
                    <Award className="w-4 h-4 text-[#BC9EFD]" />
                    <span>Exercício Prático / Entregável</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F5F4F8] leading-relaxed">
                    {selectedActivity.practicalExercise}
                  </p>
                </div>
              )}

              {/* 4. Critério de Conclusão */}
              {selectedActivity.completionCriteria && (
                <div className="rounded-2xl bg-[#1A2624] border border-emerald-500/30 p-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 border-b border-emerald-500/20 pb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Critério de Conclusão</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                    {selectedActivity.completionCriteria}
                  </p>
                </div>
              )}

              {/* 5. Materiais e Links Confiáveis */}
              <div className="rounded-2xl bg-[#1E1E2A] border border-[#2D2D40] p-6 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#2D2D40] pb-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F5F4F8]">
                    <GraduationCap className="w-4 h-4 text-[#BC9EFD]" />
                    <span>Materiais de Estudo Recomendados</span>
                  </div>
                  <span className="text-[11px] text-[#A7A5B4]">
                    Fontes oficiais e plataformas verificáveis
                  </span>
                </div>

                {(!selectedActivity.courses || selectedActivity.courses.length === 0) ? (
                  <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#2D2D40] text-center text-xs text-[#A7A5B4]">
                    Para esta atividade, utilize as documentações oficiais e livros de referência recomendados nos tópicos de estudo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {selectedActivity.courses.map((course, idx) => (
                      <div
                        key={course.id || idx}
                        className="rounded-xl bg-[#1A1A24] border border-[#2D2D40] p-4 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <span className="font-semibold text-emerald-400 text-[11px] block">
                            {course.platform}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#F5F4F8] leading-snug">
                            {course.title}
                          </h4>
                          {course.description && (
                            <p className="text-xs text-[#A7A5B4] line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#2D2D40] flex items-center justify-between text-xs">
                          {course.estimatedDuration ? (
                            <span className="text-[10px] text-[#767487] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#BC9EFD]" />
                              {course.estimatedDuration}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#767487]">Sob demanda</span>
                          )}

                          {course.url && (
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#BC9EFD] hover:text-white"
                            >
                              <span>Acessar</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <footer className="h-16 bg-[#1E1E2A] border-t border-[#2D2D40] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 shadow-md z-20">
            <button
              onClick={() => setSelectedActivity(null)}
              className="px-4 py-2 rounded-xl bg-[#242436] hover:bg-[#2D2D42] border border-[#37374D] text-xs font-semibold text-[#A7A5B4] hover:text-[#F5F4F8] transition-colors cursor-pointer"
            >
              Fechar Detalhes
            </button>

            <button
              onClick={() => {
                handleToggleActivity(selectedActivity.id);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                progressMap[selectedActivity.id]
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-[#BC9EFD] hover:bg-[#CDAFFD] text-[#1A1A24]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {progressMap[selectedActivity.id]
                  ? 'Atividade Concluída'
                  : 'Marcar Atividade como Concluída'}
              </span>
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};
