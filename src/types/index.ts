export type SkillLevel = 'BASICO' | 'INTERMEDIARIO' | 'AVANCADO' | 'ESPECIALISTA';
export type CourseStatus = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'INTERROMPIDO';
export type EducationStatus = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'TRANCADO' | 'INCOMPLETO';
export type WorkModel = 'REMOTO' | 'HIBRIDO' | 'PRESENCIAL';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  headline?: string;
  bio?: string;
  primaryArea: string;
  secondaryAreas: string[];
  careerGoal: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  updatedAt?: string;
}

export interface HardSkill {
  id: number;
  name: string;
  category: string;
  level: SkillLevel;
  yearsOfExperience: number;
  createdAt?: string;
}

export interface SoftSkill {
  id: number;
  name: string;
  description?: string;
  level: SkillLevel;
  contextExample?: string;
  createdAt?: string;
}

export interface Course {
  id: number;
  name: string;
  institution: string;
  workloadHours?: number;
  status: CourseStatus;
  startDate?: string;
  completionDate?: string;
  certificateUrl?: string;
  createdAt?: string;
}

export interface Certification {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  createdAt?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  role: string;
  repositoryUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  status: EducationStatus;
  startDate: string;
  endDate?: string;
  createdAt?: string;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  workModel: WorkModel;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  activities: string;
  createdAt?: string;
}

export interface DashboardSummary {
  completionPercentage: number;
  completedStepsCount?: number;
  hardSkillsCount: number;
  softSkillsCount: number;
  coursesCount: number;
  certificationsCount: number;
  projectsCount: number;
  experiencesCount: number;
  educationCount: number;
  topSkills: HardSkill[];
  recentExperiences: Experience[];
  profile: UserProfile;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
  profile: UserProfile;
}

export interface GapAnalysisResponse {
  readinessScore: number;
  summary: string;
  identifiedGaps: {
    skill: string;
    currentLevel: string;
    targetLevel: string;
    impact: string;
  }[];
  recommendedTracks: {
    title: string;
    description: string;
    estimatedHours: number;
    steps: string[];
  }[];
}

export type TrackCategoryKey = 'hard-skills' | 'soft-skills' | 'linkedin' | 'curriculo';

export interface CourseMaterial {
  id?: string;
  title: string;
  platform: string;
  url: string;
  description: string;
  isFree?: boolean;
  estimatedDuration?: string;
  isDemo?: boolean;
}

export interface TrackActivity {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  whyLearn: string;
  whatYouWillLearn: string[];
  practicalExercise?: string;
  completionCriteria?: string;
  courses: CourseMaterial[];
}

export interface TrackModule {
  id: string;
  categoryKey: TrackCategoryKey;
  title: string;
  description?: string;
  order: number;
  activities: TrackActivity[];
}

export interface TrackCategory {
  key: TrackCategoryKey;
  title: string;
  subtitle: string;
  description: string;
  estimatedLevel?: string;
  learningObjective?: string;
}

export interface PersonalizedTrackPackage {
  generatedAt: string;
  userGoal: string;
  userArea: string;
  categories: TrackCategory[];
  modules: TrackModule[];
}

export type SeniorityLevel = 'ESTAGIO' | 'JUNIOR' | 'PLENO' | 'SENIOR' | 'ESPECIALISTA' | 'LEAD';

export type JobApplicationStatus =
  | 'INTERESSADO'
  | 'CANDIDATURA_PLANEJADA'
  | 'CANDIDATADO'
  | 'EM_PROCESSO'
  | 'ENTREVISTA'
  | 'APROVADO'
  | 'REPROVADO'
  | 'ENCERRADO';

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  logoUrl?: string;
  location: string;
  workModel: WorkModel;
  seniority: SeniorityLevel;
  minSalary?: number;
  maxSalary?: number;
  area: string;
  description: string;
  requiredSkills: string[];
  desirableSkills?: string[];
  benefits?: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  isActive: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JobApplication {
  id: string;
  userId: number;
  jobId: string;
  status: JobApplicationStatus;
  appliedAt?: string;
  notes?: string;
  nextStep?: string;
  updatedAt: string;
}

export interface JobMatchCriterion {
  label: string;
  status: 'matched' | 'partial' | 'missing';
  detail: string;
  weight: number;
  score: number;
}

export interface JobMatchAnalysis {
  overallPercentage: number;
  isEstimated: boolean;
  matchedSkills: { name: string; userLevel?: SkillLevel; isRequired: boolean }[];
  missingSkills: { name: string; isRequired: boolean }[];
  criteria: JobMatchCriterion[];
  summary: string;
  strengths: string[];
  recommendations: string[];
}
