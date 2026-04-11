import { getDb } from './database';
import { DutyType } from '../types/DutyType';

export type CycleSettingsRow = {
  uuid: string;
  base_date: string;
  pattern_json: string;
  cycle_offset?: number;
};

export const saveCycleSettings = async (
  uuid: string,
  baseDate: string,
  pattern: DutyType[]
) => {

  const db = await getDb();

  await db.runAsync(
    `
    INSERT OR REPLACE INTO cycle_settings
    (uuid, base_date, pattern_json, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    `,
    [
      uuid,
      baseDate,
      JSON.stringify(pattern)
    ]
  );

};

export const getCycleSettings = async (
  uuid: string
): Promise<CycleSettingsRow | null> => {

  const db = await getDb();

  const row = await db.getFirstAsync<CycleSettingsRow>(
    `
    SELECT *
    FROM cycle_settings
    WHERE uuid = ?
    `,
    [uuid]
  );

  return row ?? null;

};