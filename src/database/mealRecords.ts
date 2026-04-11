// src/database/mealRecords.ts

import { getDb } from './database';
import { normalizeDutyDate } from '../utils/normalizeDutyDate';
import { MealLabel } from '../types/MealLabel';

/* =========================================
   型定義（安全化）
========================================= */
type DailyMealMemo = {
  id?: number;
  uuid: string;
  duty_date: string;
  breakfast_memo: string;
  lunch_memo: string;
  dinner_memo: string;
  snack_memo: string;
  updated_at: string;
};

/* =========================================
   既存：食事レコード取得
========================================= */
export const getMealRecordsByDutyDate = async (
  uuid: string,
  dutyDate: string
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);

  try {
    return await db.getAllAsync(
      `
      SELECT *
      FROM meal_records
      WHERE uuid = ? AND duty_date = ?
      ORDER BY created_at ASC
      `,
      [uuid, date]
    );
  } catch (e) {
    console.error('❌ getMealRecords error', e);
    return [];
  }
};

/* =========================================
   食事レコード保存（重複防止）
========================================= */
export const insertMealRecord = async (
  uuid: string,
  dutyDate: string,
  timing: string,
  mealLabel: MealLabel
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);

  const nowDate = new Date();
  const now = nowDate.toISOString();

  try {
    const last = await db.getFirstAsync<{
      id: number;
      meal_label: string;
      created_at: string;
      timing: string;
    }>(
      `
      SELECT *
      FROM meal_records
      WHERE uuid = ? AND duty_date = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [uuid, date]
    );

    if (last) {
      const lastTime = new Date(last.created_at).getTime();
      const diffSeconds =
        (nowDate.getTime() - lastTime) / 1000;

      if (
        last.meal_label === mealLabel &&
        last.timing === timing &&
        diffSeconds <= 5
      ) {
        console.log('⛔ 重複防止');
        return;
      }
    }

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
        INSERT INTO meal_records (
          uuid,
          duty_date,
          meal_label,
          created_at,
          timing
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [uuid, date, mealLabel, now, timing]
      );
    });

  } catch (e) {
    console.error('❌ insertMealRecord error', e);
  }
};

/* =========================================
   削除
========================================= */
export const deleteMealRecord = async (id: number) => {
  const db = await getDb();

  try {
    await db.runAsync(
      `DELETE FROM meal_records WHERE id = ?`,
      [id]
    );
  } catch (e) {
    console.error('❌ delete error', e);
  }
};

/* =========================================
   メモテーブル作成
========================================= */
export const ensureDailyMealMemoTable = async () => {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_meal_memo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      duty_date TEXT NOT NULL,
      breakfast_memo TEXT,
      lunch_memo TEXT,
      dinner_memo TEXT,
      snack_memo TEXT,
      updated_at TEXT NOT NULL
    );
  `);
};

/* =========================================
   メモ取得（完全安全版）
========================================= */
export const getDailyMealMemo = async (
  uuid: string,
  dutyDate: string
): Promise<DailyMealMemo | null> => {

  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);

  try {
    const result = await db.getFirstAsync<any>(
      `
      SELECT *
      FROM daily_meal_memo
      WHERE uuid = ? AND duty_date = ?
      `,
      [uuid, date]
    );

    if (!result) return null;

    return {
      id: result.id,
      uuid: result.uuid,
      duty_date: result.duty_date,
      breakfast_memo: result.breakfast_memo ?? '',
      lunch_memo: result.lunch_memo ?? '',
      dinner_memo: result.dinner_memo ?? '',
      snack_memo: result.snack_memo ?? '',
      updated_at: result.updated_at,
    };

  } catch (e) {
    console.error('❌ getDailyMealMemo error', e);
    return null;
  }
};

/* =========================================
   メモ保存（完全安全版）
========================================= */
export const upsertDailyMealMemo = async (
  uuid: string,
  dutyDate: string,
  memoMap: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  }
) => {
  const db = await getDb();
  const date = normalizeDutyDate(dutyDate);
  const now = new Date().toISOString();

  // ✅ 完全安全化
  const safe = {
    breakfast: memoMap.breakfast ?? '',
    lunch: memoMap.lunch ?? '',
    dinner: memoMap.dinner ?? '',
    snack: memoMap.snack ?? '',
  };

  try {
    const existing = await db.getFirstAsync(
      `
      SELECT id
      FROM daily_meal_memo
      WHERE uuid = ? AND duty_date = ?
      `,
      [uuid, date]
    );

    if (existing) {
      await db.runAsync(
        `
        UPDATE daily_meal_memo
        SET breakfast_memo = ?,
            lunch_memo = ?,
            dinner_memo = ?,
            snack_memo = ?,
            updated_at = ?
        WHERE uuid = ? AND duty_date = ?
        `,
        [
          safe.breakfast,
          safe.lunch,
          safe.dinner,
          safe.snack,
          now,
          uuid,
          date,
        ]
      );
    } else {
      await db.runAsync(
        `
        INSERT INTO daily_meal_memo (
          uuid,
          duty_date,
          breakfast_memo,
          lunch_memo,
          dinner_memo,
          snack_memo,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          uuid,
          date,
          safe.breakfast,
          safe.lunch,
          safe.dinner,
          safe.snack,
          now,
        ]
      );
    }

  } catch (e) {
    console.error('❌ upsertDailyMealMemo error', e);
  }
};