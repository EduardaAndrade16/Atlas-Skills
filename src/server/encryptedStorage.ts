import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Diretório de armazenamento de dados criptografados
const STORAGE_DIR = path.resolve(process.cwd(), 'data', 'encrypted');

// Chave legada para migração transparente de arquivos antigos, se existirem
const LEGACY_SALT = 'atlas-skills-data-salt-v1';
const LEGACY_KEY = crypto.scryptSync('atlas_skills_aes_256_master_key_default_2026', LEGACY_SALT, 32);
const ALGORITHM = 'aes-256-gcm';

// Obtém a chave criptográfica ativa de 256 bits (32 bytes)
export function getEncryptionKey(): Buffer {
  const rawKey = (process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET || '').trim();

  // Se for uma string hexadecimal válida de 64 caracteres (256 bits / 32 bytes), utiliza diretamente
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  // Caso seja uma frase-chave ou texto livre, deriva 256 bits de alta entropia via scrypt
  const fallback = rawKey || 'atlas_skills_aes_256_master_key_default_2026';
  return crypto.scryptSync(fallback, LEGACY_SALT, 32);
}

export interface EncryptedPayload {
  version: number;
  algorithm: string;
  iv: string;
  authTag: string;
  data: string;
  updatedAt: string;
}

// Garante que o diretório de dados criptografados exista
export function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

// Criptografa dados em formato AES-256-GCM com a chave de 256 bits ativa
export function encryptData<T>(data: T): EncryptedPayload {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const jsonString = JSON.stringify(data);
  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    version: 1,
    algorithm: ALGORITHM,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted,
    updatedAt: new Date().toISOString(),
  };
}

// Descriptografa dados com a chave ativa de 256 bits (com fallback para chave legada se necessário)
export function decryptData<T>(payload: EncryptedPayload): T {
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');

  // 1. Tenta com a chave de 256 bits ativa
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(payload.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted) as T;
  } catch (primaryErr) {
    // 2. Se falhar, tenta com a chave legada para migração suave
    try {
      const legacyDecipher = crypto.createDecipheriv(ALGORITHM, LEGACY_KEY, iv);
      legacyDecipher.setAuthTag(authTag);
      let decrypted = legacyDecipher.update(payload.data, 'hex', 'utf8');
      decrypted += legacyDecipher.final('utf8');
      return JSON.parse(decrypted) as T;
    } catch {
      throw primaryErr;
    }
  }
}

// Caminho do arquivo da coleção
function getFilePath(collectionName: string): string {
  ensureStorageDir();
  return path.join(STORAGE_DIR, `${collectionName}.enc`);
}

// Lê e descriptografa uma coleção do disco
export function readEncryptedCollection<T>(collectionName: string, defaultValue: T): T {
  const filePath = getFilePath(collectionName);
  if (!fs.existsSync(filePath)) {
    writeEncryptedCollection(collectionName, defaultValue);
    return defaultValue;
  }

  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const payload = JSON.parse(rawContent) as EncryptedPayload;
    return decryptData<T>(payload);
  } catch (err) {
    console.warn(`[EncryptedStorage] Falha ao ler/descriptografar ${collectionName}. Usando valor padrão:`, err);
    return defaultValue;
  }
}

// Criptografa e salva uma coleção no disco
export function writeEncryptedCollection<T>(collectionName: string, data: T): void {
  const filePath = getFilePath(collectionName);
  const payload = encryptData(data);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}

// Retorna estatísticas dos arquivos criptografados
export function getStorageStats(): {
  directory: string;
  algorithm: string;
  fileCount: number;
  files: Array<{ name: string; sizeBytes: number; updatedAt: string }>;
} {
  ensureStorageDir();
  const entries = fs.readdirSync(STORAGE_DIR).filter((f) => f.endsWith('.enc'));
  const files = entries.map((name) => {
    const p = path.join(STORAGE_DIR, name);
    const stats = fs.statSync(p);
    return {
      name,
      sizeBytes: stats.size,
      updatedAt: stats.mtime.toISOString(),
    };
  });

  return {
    directory: STORAGE_DIR,
    algorithm: ALGORITHM,
    fileCount: files.length,
    files,
  };
}

// ==============================================================================
// DADOS INICIAIS (SEED) PARA AS COLEÇÕES CRIPTOGRAFADAS
// ==============================================================================

