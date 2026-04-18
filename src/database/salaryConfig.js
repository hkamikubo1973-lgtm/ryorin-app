import { getDb } from './database';

export const saveSalaryConfig = async (uuid, config) => {

  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO salary_config
    (uuid, monthly_threshold, target_days, low_rate, high_rate, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(uuid) DO UPDATE SET
      monthly_threshold=excluded.monthly_threshold,
      target_days=excluded.target_days,
      low_rate=excluded.low_rate,
      high_rate=excluded.high_rate,
      updated_at=excluded.updated_at
    `,
    [
      uuid,
      config.monthly_threshold,
      config.target_days,
      config.low_rate,
      config.high_rate,
      now,
      now,
    ]
  );
};

export const getSalaryConfig = async (uuid) => {

  const db = await getDb();

  const result = await db.getFirstAsync(
    `SELECT * FROM salary_config WHERE uuid = ?`,
    [uuid]
  );

  return result;
};