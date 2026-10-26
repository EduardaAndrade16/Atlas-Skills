import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;
let connectionAttempted = false;
let isConnected = false;

export function getMySqlPool(): mysql.Pool | null {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'atlas_skills';

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000,
    });
    return pool;
  } catch (err) {
    console.warn('[MySQL] Falha ao instanciar pool de conexão:', err);
    return null;
  }
}

export async function testMySqlConnection(): Promise<{ connected: boolean; message: string }> {
  connectionAttempted = true;
  const p = getMySqlPool();
  if (!p) {
    isConnected = false;
    return { connected: false, message: 'Pool MySQL não inicializado.' };
  }

  try {
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    return { connected: true, message: `Conectado com sucesso ao MySQL (${process.env.MYSQL_HOST || 'localhost'}:${process.env.MYSQL_PORT || 3306}/${process.env.MYSQL_DATABASE || 'atlas_skills'}).` };
  } catch (err: any) {
    isConnected = false;
    const msg = err?.message || String(err);
    return { connected: false, message: `MySQL offline ou indisponível: ${msg}` };
  }
}

export function isMySqlConnected(): boolean {
  return isConnected;
}