export const INITIAL_PROFILE = {
  id: 1,
  userId: 1,
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
  updatedAt: new Date().toISOString(),
};

export const INITIAL_USER = {
  id: 1,
  name: 'Eduarda Andrade',
  email: 'eduarda.andrade@atlasskills.com',
  createdAt: '2026-01-15T10:00:00Z',
};

export const INITIAL_USERS = [
  {
    user: INITIAL_USER,
    passwordHash: 'password123',
    profile: INITIAL_PROFILE,
  },
];

const INITIAL_HARD_SKILLS = [
  { id: 1, name: 'Java 17 / Spring Boot 3', category: 'Backend', level: 'AVANCADO', yearsOfExperience: 4 },
  { id: 2, name: 'TypeScript & React', category: 'Frontend', level: 'AVANCADO', yearsOfExperience: 3 },
  { id: 3, name: 'MySQL & PostgreSQL', category: 'Banco de Dados', level: 'INTERMEDIARIO', yearsOfExperience: 3 },
  { id: 4, name: 'Docker & Kubernetes', category: 'DevOps / Cloud', level: 'INTERMEDIARIO', yearsOfExperience: 2 },
  { id: 5, name: 'REST APIs & JWT Auth', category: 'Arquitetura', level: 'ESPECIALISTA', yearsOfExperience: 4 },
  { id: 6, name: 'Tailwind CSS', category: 'Frontend', level: 'ESPECIALISTA', yearsOfExperience: 3 },
];

const INITIAL_SOFT_SKILLS = [
  { id: 1, name: 'Comunicação Assertiva', description: 'Capacidade de alinhar expectativas entre times técnicos e de negócios.', level: 'AVANCADO', contextExample: 'Apresentação de arquiteturas e mentoria técnica de pares.' },
  { id: 2, name: 'Resolução de Problemas Complexos', description: 'Abordagem analítica para debugar gargalos e criar soluções resilientes.', level: 'ESPECIALISTA', contextExample: 'Diagnóstico de concorrência em transações financeiras.' },
  { id: 3, name: 'Trabalho Colaborativo', description: 'Espírito de equipe, code review empático e facilitação de cerimônias ágeis.', level: 'AVANCADO', contextExample: 'Pair programming e alinhamentos diários em equipes remotas.' },
  { id: 4, name: 'Adaptabilidade e Aprendizado Rápido', description: 'Agilidade na assimilação de novos frameworks, ferramentas e domínios.', level: 'ESPECIALISTA', contextExample: 'Migração de monólito para microsserviços em poucas sprints.' },
];

const INITIAL_COURSES = [
  { id: 1, name: 'Spring Boot 3 & Microsserviços com Docker', institution: 'Alura', workloadHours: 60, status: 'CONCLUIDO', startDate: '2025-02-10', completionDate: '2025-04-15', certificateUrl: 'https://cursos.exemplo.com/cert/sp3-60h' },
  { id: 2, name: 'Arquitetura Limpa e DDD na Prática', institution: 'Full Cycle', workloadHours: 80, status: 'CONCLUIDO', startDate: '2025-06-01', completionDate: '2025-09-20', certificateUrl: 'https://cursos.exemplo.com/cert/clean-arch-80h' },
  { id: 3, name: 'React 19, TypeScript e Server Components', institution: 'Rocketseat', workloadHours: 45, status: 'EM_ANDAMENTO', startDate: '2026-01-10' },
];

