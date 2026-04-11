// src/types/actionCardContext.ts
import { DutyType } from './duty';

export interface ActionCardContext {
  duty: DutyType;

  /** 今日の売上入力済みか */
  hasSalesRecord: boolean;

  /** 今日の食事入力済みか */
  hasMealRecord: boolean;

  /** 明けの日の体調入力済みか */
  hasHealthRecord: boolean;
}
