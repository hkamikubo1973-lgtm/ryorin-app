// src/utils/resolveDuty.ts

import { DutyType } from '../types/DutyType';

/**
 * 最終勤務を決定
 * 優先順位：override > cycle
 */
export const resolveDuty = (
  cycleDuty: DutyType | null,
  overrideDuty: DutyType | null
): DutyType | null => {

  // 手動修正が最優先
  if (overrideDuty) return overrideDuty;

  // なければサイクル
  return cycleDuty;
};