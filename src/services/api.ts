import {
  AuthResponse,
  GapAnalysisResponse,
  Certification,
  Course,
  CourseMaterial,
  DashboardSummary,
  Education,
  Experience,
  HardSkill,
  JobApplication,
  JobApplicationStatus,
  JobMatchAnalysis,
  JobMatchCriterion,
  JobOpportunity,
  PersonalizedLearningTrack,
  Project,
  SeniorityLevel,
  SkillLevel,
  SoftSkill,
  TrackActivity,
  TrackCategory,
  TrackCategoryKey,
  TrackModule,
  User,
  UserProfile,
  WorkModel,
} from '../types';

const STORAGE_KEY_TOKEN = 'atlas_auth_token';
const STORAGE_KEY_USER = 'atlas_auth_user';
const STORAGE_KEY_MODE = 'atlas_backend_mode'; // 'auto' | 'spring' | 'mock'
const STORAGE_KEY_DATA_PREFIX = 'atlas_data_';

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string) || '';
  if (!envUrl || envUrl.includes('localhost:8080')) {
    return '/api/v1';
  }
  return envUrl;
};

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
};

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
};

export const getBackendMode = (): 'auto' | 'spring' | 'mock' => {
  return (localStorage.getItem(STORAGE_KEY_MODE) as 'auto' | 'spring' | 'mock') || 'auto';
};

export const setBackendMode = (mode: 'auto' | 'spring' | 'mock') => {
  localStorage.setItem(STORAGE_KEY_MODE, mode);
};

// Empty defaults keep new and simulated accounts free of fabricated profile data.
const DEFAULT_USER: User = { id: 0, name: '', email: '', createdAt: '' };
const DEFAULT_PROFILE: UserProfile = {
  id: 0,
  userId: 0,
  primaryArea: '',
  secondaryAreas: [],
  careerGoal: '',
};

const LEGACY_DEMO_PROFILE = {
  headline: 'Engenheira de Software Full Stack & Arquiteta Cloud',
  bio: 'Desenvolvedora apaixonada por ecossistemas distribuídos, microsserviços em Spring Boot e interfaces responsivas com React. Foco contínuo em boas práticas, escalabilidade e arquiteturas limpas.',
  primaryArea: 'Desenvolvimento Backend & Cloud',
  secondaryAreas: ['Arquitetura de Software', 'Frontend Moderno', 'DevOps & CI/CD'],
  careerGoal: 'Tech Lead / Arquiteta de Soluções Cloud Senior',
  phone: '+55 (11) 98765-4321',
  location: 'São Paulo, SP - Brasil',
  linkedinUrl: 'https://linkedin.com/in/eduarda-andrade',
  githubUrl: 'https://github.com/eduarda-andrade',
  portfolioUrl: 'https://eduarda.dev',
};

function isLegacyDemoProfile(profile: Partial<UserProfile>): boolean {
  return Object.entries(LEGACY_DEMO_PROFILE).every(([key, value]) =>
    key === 'secondaryAreas'
      ? JSON.stringify(profile.secondaryAreas) === JSON.stringify(value)
      : profile[key as keyof UserProfile] === value
  );
}

// Helper for Mock DB per user in localStorage
class MockDatabase {
  private getUserDataKey(userId: number, table: string): string {
    return `${STORAGE_KEY_DATA_PREFIX}${userId}_${table}`;
  }

  private load<T>(userId: number, table: string, defaultData: T[]): T[] {
    const key = this.getUserDataKey(userId, table);
    const stored = localStorage.getItem(key);
    if (!stored) {
      this.save(userId, table, defaultData);
      return defaultData;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return defaultData;
    }
  }

  private save<T>(userId: number, table: string, data: T[]) {
    const key = this.getUserDataKey(userId, table);
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Users storage
  getUsers(): Array<{ user: User; passwordHash: string; profile: UserProfile }> {
    const raw = localStorage.getItem('atlas_users_db');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveUsers(users: Array<{ user: User; passwordHash: string; profile: UserProfile }>) {
    localStorage.setItem('atlas_users_db', JSON.stringify(users));
  }

  getProfile(userId: number): UserProfile {
    const key = `${STORAGE_KEY_DATA_PREFIX}${userId}_profile`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const profile = JSON.parse(stored) as UserProfile;
        if (!isLegacyDemoProfile(profile)) return profile;
        return { ...DEFAULT_PROFILE, id: userId, userId };
      } catch {
        // fallback
      }
    }
    const legacyProfile = this.getUsers().find((entry) => entry.user.id === userId)?.profile;
    if (legacyProfile && isLegacyDemoProfile(legacyProfile)) {
      return { ...DEFAULT_PROFILE, id: userId, userId };
    }
    if (userId === DEFAULT_USER.id) {
      return DEFAULT_PROFILE;
    }
    const emptyProfile: UserProfile = {
      id: userId,
      userId,
      primaryArea: '',
      secondaryAreas: [],
      careerGoal: '',
      updatedAt: new Date().toISOString(),
    };
    this.saveProfile(userId, emptyProfile);
    return emptyProfile;
  }

  saveProfile(userId: number, profile: UserProfile) {
    const key = `${STORAGE_KEY_DATA_PREFIX}${userId}_profile`;
    localStorage.setItem(key, JSON.stringify(profile));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    }
  }

  // Generic CRUD for user resources
  getList<T>(userId: number, table: string, defaultData: T[] = []): T[] {
    const storedProfile = localStorage.getItem(`${STORAGE_KEY_DATA_PREFIX}${userId}_profile`);
    let profile: UserProfile | undefined;
    if (storedProfile) {
      try {
        profile = JSON.parse(storedProfile) as UserProfile;
      } catch {
        profile = undefined;
      }
    } else {
      profile = this.getUsers().find((entry) => entry.user.id === userId)?.profile;
    }
    if (profile && isLegacyDemoProfile(profile)) return [];
    return this.load<T>(userId, table, userId === 1 ? defaultData : []);
  }

  create<T extends { id?: number }>(userId: number, table: string, item: Omit<T, 'id'>): T {
    const list = this.getList<T>(userId, table, []);
    const nextId = list.reduce((max, cur) => Math.max(max, (cur as any).id || 0), 0) + 1;
    const newItem = { ...item, id: nextId, createdAt: new Date().toISOString() } as unknown as T;
    const updated = [newItem, ...list];
    this.save(userId, table, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    }
    return newItem;
  }

  update<T extends { id: number }>(userId: number, table: string, id: number, item: Partial<T>): T {
    const list = this.getList<T>(userId, table, []);
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) {
      throw new Error(`Registro com ID ${id} não encontrado.`);
    }
    const updatedItem = { ...list[index], ...item, updatedAt: new Date().toISOString() };
    list[index] = updatedItem;
    this.save(userId, table, list);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    }
    return updatedItem;
  }

  delete(userId: number, table: string, id: number): boolean {
    const list = this.getList<any>(userId, table, []);
    const filtered = list.filter((x) => x.id !== id);
    this.save(userId, table, filtered);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    }
    return true;
  }
}

export const mockDb = new MockDatabase();

