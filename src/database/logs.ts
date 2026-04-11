import { getDb } from './database';

export const insertLog = async (
  uuid: string,
  action: string,
  detail?: any
) => {
  try {
    const db = await getDb();

    await db.runAsync(
      `
      INSERT INTO app_logs (uuid, action, detail, created_at)
      VALUES (?, ?, ?, datetime('now'))
      `,
      [uuid, action, detail ? JSON.stringify(detail) : '']
    );

  } catch (e) {
    console.log('LOG ERROR:', action, e);
  }
};

export const getLogs = async () => {
  const db = await getDb();

  return await db.getAllAsync(`
    SELECT * FROM app_logs
    ORDER BY created_at DESC
    LIMIT 100
  `);
};