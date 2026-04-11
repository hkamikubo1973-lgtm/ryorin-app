import { DutyType } from '../../types/DutyType';

/**
 * サイクル設定型
 */
type CycleSettings = {
  base_date: string;
  pattern_json: string;
  cycle_offset?: number;
};

/**
 * サイクルから勤務種別を解決
 */
export const resolveCycleDuty = (
  settings: CycleSettings,
  targetDate: string
): DutyType | null => {

  try {

    const baseDate = new Date(settings.base_date);
    const date = new Date(targetDate);

    const diffDays = Math.floor(
      (date.getTime() - baseDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const pattern: DutyType[] =
      JSON.parse(settings.pattern_json);

    if (!pattern || pattern.length === 0) {
      return null;
    }

    const offset = settings.cycle_offset ?? 0;

    const index =
      (((diffDays + offset) % pattern.length) +
        pattern.length) %
      pattern.length;

    return pattern[index] ?? null;

  } catch (error) {

    console.error(
      'resolveCycleDuty error',
      error
    );

    return null;

  }

};