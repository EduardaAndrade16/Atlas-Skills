import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  TrendingUp,
  X,
  Building2,
  MapPin,
  DollarSign,
  ArrowRight,
  BookOpen,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  jobApi,
  hardSkillApi,
  experienceApi,
  projectApi,
  JobFilterOptions,
} from '../services/api';
import {
  JobOpportunity,
  JobApplication,
  JobApplicationStatus,
  JobMatchAnalysis,
  WorkModel,
  SeniorityLevel,
  HardSkill,
  Experience,
  Project,
} from '../types';

interface JobsViewProps {
  onNavigateToCourses?: () => void;
}

const STATUS_LABELS: Record<
  JobApplicationStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  INTERESSADO: {
    label: 'Interessado',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  CANDIDATURA_PLANEJADA: {
    label: 'Candidatura Planejada',
    color: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  CANDIDATADO: {
    label: 'Candidatado',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  EM_PROCESSO: {
    label: 'Em Processo Seletivo',
    color: 'text-purple-300',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  ENTREVISTA: {
    label: 'Entrevista Agendada',
    color: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
  APROVADO: {
    label: 'Aprovado',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  REPROVADO: {
    label: 'Não Selecionado',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  ENCERRADO: {
    label: 'Processo Encerrado',
    color: 'text-slate-400',
    bg: 'bg-slate-700/20',
    border: 'border-slate-700/40',
  },
};

const WORK_MODEL_LABELS: Record<WorkModel, string> = {
  REMOTO: '100% Remoto',
  HIBRIDO: 'Híbrido',
  PRESENCIAL: 'Presencial',
};

const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  ESTAGIO: 'Estágio',
  JUNIOR: 'Júnior',
  PLENO: 'Pleno',
  SENIOR: 'Sênior',
  ESPECIALISTA: 'Especialista',
  LEAD: 'Tech Lead',
};

const AREAS_LIST = [
  'Desenvolvimento',
  'Cibersegurança',
  'DevOps',
  'Dados',
  'QA',
  'Arquitetura',
  'Design & UX',
  'Cloud',
];

export const JobsView: React.FC<JobsViewProps> = ({ onNavigateToCourses }) => {
  const { user, profile } = useAuth();

  // State
  const [activeMainTab, setActiveMainTab] = useState<'explore' | 'applications'>('explore');
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [hardSkills, setHardSkills] = useState<HardSkill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [workModelFilter, setWorkModelFilter] = useState<WorkModel | 'ALL'>('ALL');
  const [seniorityFilter, setSeniorityFilter] = useState<SeniorityLevel | 'ALL'>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | 'ALL'>('ALL');

  // Modals
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<JobOpportunity | null>(null);

  // Application Tracking in Detail Modal
  const [appNotes, setAppNotes] = useState('');
  const [appNextStep, setAppNextStep] = useState('');
  const [appStatus, setAppStatus] = useState<JobApplicationStatus>('INTERESSADO');
  const [isSavingApp, setIsSavingApp] = useState(false);

  // Admin Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formWorkModel, setFormWorkModel] = useState<WorkModel>('REMOTO');
  const [formSeniority, setFormSeniority] = useState<SeniorityLevel>('JUNIOR');
  const [formArea, setFormArea] = useState('Desenvolvimento');
  const [formMinSalary, setFormMinSalary] = useState('');
  const [formMaxSalary, setFormMaxSalary] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRequiredSkills, setFormRequiredSkills] = useState('');
  const [formDesirableSkills, setFormDesirableSkills] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formApplicationUrl, setFormApplicationUrl] = useState('');
  const [formApplicationEmail, setFormApplicationEmail] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [jobsData, hsData, expData, projData] = await Promise.all([
        jobApi.getAll({ activeOnly: false }),
        hardSkillApi.getAll().catch(() => []),
        experienceApi.getAll().catch(() => []),
        projectApi.getAll().catch(() => []),
      ]);
      setJobs(jobsData);
      setHardSkills(hsData);
      setExperiences(expData);
      setProjects(projData);

      if (user) {
        const apps = jobApi.getApplications(user.id);
        setApplications(apps);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => {
      loadData();
    };
    window.addEventListener('atlas_data_changed', handleDataChange);
    return () => window.removeEventListener('atlas_data_changed', handleDataChange);
  }, [user]);

  // Map of Match Calculations for all jobs
  const matchMap = useMemo(() => {
    const map = new Map<string, JobMatchAnalysis>();
    jobs.forEach((job) => {
      const analysis = jobApi.calculateMatch(job, profile, hardSkills, experiences, projects);
      map.set(job.id, analysis);
    });
    return map;
  }, [jobs, profile, hardSkills, experiences, projects]);

  // Applications lookup map
  const applicationsMap = useMemo(() => {
    const map = new Map<string, JobApplication>();
    applications.forEach((app) => map.set(app.jobId, app));
    return map;
  }, [applications]);

  // Filtered Jobs for "Explorar"
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (!job.isActive) return false;

      // Text Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(term);
        const matchesCompany = job.company.toLowerCase().includes(term);
        const matchesDesc = job.description.toLowerCase().includes(term);
        const matchesSkills = job.requiredSkills.some((s) => s.toLowerCase().includes(term));
        if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesSkills) {
          return false;
        }
      }

      // Work Model
      if (workModelFilter !== 'ALL' && job.workModel !== workModelFilter) {
        return false;
      }

      // Seniority
      if (seniorityFilter !== 'ALL' && job.seniority !== seniorityFilter) {
        return false;
      }

      // Area
      if (areaFilter !== 'ALL' && !job.area.toLowerCase().includes(areaFilter.toLowerCase())) {
        return false;
      }

      // Min Salary
      if (minSalaryFilter > 0) {
        const salaryMax = job.maxSalary || job.minSalary || 0;
        if (salaryMax < minSalaryFilter) return false;
      }

      // Min Match %
      if (minMatchFilter > 0) {
        const match = matchMap.get(job.id);
        if (!match || match.overallPercentage < minMatchFilter) return false;
      }

      return true;
    });
  }, [jobs, searchTerm, workModelFilter, seniorityFilter, areaFilter, minSalaryFilter, minMatchFilter, matchMap]);

  // Filtered Applications for "Minhas Candidaturas"
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
        return true;
      })
      .map((app) => {
        const job = jobs.find((j) => j.id === app.jobId);
        return {
          application: app,
          job,
          match: job ? matchMap.get(job.id) : null,
        };
      });
  }, [applications, statusFilter, jobs, matchMap]);

  // Open Detail Modal
  const handleOpenDetail = (job: JobOpportunity) => {
    setSelectedJob(job);
    const existingApp = applicationsMap.get(job.id);
    if (existingApp) {
      setAppStatus(existingApp.status);
      setAppNotes(existingApp.notes || '');
      setAppNextStep(existingApp.nextStep || '');
    } else {
      setAppStatus('INTERESSADO');
      setAppNotes('');
      setAppNextStep('');
    }
    setIsDetailModalOpen(true);
  };

  // Quick toggle Bookmark (Save as INTERESSADO)
  const handleToggleBookmark = (e: React.MouseEvent, job: JobOpportunity) => {
    e.stopPropagation();
    if (!user) return;
    const existing = applicationsMap.get(job.id);
    if (existing) {
      jobApi.deleteApplication(user.id, job.id);
    } else {
      jobApi.saveApplication(user.id, {
        jobId: job.id,
        status: 'INTERESSADO',
        notes: 'Salva para revisão e candidatura futura.',
      });
    }
    setApplications(jobApi.getApplications(user.id));
  };

  // Save Application Updates from Modal
  const handleSaveApplication = () => {
    if (!user || !selectedJob) return;
    setIsSavingApp(true);
    try {
      jobApi.saveApplication(user.id, {
        jobId: selectedJob.id,
        status: appStatus,
        notes: appNotes,
        nextStep: appNextStep,
      });
      setApplications(jobApi.getApplications(user.id));
      setIsDetailModalOpen(false);
    } finally {
      setIsSavingApp(false);
    }
  };

  // Delete application tracking
  const handleRemoveApplication = (jobId: string) => {
    if (!user) return;
    jobApi.deleteApplication(user.id, jobId);
    setApplications(jobApi.getApplications(user.id));
    if (selectedJob?.id === jobId) {
      setIsDetailModalOpen(false);
    }
  };

  // Open Admin Modal (New or Edit)
  const handleOpenAdmin = (job?: JobOpportunity) => {
    if (job) {
      setJobToEdit(job);
      setFormTitle(job.title);
      setFormCompany(job.company);
      setFormLocation(job.location);
      setFormWorkModel(job.workModel);
      setFormSeniority(job.seniority);
      setFormArea(job.area);
      setFormMinSalary(job.minSalary ? String(job.minSalary) : '');
      setFormMaxSalary(job.maxSalary ? String(job.maxSalary) : '');
      setFormDescription(job.description);
      setFormRequiredSkills(job.requiredSkills.join(', '));
      setFormDesirableSkills(job.desirableSkills ? job.desirableSkills.join(', ') : '');
      setFormBenefits(job.benefits ? job.benefits.join('\n') : '');
      setFormApplicationUrl(job.applicationUrl || '');
      setFormApplicationEmail(job.applicationEmail || '');
      setFormIsActive(job.isActive);
    } else {
      setJobToEdit(null);
      setFormTitle('');
      setFormCompany('');
      setFormLocation('');
      setFormWorkModel('REMOTO');
      setFormSeniority('JUNIOR');
      setFormArea('Desenvolvimento');
      setFormMinSalary('');
      setFormMaxSalary('');
      setFormDescription('');
      setFormRequiredSkills('');
      setFormDesirableSkills('');
      setFormBenefits('');
      setFormApplicationUrl('');
      setFormApplicationEmail('');
      setFormIsActive(true);
    }
    setFormError(null);
    setIsAdminModalOpen(true);
  };

  // Submit Admin Form
  const handleSubmitJobForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCompany.trim() || !formRequiredSkills.trim()) {
      setFormError('Por favor preencha Título, Empresa e ao menos uma Competência Obrigatória.');
      return;
    }

    const reqSkillsArray = formRequiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const desSkillsArray = formDesirableSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const benefitsArray = formBenefits
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const jobPayload = {
      title: formTitle.trim(),
      company: formCompany.trim(),
      location: formLocation.trim() || 'Brasil',
      workModel: formWorkModel,
      seniority: formSeniority,
      area: formArea,
      minSalary: formMinSalary ? Number(formMinSalary) : undefined,
      maxSalary: formMaxSalary ? Number(formMaxSalary) : undefined,
      description: formDescription.trim(),
      requiredSkills: reqSkillsArray,
      desirableSkills: desSkillsArray,
      benefits: benefitsArray,
      applicationUrl: formApplicationUrl.trim() || undefined,
      applicationEmail: formApplicationEmail.trim() || undefined,
      isActive: formIsActive,
      isDemo: false,
    };

    try {
      if (jobToEdit) {
        await jobApi.update(jobToEdit.id, jobPayload);
      } else {
        await jobApi.create(jobPayload);
      }
      setIsAdminModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar vaga.');
    }
  };

  // Reset to default demo jobs
  const handleResetDemo = async () => {
    if (window.confirm('Deseja recarregar a lista padrão de vagas demonstrativas?')) {
      await jobApi.resetDemoJobs();
      await loadData();
    }
  };

  // Helper formatting currency
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'A combinar';
    if (min && max) {
      return `R$ ${min.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`;
    }
    if (min) return `A partir de R$ ${min.toLocaleString('pt-BR')}`;
    return `Até R$ ${max?.toLocaleString('pt-BR')}`;
  };

  // Helper match badge styling
  const getMatchBadgeStyle = (pct: number) => {
    if (pct >= 80) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        bar: 'bg-emerald-500',
        text: 'Alta Aderência',
      };
    }
    if (pct >= 60) {
      return {
        bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
        bar: 'bg-purple-500',
        text: 'Boa Aderência',
      };
    }
    return {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      bar: 'bg-amber-500',
      text: 'Em Desenvolvimento',
    };
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    workModelFilter !== 'ALL' ||
    seniorityFilter !== 'ALL' ||
    areaFilter !== 'ALL' ||
    minSalaryFilter > 0 ||
    minMatchFilter > 0;

  const clearFilters = () => {
    setSearchTerm('');
    setWorkModelFilter('ALL');
    setSeniorityFilter('ALL');
    setAreaFilter('ALL');
    setMinSalaryFilter(0);
    setMinMatchFilter(0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Main Mode Toggle Tabs */}
      <div className="flex items-center gap-3 border-b border-[#2D2D3D] pb-3">
        <button
          onClick={() => setActiveMainTab('explore')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMainTab === 'explore'
              ? 'bg-[#8B6BD9] text-white shadow-md shadow-[#8B6BD9]/20'
              : 'text-[#A7A5B4] hover:text-[#F5F4F8] hover:bg-[#222230]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Explorar Vagas</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white font-mono">
            {filteredJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('applications')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeMainTab === 'applications'
              ? 'bg-[#8B6BD9] text-white shadow-md shadow-[#8B6BD9]/20'
              : 'text-[#A7A5B4] hover:text-[#F5F4F8] hover:bg-[#222230]'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Minhas Candidaturas & Salvas</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#8B6BD9]/30 text-[#BC9EFD] font-mono">
            {applications.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXPLORAR VAGAS */}
      {/* ======================================================== */}
      {activeMainTab === 'explore' && (
        <div className="space-y-6">
          {/* Smart Search & Filter Drawer */}
          <div className="bg-[#1E1E2A] border border-[#2D2D3D] rounded-2xl p-5 shadow-xl space-y-4">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7A5B4]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cargo, empresa, tecnologia (ex: React, Java, Docker, Nubank)..."
                className="w-full pl-11 pr-4 py-3 bg-[#1A1A24] border border-[#2D2D3D] rounded-xl text-[#F5F4F8] placeholder-[#767487] text-sm focus:outline-none focus:border-[#8B6BD9] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A7A5B4] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 text-xs">
              {/* Modelo de Trabalho */}
              <div>
                <label className="block text-[#A7A5B4] font-medium mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#BC9EFD]" />
                  Modelo de Trabalho
                </label>
                <select
                  value={workModelFilter}
                  onChange={(e) => setWorkModelFilter(e.target.value as any)}
                  className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-lg px-3 py-2 text-[#F5F4F8] focus:outline-none focus:border-[#8B6BD9]"
                >
                  <option value="ALL">Todos os Modelos</option>
                  <option value="REMOTO">100% Remoto</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
              </div>

              {/* Senioridade */}
              <div>
                <label className="block text-[#A7A5B4] font-medium mb-1.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#BC9EFD]" />
                  Senioridade
                </label>
                <select
                  value={seniorityFilter}
                  onChange={(e) => setSeniorityFilter(e.target.value as any)}
                  className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-lg px-3 py-2 text-[#F5F4F8] focus:outline-none focus:border-[#8B6BD9]"
                >
                  <option value="ALL">Todas as Senioridades</option>
                  <option value="ESTAGIO">Estágio</option>
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                  <option value="ESPECIALISTA">Especialista</option>
                  <option value="LEAD">Tech Lead</option>
                </select>
              </div>

              {/* Área Profissional */}
              <div>
                <label className="block text-[#A7A5B4] font-medium mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#BC9EFD]" />
                  Área Profissional
                </label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-lg px-3 py-2 text-[#F5F4F8] focus:outline-none focus:border-[#8B6BD9]"
                >
                  <option value="ALL">Todas as Áreas</option>
                  {AREAS_LIST.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Faixa Salarial Mínima */}
              <div>
                <label className="block text-[#A7A5B4] font-medium mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#BC9EFD]" />
                  Salário Mínimo
                </label>
                <select
                  value={minSalaryFilter}
                  onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                  className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-lg px-3 py-2 text-[#F5F4F8] focus:outline-none focus:border-[#8B6BD9]"
                >
                  <option value={0}>Qualquer faixa</option>
                  <option value={2000}>A partir de R$ 2.000</option>
                  <option value={5000}>A partir de R$ 5.000</option>
                  <option value={8000}>A partir de R$ 8.000</option>
                  <option value={12000}>A partir de R$ 12.000</option>
                </select>
              </div>

              {/* Match Mínimo */}
              <div>
                <label className="block text-[#A7A5B4] font-medium mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#BC9EFD]" />
                  Compatibilidade
                </label>
                <select
                  value={minMatchFilter}
                  onChange={(e) => setMinMatchFilter(Number(e.target.value))}
                  className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-lg px-3 py-2 text-[#F5F4F8] focus:outline-none focus:border-[#8B6BD9]"
                >
                  <option value={0}>Qualquer score</option>
                  <option value={50}>Match &gt; 50%</option>
                  <option value={70}>Alta aderência (&gt; 70%)</option>
                  <option value={85}>Excelente aderência (&gt; 85%)</option>
                </select>
              </div>
            </div>

            {/* Active Filters Clear Button */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-[#2D2D3D]/60 text-xs">
                <span className="text-[#A7A5B4]">
                  Exibindo <strong>{filteredJobs.length}</strong> de {jobs.length} vagas disponíveis.
                </span>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-[#BC9EFD] hover:underline"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>

          {/* Jobs Listing Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-[#A7A5B4]">
              <div className="w-8 h-8 border-2 border-[#BC9EFD] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Carregando oportunidades profissionais...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-[#1E1E2A] border border-[#2D2D3D] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#8B6BD9]/10 text-[#BC9EFD] flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F5F4F8]">Nenhuma vaga encontrada</h3>
              <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
                Tente ajustar os termos de busca ou remover alguns filtros para encontrar mais
                oportunidades.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-[#222230] hover:bg-[#2D2D3D] text-[#BC9EFD] text-xs font-semibold"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => {
                const match = matchMap.get(job.id);
                const score = match?.overallPercentage ?? 50;
                const badgeStyle = getMatchBadgeStyle(score);
                const app = applicationsMap.get(job.id);
                const isSaved = !!app;

                return (
                  <div
                    key={job.id}
                    onClick={() => handleOpenDetail(job)}
                    className="group bg-[#1E1E2A] hover:bg-[#222230] border border-[#2D2D3D] hover:border-[#8B6BD9]/50 rounded-2xl p-5 sm:p-6 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Meta: Company, Seniority & Bookmark */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#BC9EFD] uppercase tracking-wider block">
                            {job.company}
                          </span>
                          <h3 className="text-lg font-bold text-[#F5F4F8] group-hover:text-[#BC9EFD] transition-colors leading-snug">
                            {job.title}
                          </h3>
                        </div>

                        {/* Quick Save Bookmark */}
                        <button
                          onClick={(e) => handleToggleBookmark(e, job)}
                          title={isSaved ? 'Remover dos salvos' : 'Salvar oportunidade'}
                          className={`p-2 rounded-xl transition-all ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-[#1A1A24] text-[#A7A5B4] hover:text-[#F5F4F8] border border-[#2D2D3D]'
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Pill Attributes */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#A7A5B4] mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A24] border border-[#2D2D3D]">
                          <MapPin className="w-3 h-3 text-[#BC9EFD]" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A24] border border-[#2D2D3D]">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          {WORK_MODEL_LABELS[job.workModel]}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A24] border border-[#2D2D3D]">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          {SENIORITY_LABELS[job.seniority]}
                        </span>
                      </div>

                      {/* Salary */}
                      <div className="text-xs font-semibold text-[#F5F4F8] mb-3 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                      </div>

                      {/* Brief description */}
                      <p className="text-xs text-[#A7A5B4] line-clamp-2 leading-relaxed mb-1">
                        {job.description}
                      </p>
                    </div>

                    {/* Bottom Match Bar & Action */}
                    <div className="pt-3 border-t border-[#2D2D3D] flex items-center justify-between gap-3">
                      {/* Compatibility Gauge Box */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${badgeStyle.bg}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{score}% Compatível</span>
                        </div>
                        {match?.isEstimated && (
                          <span
                            title="Compatibilidade estimada: complete seu perfil para precisão máxima"
                            className="text-[10px] text-amber-400/90 flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Estimada
                          </span>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#BC9EFD] group-hover:translate-x-1 transition-transform">
                        <span>Ver Detalhes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
      {/* TAB 2: MINHAS CANDIDATURAS & HISTÓRICO */}
      {/* ======================================================== */}
      {activeMainTab === 'applications' && (
        <div className="space-y-6">
          {/* Header Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1E1E2A] border border-[#2D2D3D] p-4 rounded-2xl">
              <p className="text-xs text-[#A7A5B4] font-medium">Total Acompanhadas</p>
              <p className="text-2xl font-black text-[#F5F4F8] mt-1">{applications.length}</p>
            </div>
            <div className="bg-[#1E1E2A] border border-[#2D2D3D] p-4 rounded-2xl">
              <p className="text-xs text-[#A7A5B4] font-medium">Candidatado / Em Processo</p>
              <p className="text-2xl font-black text-cyan-400 mt-1">
                {
                  applications.filter(
                    (a) => a.status === 'CANDIDATADO' || a.status === 'EM_PROCESSO'
                  ).length
                }
              </p>
            </div>
            <div className="bg-[#1E1E2A] border border-[#2D2D3D] p-4 rounded-2xl">
              <p className="text-xs text-[#A7A5B4] font-medium">Entrevistas Agendadas</p>
              <p className="text-2xl font-black text-[#BC9EFD] mt-1">
                {applications.filter((a) => a.status === 'ENTREVISTA').length}
              </p>
            </div>
            <div className="bg-[#1E1E2A] border border-[#2D2D3D] p-4 rounded-2xl">
              <p className="text-xs text-[#A7A5B4] font-medium">Aprovado</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {applications.filter((a) => a.status === 'APROVADO').length}
              </p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#A7A5B4] mr-1">Filtrar por Status:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#8B6BD9] text-white border-[#8B6BD9]'
                  : 'bg-[#1E1E2A] text-[#A7A5B4] border-[#2D2D3D] hover:text-[#F5F4F8]'
              }`}
            >
              Todos ({applications.length})
            </button>
            {(Object.keys(STATUS_LABELS) as JobApplicationStatus[]).map((st) => {
              const count = applications.filter((a) => a.status === st).length;
              if (count === 0 && statusFilter !== st) return null;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-[#8B6BD9] text-white border-[#8B6BD9]'
                      : 'bg-[#1E1E2A] text-[#A7A5B4] border-[#2D2D3D] hover:text-[#F5F4F8]'
                  }`}
                >
                  {STATUS_LABELS[st].label} ({count})
                </button>
              );
            })}
          </div>

          {/* Applications Listing */}
          {filteredApplications.length === 0 ? (
            <div className="bg-[#1E1E2A] border border-[#2D2D3D] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F5F4F8]">Nenhuma candidatura registrada</h3>
              <p className="text-xs text-[#A7A5B4] max-w-md mx-auto">
                Na aba "Explorar Vagas", clique em "Salvar" ou em qualquer vaga para acompanhar o
                status dos seus processos seletivos.
              </p>
              <button
                onClick={() => setActiveMainTab('explore')}
                className="px-4 py-2 rounded-xl bg-[#8B6BD9] hover:bg-[#9D80E6] text-white text-xs font-semibold"
              >
                Explorar Vagas Disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(({ application, job, match }) => {
                if (!job) return null;
                const score = match?.overallPercentage ?? 50;
                const statusMeta = STATUS_LABELS[application.status];

                return (
                  <div
                    key={application.id}
                    className="bg-[#1E1E2A] border border-[#2D2D3D] hover:border-[#8B6BD9]/40 rounded-2xl p-5 shadow-lg transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#BC9EFD] uppercase">
                            {job.company}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                          <span className="text-xs text-[#767487] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {application.appliedAt
                              ? `Candidatura em ${new Date(application.appliedAt).toLocaleDateString(
                                  'pt-BR'
                                )}`
                              : 'Vaga salva'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#F5F4F8]">{job.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(job)}
                          className="px-3.5 py-2 rounded-xl bg-[#222230] hover:bg-[#2D2D3D] text-[#F5F4F8] text-xs font-semibold transition-all border border-[#2D2D3D] flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#BC9EFD]" />
                          <span>Atualizar Status</span>
                        </button>
                        <button
                          onClick={() => handleRemoveApplication(job.id)}
                          title="Remover acompanhamento"
                          className="p-2 rounded-xl bg-[#222230] hover:bg-rose-500/20 text-[#A7A5B4] hover:text-rose-300 transition-all border border-[#2D2D3D]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#1A1A24] p-3.5 rounded-xl border border-[#2D2D3D]">
                      <div>
                        <span className="text-[#A7A5B4] block text-[11px]">Compatibilidade</span>
                        <span className="font-semibold text-emerald-400">
                          {score}% ({match?.matchedSkills.length || 0} competências correspondentes)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A7A5B4] block text-[11px]">Próxima Etapa</span>
                        <span className="font-semibold text-[#F5F4F8]">
                          {application.nextStep || 'Nenhuma etapa agendada'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A7A5B4] block text-[11px]">Anotações Pessoais</span>
                        <span className="text-[#A7A5B4] truncate block">
                          {application.notes || 'Sem anotações registradas'}
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
      {/* MODAL 1: DETALHES DA VAGA & ANÁLISE DE MATCH DETERMINÍSTICA */}
      {/* ======================================================== */}
      {isDetailModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1A1A24] border border-[#2D2D3D] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2D2D3D] flex items-start justify-between gap-4 bg-[#1E1E2A]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#BC9EFD] uppercase tracking-wider">
                    {selectedJob.company}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B6BD9]/15 border border-[#8B6BD9]/30 text-[#BC9EFD]">
                    {WORK_MODEL_LABELS[selectedJob.workModel]}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                    {SENIORITY_LABELS[selectedJob.seniority]}
                  </span>
                  {selectedJob.isDemo && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
                      Demonstração
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F4F8]">
                  {selectedJob.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#A7A5B4] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#BC9EFD]" />
                    {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    {formatSalary(selectedJob.minSalary, selectedJob.maxSalary)}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2.5 rounded-xl bg-[#1A1A24] hover:bg-[#2D2D3D] border border-[#2D2D3D] text-[#A7A5B4] hover:text-[#F5F4F8] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Deterministic Match Engine Breakdown Box */}
              {(() => {
                const match = matchMap.get(selectedJob.id);
                const score = match?.overallPercentage ?? 50;
                const badgeStyle = getMatchBadgeStyle(score);

                return (
                  <div className="bg-gradient-to-br from-[#1E1E2A] to-[#222230] border border-[#2D2D3D] rounded-2xl p-5 sm:p-6 shadow-inner space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${badgeStyle.bg}`}
                        >
                          {score}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-[#F5F4F8]">
                              Compatibilidade com seu Perfil
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle.bg}`}
                            >
                              {badgeStyle.text}
                            </span>
                          </div>
                          <p className="text-xs text-[#A7A5B4] max-w-xl mt-0.5">
                            {match?.summary}
                          </p>
                        </div>
                      </div>

                      {match?.isEstimated && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Cálculo preliminar (Perfil com poucos dados)</span>
                        </div>
                      )}
                    </div>

                    {/* Criteria 4 Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {match?.criteria.map((crit, idx) => (
                        <div
                          key={idx}
                          className="bg-[#1A1A24] p-3.5 rounded-xl border border-[#2D2D3D] text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#F5F4F8] flex items-center gap-1.5">
                              {crit.status === 'matched' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              {crit.status === 'partial' && (
                                <Sparkles className="w-3.5 h-3.5 text-[#BC9EFD]" />
                              )}
                              {crit.status === 'missing' && (
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              {crit.label}
                            </span>
                            <span className="font-mono text-[#A7A5B4]">
                              {crit.score}/{crit.weight} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A7A5B4]">{crit.detail}</p>
                        </div>
                      ))}
                    </div>

                    {/* Strengths & Missing Gaps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Matched Skills */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Competências que Você Possui
                        </span>
                        {match && match.matchedSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {match.matchedSkills.map((sk) => (
                              <span
                                key={sk.name}
                                className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono flex items-center gap-1"
                              >
                                ✓ {sk.name}
                                {sk.userLevel && (
                                  <span className="text-[10px] text-emerald-400/70">
                                    ({sk.userLevel})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#A7A5B4]">
                            Nenhuma competência direta identificada ainda no perfil.
                          </p>
                        )}
                      </div>

                      {/* Missing Gaps & Learn Action */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          Lacunas para Desenvolver
                        </span>
                        {match && match.missingSkills.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {match.missingSkills.map((sk) => (
                                <span
                                  key={sk.name}
                                  className="px-2.5 py-1 rounded-lg text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono"
                                >
                                  + {sk.name}
                                </span>
                              ))}
                            </div>
                            {onNavigateToCourses && (
                              <button
                                onClick={() => {
                                  setIsDetailModalOpen(false);
                                  onNavigateToCourses();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B6BD9]/20 hover:bg-[#8B6BD9]/30 text-[#BC9EFD] text-xs font-semibold border border-[#8B6BD9]/40 transition-all"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Estudar estes tópicos em "Cursos e Trilhas"</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-300">
                            Parabéns! Você já possui todas as competências mapeadas desta vaga.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Job Full Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#F5F4F8] uppercase tracking-wider">
                  Descrição da Oportunidade
                </h3>
                <p className="text-sm text-[#A7A5B4] leading-relaxed whitespace-pre-line bg-[#1E1E2A] p-4 rounded-2xl border border-[#2D2D3D]">
                  {selectedJob.description}
                </p>
              </div>

              {/* Benefits */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#F5F4F8] uppercase tracking-wider">
                    Benefícios Oferecidos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedJob.benefits.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1E1E2A] border border-[#2D2D3D] text-xs text-[#F5F4F8]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#BC9EFD] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application / Candidatura & Acompanhamento Form */}
              <div className="bg-[#1E1E2A] border border-[#2D2D3D] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#F5F4F8] uppercase tracking-wider flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-[#BC9EFD]" />
                    Acompanhar Processo Seletivo
                  </h3>
                  {selectedJob.applicationUrl && (
                    <a
                      href={selectedJob.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B6BD9] hover:bg-[#9D80E6] text-white text-xs font-semibold transition-all shadow-md"
                    >
                      <span>Acessar Portal da Vaga</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A7A5B4] mb-1.5">
                      Status da sua Candidatura
                    </label>
                    <select
                      value={appStatus}
                      onChange={(e) => setAppStatus(e.target.value as JobApplicationStatus)}
                      className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-xl px-3 py-2.5 text-sm text-[#F5F4F8] focus:outline-none focus:border-[#8B6BD9]"
                    >
                      {(Object.keys(STATUS_LABELS) as JobApplicationStatus[]).map((st) => (
                        <option key={st} value={st}>
                          {STATUS_LABELS[st].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Next Step */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A7A5B4] mb-1.5">
                      Próxima Etapa Prevista
                    </label>
                    <input
                      type="text"
                      value={appNextStep}
                      onChange={(e) => setAppNextStep(e.target.value)}
                      placeholder="Ex: Entrevista com gestor técnico em 28/10"
                      className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8] placeholder-[#767487] focus:outline-none focus:border-[#8B6BD9]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1.5">
                    Anotações & Observações Pessoais
                  </label>
                  <textarea
                    rows={2}
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="Registre pretensão salarial informada, impressões da entrevista, contatos do recrutador..."
                    className="w-full bg-[#1A1A24] border border-[#2D2D3D] rounded-xl p-3 text-sm text-[#F5F4F8] placeholder-[#767487] focus:outline-none focus:border-[#8B6BD9]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {applicationsMap.has(selectedJob.id) ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveApplication(selectedJob.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Remover vaga das minhas candidaturas
                    </button>
                  ) : (
                    <span className="text-xs text-[#767487]">
                      Salve a vaga para registrar o acompanhamento.
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#222230] hover:bg-[#2D2D3D] text-[#A7A5B4] text-xs font-semibold"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveApplication}
                      disabled={isSavingApp}
                      className="px-5 py-2 rounded-xl bg-[#8B6BD9] hover:bg-[#9D80E6] text-white text-xs font-semibold shadow-md shadow-[#8B6BD9]/20 transition-all disabled:opacity-50"
                    >
                      {isSavingApp ? 'Salvando...' : 'Salvar no Meu Histórico'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADMIN CADASTRO & EDIÇÃO DE VAGAS */}
      {/* ======================================================== */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1A1A24] border border-[#2D2D3D] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2D2D3D] flex items-center justify-between bg-[#1E1E2A]">
              <div>
                <h2 className="text-xl font-bold text-[#F5F4F8]">
                  {jobToEdit ? 'Editar Oportunidade' : 'Cadastrar Nova Oportunidade'}
                </h2>
                <p className="text-xs text-[#A7A5B4]">
                  Administre as vagas disponíveis na plataforma AtlasSkills.
                </p>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-2 rounded-xl bg-[#1A1A24] hover:bg-[#2D2D3D] text-[#A7A5B4] hover:text-[#F5F4F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitJobForm} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Título do Cargo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Desenvolvedor Frontend React"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8] focus:border-[#8B6BD9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Ex: Nubank, Stone, Hotmart"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8] focus:border-[#8B6BD9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Modelo de Trabalho
                  </label>
                  <select
                    value={formWorkModel}
                    onChange={(e) => setFormWorkModel(e.target.value as WorkModel)}
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  >
                    <option value="REMOTO">100% Remoto</option>
                    <option value="HIBRIDO">Híbrido</option>
                    <option value="PRESENCIAL">Presencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Senioridade
                  </label>
                  <select
                    value={formSeniority}
                    onChange={(e) => setFormSeniority(e.target.value as SeniorityLevel)}
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  >
                    <option value="ESTAGIO">Estágio</option>
                    <option value="JUNIOR">Júnior</option>
                    <option value="PLENO">Pleno</option>
                    <option value="SENIOR">Sênior</option>
                    <option value="ESPECIALISTA">Especialista</option>
                    <option value="LEAD">Tech Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">Área</label>
                  <input
                    type="text"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    placeholder="Ex: Desenvolvimento, QA, Dados"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ex: São Paulo, SP (Remoto)"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Salário Mínimo (R$)
                  </label>
                  <input
                    type="number"
                    value={formMinSalary}
                    onChange={(e) => setFormMinSalary(e.target.value)}
                    placeholder="Ex: 5000"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Salário Máximo (R$)
                  </label>
                  <input
                    type="number"
                    value={formMaxSalary}
                    onChange={(e) => setFormMaxSalary(e.target.value)}
                    placeholder="Ex: 8000"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                  Descrição da Vaga
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades e contexto da vaga..."
                  className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl p-3 text-sm text-[#F5F4F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                  Competências Técnicas Obrigatórias * (separadas por vírgula)
                </label>
                <input
                  type="text"
                  required
                  value={formRequiredSkills}
                  onChange={(e) => setFormRequiredSkills(e.target.value)}
                  placeholder="Ex: React, TypeScript, Node.js, Git, SQL"
                  className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                  Diferenciais / Competências Desejáveis (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formDesirableSkills}
                  onChange={(e) => setFormDesirableSkills(e.target.value)}
                  placeholder="Ex: Docker, AWS, GraphQL, Tailwind CSS"
                  className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                  Benefícios (um por linha)
                </label>
                <textarea
                  rows={2}
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  placeholder="Trabalho 100% remoto&#10;Plano de Saúde&#10;Vale Alimentação"
                  className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl p-3 text-sm text-[#F5F4F8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    Link de Candidatura (Portal Oficial)
                  </label>
                  <input
                    type="url"
                    value={formApplicationUrl}
                    onChange={(e) => setFormApplicationUrl(e.target.value)}
                    placeholder="https://empresa.gupy.io/vagas/123"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7A5B4] mb-1">
                    E-mail para Candidatura
                  </label>
                  <input
                    type="email"
                    value={formApplicationEmail}
                    onChange={(e) => setFormApplicationEmail(e.target.value)}
                    placeholder="vagas@empresa.com.br"
                    className="w-full bg-[#1E1E2A] border border-[#2D2D3D] rounded-xl px-3 py-2 text-sm text-[#F5F4F8]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-[#2D2D3D] text-[#8B6BD9] focus:ring-[#8B6BD9]"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-[#F5F4F8]">
                  Vaga ativa e disponível para visualização
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2D2D3D]">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#222230] hover:bg-[#2D2D3D] text-[#A7A5B4] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B6BD9] hover:bg-[#9D80E6] text-white text-xs font-semibold shadow-md shadow-[#8B6BD9]/20"
                >
                  {jobToEdit ? 'Salvar Alterações' : 'Publicar Vaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