// Centralized HTTP client that attempts real backend when in 'spring' or 'auto' mode, or uses mockDb
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const mode = getBackendMode();
  const token = getToken();

  if (endpoint.startsWith('/ai/') && mode === 'mock') {
    throw new Error('A geração com Gemini exige o backend ativo e uma GEMINI_API_KEY configurada.');
  }

  if (mode === 'spring' || mode === 'auto') {
    const baseUrl = getApiBaseUrl();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (networkErr: unknown) {
      const networkMsg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      console.warn(`[Atlas API] Falha de conexão com ${baseUrl}${endpoint}:`, networkMsg);

      if (mode === 'spring') {
        throw new Error(`Falha ao conectar com o backend Spring Boot (${baseUrl}): ${networkMsg}`);
      }

      if (endpoint.startsWith('/ai/')) {
        throw new Error('Não foi possível conectar ao serviço de análise de IA.');
      }

      // If in 'auto' mode and fetch failed due to network error, smoothly fall back to internal engine
      return executeMockRequest<T>(endpoint, options);
    }

    if (response.status === 401) {
      if (endpoint === '/auth/login') {
        let errorMsg = 'E-mail ou senha incorretos.';
        try {
          const errJson = await response.json();
          errorMsg = errJson.message || errJson.error || errorMsg;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }
      setToken(null);
      setStoredUser(null);
      window.dispatchEvent(new CustomEvent('atlas_auth_expired'));
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      let errorMsg = `Erro na requisição (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || errJson.error || errorMsg;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  // Fallback to Mock Engine
  return executeMockRequest<T>(endpoint, options);
}

// Simulated delay helper for realistic UX
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

async function executeMockRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
  await delay();
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;
  const user = getStoredUser() || DEFAULT_USER;
  const userId = user.id;

  // AUTH
  if (endpoint === '/auth/login' && method === 'POST') {
    const users = mockDb.getUsers();
    const match = users.find((u) => u.user.email.toLowerCase() === body.email.toLowerCase());
    if (!match) {
      throw new Error('E-mail não cadastrado. Verifique o endereço digitado ou crie uma nova conta.');
    }
    const isValidPassword =
      match.passwordHash === body.password;
    if (!isValidPassword) {
      throw new Error('Senha incorreta. Verifique sua senha e tente novamente.');
    }
    const token = `mock-jwt-token-${match.user.id}-${Date.now()}`;
    return {
      token,
      type: 'Bearer',
      user: match.user,
      profile: mockDb.getProfile(match.user.id),
    } as unknown as T;
  }

  if (endpoint === '/auth/register' && method === 'POST') {
    const users = mockDb.getUsers();
    const exists = users.find((u) => u.user.email.toLowerCase() === body.email.toLowerCase());
    if (exists) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }
    const newUserId = users.reduce((max, u) => Math.max(max, u.user.id), 0) + 1;
    const newUser: User = {
      id: newUserId,
      name: body.name,
      email: body.email,
      createdAt: new Date().toISOString(),
    };
    const newProfile: UserProfile = {
      id: newUserId,
      userId: newUserId,
      bio: '',
      primaryArea: '',
      secondaryAreas: [],
      careerGoal: '',
      updatedAt: new Date().toISOString(),
    };
    users.push({
      user: newUser,
      passwordHash: body.password,
      profile: newProfile,
    });
    mockDb.saveUsers(users);
    mockDb.saveProfile(newUserId, newProfile);

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    return {
      token,
      type: 'Bearer',
      user: newUser,
      profile: newProfile,
    } as unknown as T;
  }

  if (endpoint === '/auth/me' && method === 'GET') {
    return user as unknown as T;
  }

  if (endpoint === '/auth/change-password' && method === 'POST') {
    const users = mockDb.getUsers();
    const userIdx = users.findIndex((u) => u.user.id === userId);
    if (userIdx === -1) throw new Error('Usuário não encontrado.');
    if (users[userIdx].passwordHash !== body.currentPassword) {
      throw new Error('Senha atual incorreta.');
    }
    users[userIdx].passwordHash = body.newPassword;
    mockDb.saveUsers(users);
    return { message: 'Senha atualizada com sucesso!' } as unknown as T;
  }

  // PROFILE
  if (endpoint === '/profile' && method === 'GET') {
    return mockDb.getProfile(userId) as unknown as T;
  }

  if (endpoint === '/profile' && (method === 'PUT' || method === 'POST')) {
    const existing = mockDb.getProfile(userId);
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    mockDb.saveProfile(userId, updated);
    return updated as unknown as T;
  }

  // HARD SKILLS
  if (endpoint === '/skills/hard' && method === 'GET') {
    return mockDb.getList<HardSkill>(userId, 'hard_skills', []) as unknown as T;
  }
  if (endpoint === '/skills/hard' && method === 'POST') {
    return mockDb.create<HardSkill>(userId, 'hard_skills', body) as unknown as T;
  }
  if (endpoint.startsWith('/skills/hard/') && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    return mockDb.update<HardSkill>(userId, 'hard_skills', id, body) as unknown as T;
  }
  if (endpoint.startsWith('/skills/hard/') && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    mockDb.delete(userId, 'hard_skills', id);
    return { success: true } as unknown as T;
  }

  // SOFT SKILLS
  if (endpoint === '/skills/soft' && method === 'GET') {
    return mockDb.getList<SoftSkill>(userId, 'soft_skills', []) as unknown as T;
  }
  if (endpoint === '/skills/soft' && method === 'POST') {
    return mockDb.create<SoftSkill>(userId, 'soft_skills', body) as unknown as T;
  }
  if (endpoint.startsWith('/skills/soft/') && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    return mockDb.update<SoftSkill>(userId, 'soft_skills', id, body) as unknown as T;
  }
  if (endpoint.startsWith('/skills/soft/') && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    mockDb.delete(userId, 'soft_skills', id);
    return { success: true } as unknown as T;
  }

  // COURSES
  if (endpoint === '/courses' && method === 'GET') {
    return mockDb.getList<Course>(userId, 'courses', []) as unknown as T;
  }
  if (endpoint === '/courses' && method === 'POST') {
    return mockDb.create<Course>(userId, 'courses', body) as unknown as T;
  }
  if (endpoint.startsWith('/courses/') && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    return mockDb.update<Course>(userId, 'courses', id, body) as unknown as T;
  }
  if (endpoint.startsWith('/courses/') && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    mockDb.delete(userId, 'courses', id);
    return { success: true } as unknown as T;
  }

  // CERTIFICATIONS
  if (endpoint === '/certifications' && method === 'GET') {
    return mockDb.getList<Certification>(userId, 'certifications', []) as unknown as T;
  }
  if (endpoint === '/certifications' && method === 'POST') {
    return mockDb.create<Certification>(userId, 'certifications', body) as unknown as T;
  }
  if (endpoint.startsWith('/certifications/') && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    return mockDb.update<Certification>(userId, 'certifications', id, body) as unknown as T;
  }
  if (endpoint.startsWith('/certifications/') && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    mockDb.delete(userId, 'certifications', id);
    return { success: true } as unknown as T;
  }

  // PROJECTS
  if (endpoint === '/projects' && method === 'GET') {
    return mockDb.getList<Project>(userId, 'projects', []) as unknown as T;
  }
  if (endpoint === '/projects' && method === 'POST') {
    return mockDb.create<Project>(userId, 'projects', body) as unknown as T;
  }
  if (endpoint.startsWith('/projects/') && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    return mockDb.update<Project>(userId, 'projects', id, body) as unknown as T;
  }
  if (endpoint.startsWith('/projects/') && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    mockDb.delete(userId, 'projects', id);
    return { success: true } as unknown as T;
  }

  // EDUCATION
  if (endpoint === '/education' && method === 'GET') {
    return mockDb.getList<Education>(userId, 'education', []) as unknown as T;
  }
  if (endpoint === '/education' && method === 'POST') {
    return mockDb.create<Education>(userId, 'education', body) as unknown as T;
  }
  if (endpoint.startsWith('/education/') && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    return mockDb.update<Education>(userId, 'education', id, body) as unknown as T;
  }
  if (endpoint.startsWith('/education/') && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    mockDb.delete(userId, 'education', id);
    return { success: true } as unknown as T;
  }

  // EXPERIENCES
  if (endpoint === '/experiences' && method === 'GET') {
    return mockDb.getList<Experience>(userId, 'experiences', []) as unknown as T;
  }
  if (endpoint === '/experiences' && method === 'POST') {
    return mockDb.create<Experience>(userId, 'experiences', body) as unknown as T;
  }
  if (endpoint.startsWith('/experiences/') && method === 'PUT') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    return mockDb.update<Experience>(userId, 'experiences', id, body) as unknown as T;
  }
  if (endpoint.startsWith('/experiences/') && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop() || '0', 10);
    mockDb.delete(userId, 'experiences', id);
    return { success: true } as unknown as T;
  }

  // DASHBOARD SUMMARY
  if (endpoint === '/profile/summary' && method === 'GET') {
    const hard = mockDb.getList<HardSkill>(userId, 'hard_skills', []);
    const soft = mockDb.getList<SoftSkill>(userId, 'soft_skills', []);
    const courses = mockDb.getList<Course>(userId, 'courses', []);
    const certs = mockDb.getList<Certification>(userId, 'certifications', []);
    const projs = mockDb.getList<Project>(userId, 'projects', []);
    const edus = mockDb.getList<Education>(userId, 'education', []);
    const exps = mockDb.getList<Experience>(userId, 'experiences', []);
    const prof = mockDb.getProfile(userId);

    // Calculate completeness based on the 8 stages of the Atlas Trail
    const isStep1Done = Boolean(prof.headline?.trim() && (prof.careerGoal?.trim() || prof.bio?.trim()));
    const isStep2Done = hard.length >= 1;
    const isStep3Done = soft.length >= 1;
    const isStep4Done = edus.length >= 1;
    const isStep5Done = courses.length >= 1;
    const isStep6Done = certs.length >= 1;
    const isStep7Done = projs.length >= 1;
    const isStep8Done = exps.length >= 1;

    let completedSteps = 0;
    if (isStep1Done) completedSteps++;
    if (isStep2Done) completedSteps++;
    if (isStep3Done) completedSteps++;
    if (isStep4Done) completedSteps++;
    if (isStep5Done) completedSteps++;
    if (isStep6Done) completedSteps++;
    if (isStep7Done) completedSteps++;
    if (isStep8Done) completedSteps++;

    const completionPercentage = Math.round((completedSteps / 8) * 100);

    const summary: DashboardSummary = {
      completionPercentage,
      completedStepsCount: completedSteps,
      hardSkillsCount: hard.length,
      softSkillsCount: soft.length,
      coursesCount: courses.length,
      certificationsCount: certs.length,
      projectsCount: projs.length,
      experiencesCount: exps.length,
      educationCount: edus.length,
      topSkills: hard.slice(0, 5),
      recentExperiences: exps.slice(0, 3),
      profile: prof,
    };
    return summary as unknown as T;
  }

  if (endpoint.startsWith('/ai/')) {
    throw new Error('Gemini requires a configured backend.');
  }

  throw new Error(`Rota simulada não encontrada: ${method} ${endpoint}`);
}

// Exported typed API modules
export const authApi = {
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<User>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const profileApi = {
  get: () => request<UserProfile>('/profile'),
  update: (data: Partial<UserProfile>) =>
    request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getSummary: () => request<DashboardSummary>('/profile/summary'),
};

export const aiApi = {
  generateGapAnalysis: async () => {
    const snapshot = await getAiProfileSnapshot();
    const user = getStoredUser();
    if (!user) throw new Error('Entre na sua conta para gerar a análise.');
    return request<GapAnalysisResponse>('/ai/gap-analysis', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, ...snapshot }),
    });
  },
  generateLearningTrack: async () => {
    const user = getStoredUser();
    if (!user) throw new Error('Entre na sua conta para gerar uma trilha personalizada.');
    const [snapshot, modules] = await Promise.all([
      getAiProfileSnapshot(),
      trackApi.getModules(),
    ]);
    const catalog = Array.from(
      new Map(
        modules
          .flatMap((module) => module.activities.flatMap((activity) => activity.courses || []))
          .filter((course) => !course.isDemo && course.title.trim())
          .map((course) => [course.id, course])
      ).values()
    );
    return request<Omit<PersonalizedLearningTrack, 'id' | 'generatedAt'>>('/ai/learning-track', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, ...snapshot, courseCatalog: catalog }),
    });
  },
};

async function getAiProfileSnapshot() {
  const [
    profile,
    hardSkills,
    softSkills,
    courses,
    certifications,
    projects,
    education,
    experiences,
  ] = await Promise.all([
    profileApi.get(),
    hardSkillApi.getAll(),
    softSkillApi.getAll(),
    courseApi.getAll(),
    certificationApi.getAll(),
    projectApi.getAll(),
    educationApi.getAll(),
    experienceApi.getAll(),
  ]);

  return {
    profile: {
      primaryArea: profile.primaryArea,
      secondaryAreas: profile.secondaryAreas,
      careerGoal: profile.careerGoal,
      learningObjectives: profile.learningObjectives || [],
    },
    hardSkills: hardSkills.map(({ name, category, level, yearsOfExperience }) => ({
      name, category, level, yearsOfExperience,
    })),
    softSkills: softSkills.map(({ name, description, level }) => ({ name, description, level })),
    courses: courses.map(({ name, institution, status, workloadHours }) => ({
      name, institution, status, workloadHours,
    })),
    certifications: certifications.map(({ name, issuingOrganization, issueDate }) => ({
      name, issuingOrganization, issueDate,
    })),
    projects: projects.map(({ title, description, technologies, role }) => ({
      title, description, technologies, role,
    })),
    education: education.map(({ institution, degree, fieldOfStudy, status }) => ({
      institution, degree, fieldOfStudy, status,
    })),
    experiences: experiences.map(({ position, activities, startDate, endDate, isCurrent }) => ({
      position, activities, startDate, endDate, isCurrent,
    })),
  };
}

export const hardSkillApi = {
  getAll: () => request<HardSkill[]>('/skills/hard'),
  create: (data: Omit<HardSkill, 'id' | 'createdAt'>) =>
    request<HardSkill>('/skills/hard', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<HardSkill>) =>
    request<HardSkill>(`/skills/hard/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/skills/hard/${id}`, {
      method: 'DELETE',
    }),
};

export const softSkillApi = {
  getAll: () => request<SoftSkill[]>('/skills/soft'),
  create: (data: Omit<SoftSkill, 'id' | 'createdAt'>) =>
    request<SoftSkill>('/skills/soft', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<SoftSkill>) =>
    request<SoftSkill>(`/skills/soft/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/skills/soft/${id}`, {
      method: 'DELETE',
    }),
};

export const courseApi = {
  getAll: () => request<Course[]>('/courses'),
  create: (data: Omit<Course, 'id' | 'createdAt'>) =>
    request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Course>) =>
    request<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/courses/${id}`, {
      method: 'DELETE',
    }),
};

export const certificationApi = {
  getAll: () => request<Certification[]>('/certifications'),
  create: (data: Omit<Certification, 'id' | 'createdAt'>) =>
    request<Certification>('/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Certification>) =>
    request<Certification>(`/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/certifications/${id}`, {
      method: 'DELETE',
    }),
};

export const projectApi = {
  getAll: () => request<Project[]>('/projects'),
  create: (data: Omit<Project, 'id' | 'createdAt'>) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

export const educationApi = {
  getAll: () => request<Education[]>('/education'),
  create: (data: Omit<Education, 'id' | 'createdAt'>) =>
    request<Education>('/education', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Education>) =>
    request<Education>(`/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/education/${id}`, {
      method: 'DELETE',
    }),
};

export const experienceApi = {
  getAll: () => request<Experience[]>('/experiences'),
  create: (data: Omit<Experience, 'id' | 'createdAt'>) =>
    request<Experience>('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Experience>) =>
    request<Experience>(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/experiences/${id}`, {
      method: 'DELETE',
    }),
};

export const systemApi = {
  pingBackend: async (): Promise<{ online: boolean; message: string; url: string }> => {
    const url = getApiBaseUrl();
    try {
      const res = await fetch(`${url}/health`, { method: 'GET' });
      return { online: res.ok, message: `Backend Spring Boot online (${res.status})`, url };
    } catch (err: any) {
      return { online: false, message: `Não conectado: ${err.message}`, url };
    }
  },
  resetDemoData: () => {
    localStorage.clear();
    window.location.reload();
  },
};

// ==============================================================================
// LEARNING TRACKS (TRILHAS DE DESENVOLVIMENTO PROFISSIONAL)
// Categorias: Hard Skills, Soft Skills, LinkedIn, Currículo
// ==============================================================================

const STORAGE_KEY_MODULES = 'atlas_learning_modules_db';
const STORAGE_KEY_TRACK_PROGRESS_PREFIX = 'atlas_track_progress_';
const STORAGE_KEY_PERSONALIZED_TRACKS_PREFIX = 'atlas_personalized_tracks_';
const LEGACY_DEMO_MODULE_IDS = new Set([
  'mod-hs-1',
  'mod-hs-2',
  'mod-ss-1',
  'mod-ss-2',
  'mod-li-1',
  'mod-li-2',
  'mod-cv-1',
  'mod-cv-2',
]);

const DEFAULT_CATEGORIES: TrackCategory[] = [
  {
    key: 'hard-skills',
    title: 'Hard Skills',
    subtitle: 'Competências Técnicas & Engenharia',
    description: 'Sistemas operacionais, redes, linguagens, arquitetura e cibersegurança.',
  },
  {
    key: 'soft-skills',
    title: 'Soft Skills',
    subtitle: 'Competências Comportamentais',
    description: 'Comunicação assertiva, resolução de problemas, liderança e adaptabilidade.',
  },
  {
    key: 'linkedin',
    title: 'LinkedIn',
    subtitle: 'Posicionamento & Presença Digital',
    description: 'Otimização de perfil, narrativa profissional, conexões e atração de recrutadores.',
  },
  {
    key: 'curriculo',
    title: 'Currículo',
    subtitle: 'Apresentação & Compatibilidade ATS',
    description: 'Estruturação estratégica, quantificação de impacto e alinhamento a vagas.',
  },
];

function readStoredModules(): TrackModule[] {
  const stored = localStorage.getItem(STORAGE_KEY_MODULES);
  if (!stored) return [];
  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error('O catálogo de trilhas salvo está inválido.');
  return parsed as TrackModule[];
}

function saveModules(modules: TrackModule[]): void {
  const legacyDemos = readStoredModules().filter((module) => LEGACY_DEMO_MODULE_IDS.has(module.id));
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify([...legacyDemos, ...modules]));
}

export const trackApi = {
  getCategories: (): TrackCategory[] => {
    return DEFAULT_CATEGORIES;
  },

  getModules: async (categoryKey?: TrackCategoryKey): Promise<TrackModule[]> => {
    const modules = readStoredModules().filter((module) => !LEGACY_DEMO_MODULE_IDS.has(module.id));
    return categoryKey ? modules.filter((module) => module.categoryKey === categoryKey) : modules;
  },

  getPersonalizedTracks: (userId: number): PersonalizedLearningTrack[] => {
    const stored = localStorage.getItem(`${STORAGE_KEY_PERSONALIZED_TRACKS_PREFIX}${userId}`);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('O histórico de trilhas personalizadas está inválido.');
    return parsed as PersonalizedLearningTrack[];
  },

  savePersonalizedTrack: (userId: number, track: PersonalizedLearningTrack): void => {
    const tracks = trackApi.getPersonalizedTracks(userId);
    localStorage.setItem(
      `${STORAGE_KEY_PERSONALIZED_TRACKS_PREFIX}${userId}`,
      JSON.stringify([...tracks, track])
    );
  },

  addModule: async (categoryKey: TrackCategoryKey, data: { title: string; description?: string }): Promise<TrackModule> => {
    const modules = await trackApi.getModules();
    const catModules = modules.filter((m) => m.categoryKey === categoryKey);
    const newModule: TrackModule = {
      id: `mod-${categoryKey}-${Date.now()}`,
      categoryKey,
      title: data.title,
      description: data.description || '',
      order: catModules.length + 1,
      activities: [],
    };
    const updated = [...modules, newModule];
    saveModules(updated);
    return newModule;
  },

  updateModule: async (moduleId: string, data: Partial<TrackModule>): Promise<TrackModule> => {
    const modules = await trackApi.getModules();
    const idx = modules.findIndex((m) => m.id === moduleId);
    if (idx === -1) throw new Error('Módulo não encontrado.');
    const updated = { ...modules[idx], ...data };
    modules[idx] = updated;
    saveModules(modules);
    return updated;
  },

  deleteModule: async (moduleId: string): Promise<boolean> => {
    const modules = await trackApi.getModules();
    const filtered = modules.filter((m) => m.id !== moduleId);
    saveModules(filtered);
    return true;
  },

  addActivity: async (
    moduleId: string,
    data: {
      title: string;
      whyLearn?: string;
      whatYouWillLearn?: string[];
    }
  ): Promise<TrackActivity> => {
    const modules = await trackApi.getModules();
    const mIdx = modules.findIndex((m) => m.id === moduleId);
    if (mIdx === -1) throw new Error('Módulo não encontrado.');

    const newActivity: TrackActivity = {
      id: `act-${Date.now()}`,
      moduleId,
      title: data.title,
      order: (modules[mIdx].activities || []).length + 1,
      whyLearn: data.whyLearn || '',
      whatYouWillLearn: data.whatYouWillLearn || [],
      courses: [],
    };

    modules[mIdx].activities = [...(modules[mIdx].activities || []), newActivity];
    saveModules(modules);
    return newActivity;
  },

  updateActivity: async (activityId: string, data: Partial<TrackActivity>): Promise<TrackActivity> => {
    const modules = await trackApi.getModules();
    let foundActivity: TrackActivity | null = null;
    for (const mod of modules) {
      const aIdx = (mod.activities || []).findIndex((a) => a.id === activityId);
      if (aIdx !== -1) {
        mod.activities[aIdx] = { ...mod.activities[aIdx], ...data };
        foundActivity = mod.activities[aIdx];
        break;
      }
    }
    if (!foundActivity) throw new Error('Atividade não encontrada.');
    saveModules(modules);
    return foundActivity;
  },

  deleteActivity: async (activityId: string): Promise<boolean> => {
    const modules = await trackApi.getModules();
    for (const mod of modules) {
      if (mod.activities) {
        mod.activities = mod.activities.filter((a) => a.id !== activityId);
      }
    }
    saveModules(modules);
    return true;
  },

  addCourse: async (
    activityId: string,
    data: Omit<CourseMaterial, 'id'>
  ): Promise<CourseMaterial> => {
    const modules = await trackApi.getModules();
    const newCourse: CourseMaterial = {
      ...data,
      id: `course-${Date.now()}`,
    };

    let updated = false;
    for (const mod of modules) {
      for (const act of mod.activities || []) {
        if (act.id === activityId) {
          act.courses = [...(act.courses || []), newCourse];
          updated = true;
          break;
        }
      }
      if (updated) break;
    }

    if (!updated) throw new Error('Atividade não encontrada para associar o curso.');
    saveModules(modules);
    return newCourse;
  },

  deleteCourse: async (activityId: string, courseId: string): Promise<boolean> => {
    const modules = await trackApi.getModules();
    for (const mod of modules) {
      for (const act of mod.activities || []) {
        if (act.id === activityId && act.courses) {
          act.courses = act.courses.filter((c) => c.id !== courseId);
          break;
        }
      }
    }
    saveModules(modules);
    return true;
  },

  getUserProgress: (userId: number): Record<string, boolean> => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_TRACK_PROGRESS_PREFIX}${userId}`);
      if (!stored) return {};
      return JSON.parse(stored);
    } catch {
      return {};
    }
  },

  toggleActivityProgress: (userId: number, activityId: string): Record<string, boolean> => {
    const current = trackApi.getUserProgress(userId);
    const updated = { ...current, [activityId]: !current[activityId] };
    localStorage.setItem(`${STORAGE_KEY_TRACK_PROGRESS_PREFIX}${userId}`, JSON.stringify(updated));
    return updated;
  },
};

// ==========================================
// 6. VAGAS & OPORTUNIDADES PROFISSIONAIS (JOB API)
// ==========================================

const STORAGE_KEY_JOBS = 'atlas_jobs_db';
const STORAGE_KEY_APPLICATIONS_PREFIX = 'atlas_applications_';

export interface JobFilterOptions {
  search?: string;
  workModel?: WorkModel | 'ALL';
  seniority?: SeniorityLevel | 'ALL';
  area?: string | 'ALL';
  minSalary?: number;
  maxSalary?: number;
  activeOnly?: boolean;
}

const INITIAL_DEMO_JOBS: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Desenvolvedor Full Stack Júnior / Pleno',
    company: 'Nubank',
    location: 'São Paulo, SP (Remoto Brasil)',
    workModel: 'REMOTO',
    seniority: 'JUNIOR',
    minSalary: 6500,
    maxSalary: 9200,
    area: 'Desenvolvimento',
    description:
      'Venha construir os serviços e interfaces financeiras do futuro. Você trabalhará com arquitetura de alta escala, desenvolvendo interfaces ricas em React e serviços resilientes orientados a microsserviços.',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Git', 'SQL'],
    desirableSkills: ['Docker', 'GraphQL', 'Tailwind CSS', 'Next.js'],
    benefits: [
      'Trabalho 100% remoto',
      'Vale Refeição e Alimentação flexível (R$ 1.300/mês)',
      'Plano de Saúde e Odontológico Bradesco Top',
      'Auxílio Home Office e Equipamento Apple',
      'Gympass Platinum e Programa de Saúde Mental',
      'Orçamento Anual para Cursos e Certificações',
    ],
    applicationUrl: 'https://nubank.com.br/carreiras',
    applicationEmail: 'talentos@nubank.com.br',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'job-2',
    title: 'Analista de Cibersegurança & SOC Júnior',
    company: 'Stone Tecnologia',
    location: 'São Paulo, SP',
    workModel: 'HIBRIDO',
    seniority: 'JUNIOR',
    minSalary: 5800,
    maxSalary: 8200,
    area: 'Cibersegurança',
    description:
      'Responsável por monitoramento de eventos de segurança, resposta inicial a incidentes cibernéticos, análise de tráfego de redes e gestão de alertas em ambiente de pagamentos de missão crítica.',
    requiredSkills: ['Redes de Computadores', 'Linux', 'Segurança da Informação', 'Firewalls'],
    desirableSkills: ['Python', 'SIEM', 'Análise de Vulnerabilidades', 'Wireshark'],
    benefits: [
      'Modelo híbrido 2x na semana',
      'VR/VA no cartão Flash R$ 1.150/mês',
      'Assistência Médica SulAmérica',
      'Incentivo para certificações CompTIA Security+ e CEH',
      'Participação nos Lucros e Resultados (PLR)',
    ],
    applicationUrl: 'https://jornada.stone.com.br',
    applicationEmail: 'seguranca-vagas@stone.com.br',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-16T11:20:00Z',
  },
  {
    id: 'job-3',
    title: 'Desenvolvedor Backend Java / Spring Boot Pleno',
    company: 'Itaú Unibanco',
    location: 'São Paulo, SP (Remoto)',
    workModel: 'REMOTO',
    seniority: 'PLENO',
    minSalary: 8000,
    maxSalary: 11500,
    area: 'Desenvolvimento',
    description:
      'Atuação na modernização de sistemas bancários core, desenvolvendo APIs RESTful de alta performance, integrações seguras e microsserviços em nuvem privada e AWS.',
    requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Git', 'API REST'],
    desirableSkills: ['Docker', 'Kubernetes', 'AWS', 'Kafka', 'Microsserviços'],
    benefits: [
      'Remoto com flexibilidade de horário',
      'PLR bancária diferenciada',
      'Vale Refeição e Alimentação somados R$ 1.950/mês',
      'Previdência privada corporativa com aporte paritário',
      'Plano de saúde extensível a dependentes',
    ],
    applicationUrl: 'https://itau.com.br/carreiras',
    applicationEmail: 'recrutamento.tech@itau-unibanco.com.br',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-17T09:15:00Z',
  },
  {
    id: 'job-4',
    title: 'Engenheiro de DevOps & Infraestrutura Cloud Pleno',
    company: 'Thoughtworks',
    location: 'Belo Horizonte, MG (Remoto Brasil)',
    workModel: 'REMOTO',
    seniority: 'PLENO',
    minSalary: 9500,
    maxSalary: 14000,
    area: 'DevOps',
    description:
      'Impulsione a cultura de entrega contínua dos nossos clientes globais. Você irá projetar pipelines CI/CD automatizados, infraestrutura como código (IaC) e clusters Kubernetes elásticos.',
    requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
    desirableSkills: ['Terraform', 'Python', 'Prometheus', 'Grafana', 'GitLab CI'],
    benefits: [
      'Contratação CLT com política de trabalho remoto permanente',
      'Subsídio para aquisição de mobiliário ergonômico',
      'Verba anual de R$ 6.000 para congressos e educação continuada',
      'Seguro de vida e saúde sem coparticipação',
      'Licença parental estendida de 6 meses',
    ],
    applicationUrl: 'https://www.thoughtworks.com/careers',
    applicationEmail: 'vagas-brasil@thoughtworks.com',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-18T14:45:00Z',
  },
  {
    id: 'job-5',
    title: 'Analista de Dados & Business Intelligence Júnior',
    company: 'Mercado Livre',
    location: 'Osasco, SP',
    workModel: 'HIBRIDO',
    seniority: 'JUNIOR',
    minSalary: 5500,
    maxSalary: 7900,
    area: 'Dados',
    description:
      'Gere insights operacionais e de negócio para a maior plataforma de e-commerce da América Latina. Desenvolvimento de dashboards analíticos, modelagem de queries SQL complexas e automação de relatórios.',
    requiredSkills: ['SQL', 'Python', 'Power BI', 'Excel Avançado'],
    desirableSkills: ['Git', 'Estatística', 'ETL', 'BigQuery'],
    benefits: [
      'Transporte corporativo e refeição no campus MELI',
      'Descontos exclusivos em compras no Mercado Livre',
      'Plano de carreira estruturado com mentorias quinzenais',
      'Plano de saúde e odontológico Amil',
      'Bônus anual por metas atingidas',
    ],
    applicationUrl: 'https://careers-meli.mercadolibre.com',
    applicationEmail: 'analytics-jobs@mercadolivre.com',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-19T08:00:00Z',
  },
  {
    id: 'job-6',
    title: 'Analista de Qualidade de Software (QA Automation)',
    company: 'PagBank',
    location: 'São Paulo, SP (Remoto)',
    workModel: 'REMOTO',
    seniority: 'PLENO',
    minSalary: 6800,
    maxSalary: 9300,
    area: 'QA',
    description:
      'Garantir a estabilidade e qualidade funcional das plataformas de adquirência e conta digital. Escrita de cenários de teste BDD, criação e manutenção de testes end-to-end automatizados em Cypress.',
    requiredSkills: ['Testes Automatizados', 'Cypress', 'Git', 'JavaScript', 'Metodologias Ágeis'],
    desirableSkills: ['Postman', 'CI/CD', 'TypeScript', 'Jest', 'Testes de Carga'],
    benefits: [
      'Ambiente 100% remoto com jornada flexível',
      'Caju Multibenefícios (R$ 1.250 mensais)',
      'Plano Odonto e Saúde Bradesco Saúde',
      'Desconto em cursos de extensão e pós-graduação',
      'Wellhub (antigo Gympass) corporativo',
    ],
    applicationUrl: 'https://pagbank.com.br/carreiras',
    applicationEmail: 'qa-talents@pagbank.com.br',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-19T16:20:00Z',
  },
  {
    id: 'job-7',
    title: 'Estágio em Desenvolvimento Web & Frontend',
    company: 'Hotmart',
    location: 'Belo Horizonte, MG (Remoto Brasil)',
    workModel: 'REMOTO',
    seniority: 'ESTAGIO',
    minSalary: 2400,
    maxSalary: 3100,
    area: 'Desenvolvimento',
    description:
      'Programa de estágio focado em acelerar futuros talentos em tecnologia. Você apoiará na construção de componentes de interface, correção de bugs e testes visuais com acompanhamento direto de um engenheiro sênior.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Git', 'Lógica de Programação'],
    desirableSkills: ['React', 'TypeScript', 'Figma', 'Boa Comunicação'],
    benefits: [
      'Bolsa auxílio competitiva com reajuste semestral',
      'Vale Refeição / Alimentação R$ 850/mês',
      'Trilha de capacitação acelerada e mentoria técnica',
      'Horário compatível com a grade curricular da faculdade (30h/sem)',
      'Possibilidade real de efetivação após 9 meses',
    ],
    applicationUrl: 'https://hotmart.com/pt-br/carreiras',
    applicationEmail: 'estagio-tech@hotmart.com',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-20T10:10:00Z',
  },
  {
    id: 'job-8',
    title: 'Arquiteto de Soluções Cloud & Sistemas Sênior',
    company: 'CI&T',
    location: 'Campinas, SP (Remoto Brasil)',
    workModel: 'REMOTO',
    seniority: 'SENIOR',
    minSalary: 14500,
    maxSalary: 19800,
    area: 'Arquitetura',
    description:
      'Liderança técnica na concepção de arquiteturas corporativas de missão crítica, governança de microsserviços, estratégia de nuvem híbrida e otimização de custos e segurança em larga escala.',
    requiredSkills: ['Arquitetura de Software', 'AWS', 'Microsserviços', 'Docker', 'Kubernetes', 'Java'],
    desirableSkills: ['Kafka', 'Design Patterns', 'Cloud Security', 'Terraform', 'Node.js'],
    benefits: [
      'Remoto permanente em qualquer estado do Brasil',
      'Remuneração variável anual agressiva',
      'Plano de Saúde Unimed Nacional Quarto Individual',
      'Acesso livre a plataformas O’Reilly Learning e Udemy Business',
      'Auxílio ergonomia e plano odontológico gratuito',
    ],
    applicationUrl: 'https://ciandt.com/br/pt-br/carreiras',
    applicationEmail: 'careers-latam@ciandt.com',
    isActive: true,
    isDemo: true,
    createdAt: '2026-10-21T09:00:00Z',
  },
];

