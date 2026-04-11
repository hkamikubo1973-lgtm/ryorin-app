import { getDutyOverride } from '../../database/dutyOverride';
import { DutyType } from '../../types/DutyType';

export const resolveManualDuty = async (
  uuid: string,
  dutyDate: string
): Promise<DutyType | null> => {

  const duty = await getDutyOverride(uuid, dutyDate);

  return duty ?? null;

};