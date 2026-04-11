import { resolveFinalDuty } from './resolveFinalDuty';
import { DutyType } from '../types/DutyType';

export const getDutyType = async (
  uuid: string,
  targetDate: string
): Promise<DutyType | null> => {

  return resolveFinalDuty(uuid, targetDate);

};