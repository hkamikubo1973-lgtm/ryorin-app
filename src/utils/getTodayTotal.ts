// src/utils/getTodayTotal.ts
import { getDb } from '../database/database';

export const getTodayTotal = async (
  uuid: string,
  dutyDate: string
): Promise<number> => {
  const db = await getDb();

  const rows: any[] = await db.getAllAsync(
    `
    SELECT 
      SUM(sales) AS total
    FROM daily_records
    WHERE uuid = ?
      AND duty_date = ?
    `,
    [uuid, dutyDate]
  );

  const total = rows?.[0]?.total;

  return typeof total === 'number' ? total : 0;
};