// Skill Normalization Helper
const normalizeSkill = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[._\-/\s]/g, '')
    .trim();
};

export const jobApi = {
  getAll: async (filters?: JobFilterOptions): Promise<JobOpportunity[]> => {
    let jobs: JobOpportunity[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_JOBS);
      if (stored) {
        jobs = JSON.parse(stored);
      } else {
        jobs = INITIAL_DEMO_JOBS;
        localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
      }
    } catch {
      jobs = INITIAL_DEMO_JOBS;
    }

    // Apply filters
    if (filters) {
      if (filters.activeOnly !== false) {
        jobs = jobs.filter((j) => j.isActive);
      }
      if (filters.workModel && filters.workModel !== 'ALL') {
        jobs = jobs.filter((j) => j.workModel === filters.workModel);
      }
      if (filters.seniority && filters.seniority !== 'ALL') {
        jobs = jobs.filter((j) => j.seniority === filters.seniority);
      }
      if (filters.area && filters.area !== 'ALL') {
        const areaFilterNorm = filters.area.toLowerCase();
        jobs = jobs.filter((j) => j.area.toLowerCase().includes(areaFilterNorm));
      }
      if (filters.minSalary) {
        jobs = jobs.filter((j) => (j.maxSalary || j.minSalary || 0) >= filters.minSalary!);
      }
      if (filters.maxSalary) {
        jobs = jobs.filter((j) => (j.minSalary || 0) <= filters.maxSalary!);
      }
      if (filters.search && filters.search.trim() !== '') {
        const term = filters.search.toLowerCase().trim();
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(term) ||
            j.company.toLowerCase().includes(term) ||
            j.description.toLowerCase().includes(term) ||
            j.requiredSkills.some((s) => s.toLowerCase().includes(term)) ||
            (j.desirableSkills && j.desirableSkills.some((s) => s.toLowerCase().includes(term)))
        );
      }
    }

    return jobs;
  },

  getById: async (id: string): Promise<JobOpportunity | null> => {
    const jobs = await jobApi.getAll({ activeOnly: false });
    return jobs.find((j) => j.id === id) || null;
  },

  create: async (data: Omit<JobOpportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobOpportunity> => {
    const jobs = await jobApi.getAll({ activeOnly: false });
    const newJob: JobOpportunity = {
      ...data,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: data.isActive ?? true,
      isDemo: data.isDemo ?? false,
    };
    const updated = [newJob, ...jobs];
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    return newJob;
  },

  update: async (id: string, data: Partial<JobOpportunity>): Promise<JobOpportunity> => {
    const jobs = await jobApi.getAll({ activeOnly: false });
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) {
      throw new Error('Vaga não encontrada para atualização.');
    }
    const updatedJob: JobOpportunity = {
      ...jobs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    jobs[index] = updatedJob;
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    return updatedJob;
  },

  delete: async (id: string): Promise<boolean> => {
    const jobs = await jobApi.getAll({ activeOnly: false });
    const filtered = jobs.filter((j) => j.id !== id);
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    return true;
  },

  resetDemoJobs: async (): Promise<JobOpportunity[]> => {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_DEMO_JOBS));
    window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    return INITIAL_DEMO_JOBS;
  },

  // Applications
  getApplications: (userId: number): JobApplication[] => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_APPLICATIONS_PREFIX}${userId}`);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveApplication: (
    userId: number,
    data: {
      jobId: string;
      status: JobApplicationStatus;
      notes?: string;
      nextStep?: string;
      appliedAt?: string;
    }
  ): JobApplication => {
    const applications = jobApi.getApplications(userId);
    const existingIndex = applications.findIndex((a) => a.jobId === data.jobId);
    let updatedApp: JobApplication;

    if (existingIndex >= 0) {
      updatedApp = {
        ...applications[existingIndex],
        status: data.status,
        notes: data.notes !== undefined ? data.notes : applications[existingIndex].notes,
        nextStep: data.nextStep !== undefined ? data.nextStep : applications[existingIndex].nextStep,
        appliedAt: data.appliedAt || applications[existingIndex].appliedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      applications[existingIndex] = updatedApp;
    } else {
      updatedApp = {
        id: `app-${Date.now()}`,
        userId,
        jobId: data.jobId,
        status: data.status,
        appliedAt: data.appliedAt || (data.status !== 'INTERESSADO' ? new Date().toISOString() : undefined),
        notes: data.notes || '',
        nextStep: data.nextStep || '',
        updatedAt: new Date().toISOString(),
      };
      applications.unshift(updatedApp);
    }

    localStorage.setItem(`${STORAGE_KEY_APPLICATIONS_PREFIX}${userId}`, JSON.stringify(applications));
    window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    return updatedApp;
  },

  deleteApplication: (userId: number, jobId: string): boolean => {
    const applications = jobApi.getApplications(userId);
    const filtered = applications.filter((a) => a.jobId !== jobId);
    localStorage.setItem(`${STORAGE_KEY_APPLICATIONS_PREFIX}${userId}`, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('atlas_data_changed'));
    return true;
  },

  // Deterministic Compatibility Match Engine
  calculateMatch: (
    job: JobOpportunity,
    profile: UserProfile | null,
    hardSkills: HardSkill[] = [],
    experiences: Experience[] = [],
    projects: Project[] = []
  ): JobMatchAnalysis => {
    const criteria: JobMatchCriterion[] = [];
    const matchedSkills: { name: string; userLevel?: SkillLevel; isRequired: boolean }[] = [];
    const missingSkills: { name: string; isRequired: boolean }[] = [];
    const strengths: string[] = [];
    const recommendations: string[] = [];

    const isEstimated = hardSkills.length < 2 && experiences.length === 0 && projects.length === 0;

    // Helper to test if a skill is held by the user
    const findUserSkill = (skillName: string): HardSkill | undefined => {
      const norm = normalizeSkill(skillName);
      return hardSkills.find((hs) => {
        const hsNorm = normalizeSkill(hs.name);
        return (
          hsNorm === norm ||
          hsNorm.includes(norm) ||
          norm.includes(hsNorm) ||
          (norm === 'react' && hsNorm.includes('react')) ||
          (norm === 'ts' && hsNorm === 'typescript') ||
          (norm === 'typescript' && hsNorm === 'ts') ||
          (norm === 'js' && hsNorm === 'javascript') ||
          (norm === 'javascript' && hsNorm === 'js') ||
          (norm === 'postgres' && hsNorm.includes('postgres')) ||
          (norm === 'postgresql' && hsNorm.includes('postgres')) ||
          (norm === 'k8s' && hsNorm.includes('kubernetes')) ||
          (norm === 'cicd' && hsNorm.includes('ci'))
        );
      });
    };

    const hasInProjects = (skillName: string): boolean => {
      const norm = normalizeSkill(skillName);
      return projects.some((p) =>
        p.technologies?.some((t) => {
          const tNorm = normalizeSkill(t);
          return tNorm === norm || tNorm.includes(norm) || norm.includes(tNorm);
        })
      );
    };

    const hasInExperiences = (skillName: string): boolean => {
      const norm = normalizeSkill(skillName);
      return experiences.some((exp) => {
        const actNorm = normalizeSkill(exp.activities || '');
        const posNorm = normalizeSkill(exp.position || '');
        return actNorm.includes(norm) || posNorm.includes(norm);
      });
    };

    // 1. Required Hard Skills Analysis (Weight: 50 points)
    let requiredScore = 0;
    const totalRequired = job.requiredSkills.length || 1;
    let requiredCountMatched = 0;

    job.requiredSkills.forEach((reqSkill) => {
      const userSkill = findUserSkill(reqSkill);
      const inProject = hasInProjects(reqSkill);
      const inExp = hasInExperiences(reqSkill);

      if (userSkill) {
        requiredCountMatched += 1;
        matchedSkills.push({ name: reqSkill, userLevel: userSkill.level, isRequired: true });
        // Level multiplier
        let mult = 0.75;
        if (userSkill.level === 'INTERMEDIARIO') mult = 0.9;
        if (userSkill.level === 'AVANCADO') mult = 1.0;
        if (userSkill.level === 'ESPECIALISTA') mult = 1.05;
        requiredScore += (50 / totalRequired) * mult;
      } else if (inProject || inExp) {
        requiredCountMatched += 0.8;
        matchedSkills.push({ name: reqSkill, userLevel: 'BASICO', isRequired: true });
        requiredScore += (50 / totalRequired) * 0.75;
      } else {
        missingSkills.push({ name: reqSkill, isRequired: true });
      }
    });

    const requiredSkillsPct = Math.min(50, Math.round(requiredScore));
    criteria.push({
      label: 'Competências Técnicas Obrigatórias',
      status:
        requiredCountMatched >= totalRequired * 0.8
          ? 'matched'
          : requiredCountMatched >= totalRequired * 0.4
          ? 'partial'
          : 'missing',
      detail: `${Math.round(requiredCountMatched)} de ${totalRequired} competências obrigatórias identificadas no seu perfil.`,
      weight: 50,
      score: requiredSkillsPct,
    });

    // 2. Desirable Skills Analysis (Weight: 15 points)
    let desirableScore = 0;
    const desirableList = job.desirableSkills || [];
    if (desirableList.length > 0) {
      let desMatched = 0;
      desirableList.forEach((desSkill) => {
        const userSkill = findUserSkill(desSkill);
        const inProj = hasInProjects(desSkill);
        const inExp = hasInExperiences(desSkill);

        if (userSkill) {
          desMatched++;
          matchedSkills.push({ name: desSkill, userLevel: userSkill.level, isRequired: false });
        } else if (inProj || inExp) {
          desMatched += 0.7;
          matchedSkills.push({ name: desSkill, userLevel: 'BASICO', isRequired: false });
        } else {
          missingSkills.push({ name: desSkill, isRequired: false });
        }
      });
      desirableScore = Math.min(15, Math.round((desMatched / desirableList.length) * 15));
      criteria.push({
        label: 'Diferenciais & Competências Desejáveis',
        status: desMatched >= desirableList.length * 0.5 ? 'matched' : desMatched > 0 ? 'partial' : 'missing',
        detail: `${Math.round(desMatched)} de ${desirableList.length} diferenciais atendidos.`,
        weight: 15,
        score: desirableScore,
      });
    } else {
      desirableScore = 15;
      criteria.push({
        label: 'Diferenciais Técnicos',
        status: 'matched',
        detail: 'A vaga não exige diferenciais extras adicionais.',
        weight: 15,
        score: 15,
      });
    }

    // 3. Professional Area & Career Goal Alignment (Weight: 20 points)
    let areaScore = 0;
    const userArea = (profile?.primaryArea || '').toLowerCase();
    const userGoal = (profile?.careerGoal || '').toLowerCase();
    const userHeadline = (profile?.headline || '').toLowerCase();
    const jobAreaNorm = job.area.toLowerCase();
    const jobTitleNorm = job.title.toLowerCase();

    let areaMatched = false;
    if (userArea && (jobAreaNorm.includes(userArea) || userArea.includes(jobAreaNorm))) {
      areaScore += 12;
      areaMatched = true;
    } else if (profile?.secondaryAreas?.some((a) => a.toLowerCase().includes(jobAreaNorm))) {
      areaScore += 8;
      areaMatched = true;
    }

    if (userGoal && (userGoal.includes(jobAreaNorm) || jobTitleNorm.includes(userGoal) || userGoal.includes('desenvolv'))) {
      areaScore += 8;
    } else if (userHeadline && (userHeadline.includes(jobAreaNorm) || jobTitleNorm.includes(userHeadline))) {
      areaScore += 5;
    } else if (areaMatched) {
      areaScore += 4;
    }

    areaScore = Math.min(20, areaScore);
    criteria.push({
      label: 'Alinhamento de Área & Objetivo Profissional',
      status: areaScore >= 16 ? 'matched' : areaScore >= 8 ? 'partial' : 'missing',
      detail:
        areaScore >= 16
          ? `Sua área principal (${profile?.primaryArea || 'TI'}) coincide com a oportunidade.`
          : 'Área profissional parcialmente convergente com o perfil informado.',
      weight: 20,
      score: areaScore,
    });

    // 4. Experience & Seniority Alignment (Weight: 15 points)
    let seniorityScore = 0;
    const totalExpYears = experiences.reduce((acc, exp) => {
      const start = new Date(exp.startDate).getTime();
      const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();
      const diffYears = Math.max(0.5, (end - start) / (1000 * 60 * 60 * 24 * 365));
      return acc + diffYears;
    }, 0);

    const targetSeniority = job.seniority;
    if (targetSeniority === 'ESTAGIO') {
      seniorityScore = 15; // open to any learner
    } else if (targetSeniority === 'JUNIOR') {
      if (totalExpYears >= 0 || projects.length >= 1) seniorityScore = 15;
      else seniorityScore = 10;
    } else if (targetSeniority === 'PLENO') {
      if (totalExpYears >= 2 || (projects.length >= 2 && hardSkills.length >= 4)) seniorityScore = 15;
      else if (totalExpYears >= 1 || projects.length >= 1) seniorityScore = 10;
      else seniorityScore = 5;
    } else if (targetSeniority === 'SENIOR' || targetSeniority === 'ESPECIALISTA' || targetSeniority === 'LEAD') {
      if (totalExpYears >= 4) seniorityScore = 15;
      else if (totalExpYears >= 2) seniorityScore = 9;
      else seniorityScore = 4;
    } else {
      seniorityScore = 12;
    }

    criteria.push({
      label: 'Senioridade & Prática Comprovada',
      status: seniorityScore >= 12 ? 'matched' : seniorityScore >= 6 ? 'partial' : 'missing',
      detail: `Senioridade ${targetSeniority} avaliada contra ${Math.round(totalExpYears)} ano(s) de vivência e ${projects.length} projeto(s) cadastrados.`,
      weight: 15,
      score: seniorityScore,
    });

    // Total Overall Percentage
    let overallPercentage = Math.round(requiredSkillsPct + desirableScore + areaScore + seniorityScore);
    overallPercentage = Math.max(10, Math.min(99, overallPercentage));

    // Craft Insights & Recommendations
    if (matchedSkills.length > 0) {
      const topMatched = matchedSkills.slice(0, 3).map((m) => m.name).join(', ');
      strengths.push(`Domínio correspondente nas tecnologias centrais: ${topMatched}.`);
    }
    if (projects.length > 0) {
      strengths.push(`Portfólio com ${projects.length} projeto(s) reforça a aplicação prática.`);
    }
    if (areaScore >= 14) {
      strengths.push(`Forte sintonia de carreira com ${job.area}.`);
    }

    if (missingSkills.length > 0) {
      const reqMissing = missingSkills.filter((m) => m.isRequired).map((m) => m.name);
      if (reqMissing.length > 0) {
        recommendations.push(
          `Adicione ou aprofunde estudos em: ${reqMissing.slice(0, 3).join(', ')} para elevar sua aderência.`
        );
      }
    }
    if (hardSkills.length < 3) {
      recommendations.push('Complete o cadastro das suas Hard Skills no Perfil para um cálculo 100% preciso.');
    }

    let summary = '';
    if (overallPercentage >= 80) {
      summary = `Excelente compatibilidade (${overallPercentage}%)! Seu perfil técnico e vivência prática atendem à grande maioria dos requisitos desta oportunidade.`;
    } else if (overallPercentage >= 60) {
      summary = `Boa compatibilidade (${overallPercentage}%). Você cumpre a base exigida pela ${job.company}, necessitando apenas consolidar algumas competências complementares.`;
    } else {
      summary = `Compatibilidade moderada (${overallPercentage}%). Esta vaga representa um ótimo roadmap de aprendizado para impulsionar suas próximas metas técnicas.`;
    }

    return {
      overallPercentage,
      isEstimated,
      matchedSkills,
      missingSkills,
      criteria,
      summary,
      strengths,
      recommendations,
    };
  },
};
