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
// DADOS INICIAIS LIMPOS PARA AS COLEÇÕES CRIPTOGRAFADAS (SEM DADOS PRÉ-CADASTRADOS)
// ==============================================================================

export const INITIAL_PROFILE = {
  id: 1,
  userId: 1,
  headline: '',
  bio: '',
  primaryArea: '',
  secondaryAreas: [],
  careerGoal: '',
  phone: '',
  location: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_USER = {
  id: 1,
  name: 'Maria Eduarda Andrade',
  email: 'mariaeduarda.andrade@unoeste.edu.br',
  createdAt: new Date().toISOString(),
};

export const INITIAL_USERS = [
  {
    user: INITIAL_USER,
    passwordHash: 'password123',
    profile: INITIAL_PROFILE,
  },
];

const INITIAL_HARD_SKILLS: any[] = [];
const INITIAL_SOFT_SKILLS: any[] = [];
const INITIAL_COURSES: any[] = [];
const INITIAL_CERTIFICATIONS: any[] = [];
const INITIAL_PROJECTS: any[] = [];
const INITIAL_EDUCATION: any[] = [];
const INITIAL_EXPERIENCES: any[] = [];

// Força a reinicialização para um perfil 100% limpo, sem resquícios de sementes mock
export function resetToEmptyUserAndProfile(): void {
  ensureStorageDir();
  writeEncryptedCollection('user', INITIAL_USER);
  writeEncryptedCollection('users', INITIAL_USERS);
  writeEncryptedCollection('profile', INITIAL_PROFILE);
  writeEncryptedCollection('hard_skills', []);
  writeEncryptedCollection('soft_skills', []);
  writeEncryptedCollection('courses', []);
  writeEncryptedCollection('certifications', []);
  writeEncryptedCollection('projects', []);
  writeEncryptedCollection('education', []);
  writeEncryptedCollection('experiences', []);
  writeEncryptedCollection('learning_tracks', null);
  writeEncryptedCollection('track_progress', {});
  console.log('[EncryptedStorage] Repositório resetado para estado 100% limpo.');
}

export function clearTemporarySessionData(userId: number): void {
  ensureStorageDir();

  const profile = {
    ...INITIAL_PROFILE,
    id: userId,
    userId,
    updatedAt: new Date().toISOString(),
  };
  const users = readEncryptedCollection<any[]>('users', INITIAL_USERS);
  const updatedUsers = users.map((entry) =>
    entry.user?.id === userId ? { ...entry, profile } : entry
  );

  writeEncryptedCollection('users', updatedUsers);
  writeEncryptedCollection('profile', profile);
  writeEncryptedCollection('hard_skills', []);
  writeEncryptedCollection('soft_skills', []);
  writeEncryptedCollection('courses', []);
  writeEncryptedCollection('certifications', []);
  writeEncryptedCollection('projects', []);
  writeEncryptedCollection('education', []);
  writeEncryptedCollection('experiences', []);
  writeEncryptedCollection('learning_tracks', null);
  writeEncryptedCollection('track_progress', {});
}

// Inicializa todos os arquivos criptografados no boot da aplicação
export function initializeEncryptedDatabase(): void {
  ensureStorageDir();

  // Se houver resquícios do mock legado antigo (ex: Spring Boot 3 ou headline de Engenheira pré-preenchido), reseta para limpo
  const existingHard = readEncryptedCollection<any[]>('hard_skills', []);
  const existingProfile = readEncryptedCollection<any>('profile', INITIAL_PROFILE);
  const hasLegacyMock =
    existingHard.some((s) => s.name?.includes('Java 17') || s.name?.includes('Spring Boot 3')) ||
    existingProfile.headline === 'Engenheira de Software Full Stack & Arquiteta Cloud';

  if (hasLegacyMock) {
    console.log('[EncryptedStorage] Detectado perfil legado com dados mock. Limpando para perfil virgem...');
    resetToEmptyUserAndProfile();
    return;
  }

  // Inicialização garantindo que todos os arquivos existam
  readEncryptedCollection('user', INITIAL_USER);
  readEncryptedCollection('users', INITIAL_USERS);
  readEncryptedCollection('profile', INITIAL_PROFILE);
  readEncryptedCollection('hard_skills', INITIAL_HARD_SKILLS);
  readEncryptedCollection('soft_skills', INITIAL_SOFT_SKILLS);
  readEncryptedCollection('courses', INITIAL_COURSES);
  readEncryptedCollection('certifications', INITIAL_CERTIFICATIONS);
  readEncryptedCollection('projects', INITIAL_PROJECTS);
  readEncryptedCollection('education', INITIAL_EDUCATION);
  readEncryptedCollection('experiences', INITIAL_EXPERIENCES);

  console.log(`[EncryptedStorage] Repositório inicializado e sincronizado em ${STORAGE_DIR} (AES-256-GCM).`);
}
