// src/utils/getTodayInputStatus.ts

import { getDb } from '../database/database';
import { getTodayDuty } from './getTodayDuty';

export type TodayInputStatus = {
  hasSalesRecord: boolean;
  hasMealRecord: boolean;
  hasHealthRecord: boolean;
};

export const getTodayInputStatus = async (): Promise<TodayInputStatus> => {
  const db = await getDb();
  const { date: dutyDate } = getTodayDuty();

  const sales = await db.getFirstAsync<{ count: number }>(
    `
    SELECT COUNT(*) as count
    FROM daily_records
    WHERE duty_date = ?
    `,
    [dutyDate]
  );

  const meals = await db.getFirstAsync<{ count: number }>(
    `
    SELECT COUNT(*) as count
    FROM meal_records
    WHERE duty_date = ?
    `,
    [dutyDate]
  );

  // Phase2では健康は未実装 → 常に false
  return {
    hasSalesRecord: (sales?.count ?? 0) > 0,
    hasMealRecord: (meals?.count ?? 0) > 0,
    hasHealthRecord: false,
  };
};
