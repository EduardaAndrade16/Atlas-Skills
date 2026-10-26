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
  id: 0,
  userId: 0,
  primaryArea: '',
  secondaryAreas: [] as string[],
  careerGoal: '',
};
export const INITIAL_USER: null = null;
export const INITIAL_USERS: Array<{
  user: { id: number; name: string; email: string; createdAt: string };
  passwordHash: string;
  profile: typeof INITIAL_PROFILE;
}> = [];
const INITIAL_HARD_SKILLS: unknown[] = [];
const INITIAL_SOFT_SKILLS: unknown[] = [];
const INITIAL_COURSES: unknown[] = [];
const INITIAL_CERTIFICATIONS: unknown[] = [];
const INITIAL_PROJECTS: unknown[] = [];
const INITIAL_EDUCATION: unknown[] = [];
const INITIAL_EXPERIENCES: unknown[] = [];

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
