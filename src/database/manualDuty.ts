import { getDb } from './database';
import { DutyType } from '../types/DutyType';

export const getManualDuty = async (
  uuid: string,
  dutyDate: string
) => {

  const db = await getDb();

  const result = await db.getFirstAsync<{
    duty_type: DutyType
  }>(`
    SELECT duty_type
    FROM manual_duty_records
    WHERE uuid = ?
    AND duty_date = ?
  `, [uuid, dutyDate]);

  return result ?? null;

};


export const setManualDuty = async (
  uuid: string,
  dutyDate: string,
  dutyType: DutyType
) => {

  const db = await getDb();

  await db.runAsync(`
    INSERT OR REPLACE INTO manual_duty_records
    (uuid, duty_date, duty_type)
    VALUES (?, ?, ?)
  `, [uuid, dutyDate, dutyType]);

};


export const deleteManualDuty = async (
  uuid: string,
  dutyDate: string
) => {

  const db = await getDb();

  await db.runAsync(`
    DELETE FROM manual_duty_records
    WHERE uuid = ?
    AND duty_date = ?
  `, [uuid, dutyDate]);

};