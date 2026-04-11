import { getDb } from './database';
import { DutyType } from '../types/DutyType';

/**
 * 勤務例外保存
 */
export const setDutyOverride = async (
  uuid: string,
  dutyDate: string,
  dutyType: DutyType
) => {

  const db = await getDb();

  await db.runAsync(
    `
    INSERT INTO duty_overrides
    (uuid, duty_date, duty_type)
    VALUES (?, ?, ?)
    `,
    [uuid, dutyDate, dutyType]
  );

};


/**
 * 勤務例外取得
 */
export const getDutyOverride = async (
  uuid: string,
  dutyDate: string
) => {

  const db = await getDb();

  const result = await db.getFirstAsync<{
    duty_type: DutyType
  }>(
    `
    SELECT duty_type
    FROM duty_overrides
    WHERE uuid = ?
    AND duty_date = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [uuid, dutyDate]
  );

  return result?.duty_type ?? null;

};


/**
 * 勤務例外削除
 */
export const clearDutyOverride = async (
  uuid: string,
  dutyDate: string
) => {

  const db = await getDb();

  await db.runAsync(
    `
    DELETE FROM duty_overrides
    WHERE uuid = ?
    AND duty_date = ?
    `,
    [uuid, dutyDate]
  );

};