const INITIAL_CERTIFICATIONS = [
  { id: 1, name: 'AWS Certified Solutions Architect – Associate', issuingOrganization: 'Amazon Web Services (AWS)', issueDate: '2025-05-15', expirationDate: '2028-05-15', credentialId: 'AWS-SAA-839219', credentialUrl: 'https://aws.amazon.com/verification' },
  { id: 2, name: 'Oracle Certified Professional: Java SE 17 Developer', issuingOrganization: 'Oracle', issueDate: '2024-11-20', credentialId: 'OCP-17-99201', credentialUrl: 'https://catalog-education.oracle.com' },
];

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: 'Atlas Skills Platform',
    description: 'Plataforma completa de gestão de competências, perfis profissionais e mapeamento de carreira integrada com Spring Boot e React.',
    technologies: ['Java 17', 'Spring Boot', 'React', 'TypeScript', 'MySQL', 'JWT', 'Tailwind CSS'],
    role: 'Tech Lead & Full Stack Developer',
    repositoryUrl: 'https://github.com/atlas-skills/atlas-platform',
    liveUrl: 'https://atlas-skills.dev',
    startDate: '2026-01-01',
  },
  {
    id: 2,
    title: 'Cloud Event Broker Microservices',
    description: 'Sistema assíncrono para ingestão e processamento de eventos de alta taxa de transferência com Spring Cloud Stream e RabbitMQ.',
    technologies: ['Spring Boot', 'RabbitMQ', 'PostgreSQL', 'Docker', 'JUnit 5'],
    role: 'Backend Architect',
    repositoryUrl: 'https://github.com/atlas-skills/event-broker',
    startDate: '2025-08-01',
    endDate: '2025-12-15',
  },
];

const INITIAL_EDUCATION = [
  {
    id: 1,
    institution: 'Universidade de São Paulo (USP)',
    degree: 'Bacharelado em Ciência da Computação',
    fieldOfStudy: 'Ciência da Computação & Engenharia de Software',
    status: 'CONCLUIDO',
    startDate: '2020-02-01',
    endDate: '2024-12-15',
  },
  {
    id: 2,
    institution: 'FIAP',
    degree: 'Pós-Graduação / Especialização em Cloud Computing & DevOps Architecture',
    fieldOfStudy: 'Arquitetura Cloud e Sistemas Distribuídos',
    status: 'EM_ANDAMENTO',
    startDate: '2025-03-01',
  },
];

const INITIAL_EXPERIENCES = [
  {
    id: 1,
    company: 'Nexus Tech Solutions',
    position: 'Engenheira de Software Full Stack Pleno',
    workModel: 'REMOTO',
    startDate: '2024-03-01',
    isCurrent: true,
    activities: 'Desenvolvimento e sustentação de microsserviços em Spring Boot 3; implementação de pipelines CI/CD; modelagem de dados no MySQL e criação de SPAs em React com TypeScript.',
  },
  {
    id: 2,
    company: 'Innovate Inovação Digital',
    position: 'Desenvolvedora Backend Jr',
    workModel: 'HIBRIDO',
    startDate: '2022-08-01',
    endDate: '2024-02-28',
    isCurrent: false,
    activities: 'Criação de endpoints REST, automação de testes unitários com JUnit 5 e Mockito, integração de sistemas legados e otimização de consultas SQL.',
  },
];

// Inicializa todos os arquivos criptografados no boot da aplicação se ainda não existirem
export function initializeEncryptedDatabase(): void {
  ensureStorageDir();

  // Lê (com migração legada transparente se necessário) e regrava com a chave de 256 bits ativa
  const user = readEncryptedCollection('user', INITIAL_USER);
  writeEncryptedCollection('user', user);

  const users = readEncryptedCollection('users', INITIAL_USERS);
  writeEncryptedCollection('users', users);

  const profile = readEncryptedCollection('profile', INITIAL_PROFILE);
  writeEncryptedCollection('profile', profile);

  const hard = readEncryptedCollection('hard_skills', INITIAL_HARD_SKILLS);
  writeEncryptedCollection('hard_skills', hard);

  const soft = readEncryptedCollection('soft_skills', INITIAL_SOFT_SKILLS);
  writeEncryptedCollection('soft_skills', soft);

  const courses = readEncryptedCollection('courses', INITIAL_COURSES);
  writeEncryptedCollection('courses', courses);

  const certs = readEncryptedCollection('certifications', INITIAL_CERTIFICATIONS);
  writeEncryptedCollection('certifications', certs);

  const projects = readEncryptedCollection('projects', INITIAL_PROJECTS);
  writeEncryptedCollection('projects', projects);

  const edu = readEncryptedCollection('education', INITIAL_EDUCATION);
  writeEncryptedCollection('education', edu);

  const exp = readEncryptedCollection('experiences', INITIAL_EXPERIENCES);
  writeEncryptedCollection('experiences', exp);

  console.log(`[EncryptedStorage] Repositório inicializado e sincronizado com chave de 256 bits em ${STORAGE_DIR} (AES-256-GCM).`);
}
