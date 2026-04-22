/**
 * ============================================
 * ⚠ Phase2 安定固定領域（Technical Master Ver.T7.1）
 * UI完全整合版
 * ============================================
 */

import * as SQLite from 'expo-sqlite';

export type BusinessType = 'normal' | 'charter' | 'other';

let db: SQLite.SQLiteDatabase | null = null;

/* =========================
   DB取得
========================= */

export const getDb = async () => {

  if (!db) {

    db = await SQLite.openDatabaseAsync('app.db');

    await db.execAsync(`

    /* 売上 */

    CREATE TABLE IF NOT EXISTS daily_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      duty_date TEXT NOT NULL,
      sales INTEGER NOT NULL,
      business_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_daily_uuid_date
    ON daily_records(uuid, duty_date);

    /* 食事 */

    CREATE TABLE IF NOT EXISTS meal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      duty_date TEXT NOT NULL,
      meal_label TEXT,
      timing TEXT,
      created_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_meal_uuid_date
    ON meal_records(uuid, duty_date);

    /* 天気 */

    CREATE TABLE IF NOT EXISTS weather_records (
      uuid TEXT NOT NULL,
      duty_date TEXT NOT NULL,
      weather TEXT NOT NULL,
      PRIMARY KEY (uuid, duty_date)
    );

    /* サイクル */

    CREATE TABLE IF NOT EXISTS cycle_settings (
      uuid TEXT PRIMARY KEY,
      base_date TEXT NOT NULL,
      pattern_json TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    /* 勤務例外 */

    CREATE TABLE IF NOT EXISTS duty_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      duty_date TEXT NOT NULL,
      duty_type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_override_unique
    ON duty_overrides(uuid, duty_date);

    /* ログ */

    CREATE TABLE IF NOT EXISTS app_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_logs_uuid
ON app_logs(uuid);

    `);

  }

  return db;
};


/* =========================
   売上保存
========================= */

export const insertDailyRecord = async (
  uuid: string,
  dutyDate: string,
  sales: number,
  businessType: string
) => {

  const database = await getDb();

  await database.runAsync(
    `
    INSERT INTO daily_records
    (uuid, duty_date, sales, business_type, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    `,
    [uuid, dutyDate, sales, businessType]
  );

};

/* =========================
   今日売上
========================= */

export const getTodayTotalSales = async (
  uuid: string,
  dutyDate: string
): Promise<number> => {

  const database = await getDb();

  const row = await database.getFirstAsync<{ total: number }>(
    `
    SELECT SUM(sales) as total
    FROM daily_records
    WHERE uuid = ?
    AND duty_date = ?
    `,
    [uuid, dutyDate]
  );

  return row?.total ?? 0;
};


/* =========================
   月売上（締日バグ完全修正）
========================= */

const toLocalDateString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getMonthlyTotalSales = async (
  uuid: string,
  dutyDate: string,
  closingDay: number
): Promise<number> => {

  const database = await getDb();

  const base = new Date(dutyDate);
  const year = base.getFullYear();
  const month = base.getMonth();
  const day = base.getDate();

  let start: Date;
  let end: Date;

  if (closingDay === 31) {
    // ★月末締め（完全対応）
    start = new Date(year, month, 1);
    end = new Date(year, month + 1, 0);
  } else {
    if (day > closingDay) {
      start = new Date(year, month, closingDay + 1);
      end = new Date(year, month + 1, closingDay);
    } else {
      start = new Date(year, month - 1, closingDay + 1);
      end = new Date(year, month, closingDay);
    }
  }

  // ★ここ重要（UTCバグ回避）
  const startStr = toLocalDateString(start);
  const endStr = toLocalDateString(end);

  const row = await database.getFirstAsync<{ total: number }>(
    `
    SELECT SUM(sales) as total
    FROM daily_records
    WHERE uuid = ?
    AND duty_date BETWEEN ? AND ?
    `,
    [uuid, startStr, endStr]
  );

  return row?.total ?? 0;
};


/* =========================
   今日売上一覧
========================= */

export const getDailyRecords = async (
  uuid: string,
  dutyDate: string
) => {

  const database = await getDb();

  return database.getAllAsync(
    `
    SELECT *
    FROM daily_records
    WHERE uuid = ?
    AND duty_date = ?
    ORDER BY id DESC
    `,
    [uuid, dutyDate]
  );
};


