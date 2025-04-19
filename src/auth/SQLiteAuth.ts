import sqlite3 from 'sqlite3';
import { initAuthCreds, BufferJSON, proto } from 'baileys';
import { promisify } from 'util';

const db = new sqlite3.Database('./auth.sqlite');

const run: (sql: string, params?: any[]) => Promise<void> =
  promisify(db.run.bind(db));

const get = <T = any>(sql: string, params?: any[]): Promise<T | undefined> =>
  promisify(db.get.bind(db))(sql, params);

const all = <T = any>(sql: string, params?: any[]): Promise<T[]> =>
  promisify(db.all.bind(db))(sql, params);


async function initTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS credentials (
      session_id TEXT PRIMARY KEY,
      creds TEXT
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS keys (
      session_id TEXT,
      type TEXT,
      id TEXT,
      value TEXT,
      PRIMARY KEY (session_id, type, id)
    );
  `);
}

export async function useSQLiteAuth(sessionId: string) {
  await initTables();

  const row = await get<{ creds: string }>(
    'SELECT creds FROM credentials WHERE session_id = ?',
    [sessionId]
  );


  const creds = row ? JSON.parse(row.creds, BufferJSON.reviver) : initAuthCreds();

  const saveCreds = async () => {
    const data = JSON.stringify(creds, BufferJSON.replacer);
    await run(
      'INSERT OR REPLACE INTO credentials (session_id, creds) VALUES (?, ?)',
      [sessionId, data]
    );
  };

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          if (!ids.length) return {};
          const placeholders = ids.map(() => '?').join(',');
          const rows = await all<{ id: string; value: string }>(
            `SELECT id, value FROM keys WHERE session_id = ? AND type = ? AND id IN (${placeholders})`,
            [sessionId, type, ...ids]
          );

          const result: Record<string, any> = {};
          for (const row of rows) {
            result[row.id] = JSON.parse(row.value, BufferJSON.reviver);
          }

          return result;
        },
        set: async (data: Record<string, Record<string, any>>) => {
          for (const type in data) {
            for (const id in data[type]) {
              const value = JSON.stringify(data[type][id], BufferJSON.replacer);
              await run(
                `INSERT OR REPLACE INTO keys (session_id, type, id, value) VALUES (?, ?, ?, ?)`,
                [sessionId, type, id, value]
              );
            }
          }
        }
      }
    },
    saveCreds
  };
}
