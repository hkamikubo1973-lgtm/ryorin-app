import { getCycleSettings } from '../database/cycleSettings';
import { resolveCycleDuty } from './dutyResolvers/resolveCycleDuty';
import { resolveManualDuty } from './dutyResolvers/resolveManualDuty';

import { DutyType } from '../types/DutyType';

export const resolveFinalDuty = async (
  uuid: string,
  dutyDate: string
): Promise<DutyType | null> => {

  /* ① 例外優先 */
  const override =
    await resolveManualDuty(uuid, dutyDate);

  if (override) return override;

  /* ② サイクル */

  const settings = await getCycleSettings(uuid);

  if (!settings) return null;

  return resolveCycleDuty(settings, dutyDate);

};