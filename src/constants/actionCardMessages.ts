// src/constants/actionCardMessages.ts
/**
 * ============================================
 * 🎴 Action Card Messages
 * Ver.3.3.9（非監視・非催促 強化版）
 *
 * 原則：
 * ・命令しない
 * ・催促しない
 * ・25文字前後
 * ・乗務の区切りに寄り添う
 * ============================================
 */

import { ActionCardType } from '../types/actionCard';

export const ACTION_CARD_MESSAGES: Record<ActionCardType, string[]> = {
  SALES_PENDING: [
    '今日の売上、メモだけ残す？',
    'まだなら、サクッと入力しとく？',
  ],

  MEAL_PENDING: [
    '一日お疲れ様でした。今日のご飯を一枚。',
  ],

  HEALTH_CHECK: [
    '体調どう？ひとことだけでも。',
  ],

  NEXT_DUTY: [
    '次の出番、軽く確認しとく？',
  ],
};