/* =========================
   売上内訳
========================= */

export const getDailySalesSummaryByDutyDate = async (
  uuid: string,
  dutyDate: string
) => {

  const database = await getDb();

  const rows = await database.getAllAsync(
    `
    SELECT business_type, SUM(sales) as total
    FROM daily_records
    WHERE uuid = ?
    AND duty_date = ?
    GROUP BY business_type
    `,
    [uuid, dutyDate]
  );

  const result = {
    normal: 0,
    charter: 0,
    other: 0,
  };

  rows.forEach((r: any) => {

    if (r.business_type === 'charter') result.charter = r.total;
    else if (r.business_type === 'other') result.other = r.total;
    else result.normal = r.total;

  });

  return result;
};


/* =========================
   売上リセット
========================= */

export const resetDailySalesByDutyDate = async (
  uuid: string,
  dutyDate: string
) => {

  const database = await getDb();

  await database.runAsync(
    `
    DELETE FROM daily_records
    WHERE uuid = ?
    AND duty_date = ?
    `,
    [uuid, dutyDate]
  );
};


/* =========================
   天気保存
========================= */

export const updateWeatherByDutyDate = async (
  uuid: string,
  dutyDate: string,
  weather: string
) => {

  const database = await getDb();

  await database.runAsync(
    `
    INSERT OR REPLACE INTO weather_records
    (uuid, duty_date, weather)
    VALUES (?, ?, ?)
    `,
    [uuid, dutyDate, weather]
  );
};


/* =========================
   天気取得
========================= */

export const getTodayWeather = async (
  uuid: string,
  dutyDate: string
) => {

  const database = await getDb();

  const row = await database.getFirstAsync<{ weather: string }>(
    `
    SELECT weather
    FROM weather_records
    WHERE uuid = ?
    AND duty_date = ?
    `,
    [uuid, dutyDate]
  );

  return row?.weather ?? null;
};


/* =========================
   サイクル取得
========================= */

export const getCycleSettings = async (uuid: string) => {

  const database = await getDb();

  return database.getFirstAsync(
    `
    SELECT *
    FROM cycle_settings
    WHERE uuid = ?
    `,
    [uuid]
  );
};


/* =========================
   サイクル保存
========================= */

export const saveCycleSettings = async (
  uuid: string,
  baseDate: string,
  pattern: string[]
) => {

  const database = await getDb();

  await database.runAsync(
    `
    INSERT OR REPLACE INTO cycle_settings
    (uuid, base_date, pattern_json, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `,
    [uuid, baseDate, JSON.stringify(pattern)]
  );
};


/* =========================
   勤務例外保存
========================= */

export const setDutyOverride = async (
  uuid: string,
  dutyDate: string,
  dutyType: string
) => {

  const database = await getDb();

  await database.runAsync(
    `
    INSERT OR REPLACE INTO duty_overrides
    (uuid, duty_date, duty_type)
    VALUES (?, ?, ?)
    `,
    [uuid, dutyDate, dutyType]
  );
};


/* =========================
   勤務例外取得
========================= */

export const getDutyOverride = async (
  uuid: string,
  dutyDate: string
) => {

  const database = await getDb();

  return database.getFirstAsync<{ duty_type: string }>(
    `
    SELECT duty_type
    FROM duty_overrides
    WHERE uuid = ?
    AND duty_date = ?
    `,
    [uuid, dutyDate]
  );
};
export const initDatabase = async () => {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cycle_settings (
      uuid TEXT PRIMARY KEY,
      base_date TEXT,
      pattern_json TEXT,
      updated_at TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT,
      duty_date TEXT,
      sales INTEGER,
      business_type TEXT,
      weather TEXT,
      created_at TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT,
      duty_date TEXT,
      meal_label TEXT,
      memo TEXT,
      created_at TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS area_records (
      uuid TEXT NOT NULL,
      duty_date TEXT NOT NULL,
      time_zone TEXT NOT NULL,
      slot_index INTEGER NOT NULL,
      area_name TEXT,
      created_at TEXT,
      PRIMARY KEY (uuid, duty_date, time_zone, slot_index)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS salary_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      monthly_threshold INTEGER,
      target_days INTEGER,
      low_rate REAL,
      high_rate REAL,
      created_at TEXT,
      updated_at TEXT
    );
  `);
  };