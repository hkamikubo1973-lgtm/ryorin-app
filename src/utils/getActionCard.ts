// src/utils/getActionCard.ts
import { ActionCardType } from '../types/actionCard';
import { ActionCardContext } from '../types/actionCardContext';

/**
 * Single Action Card を決定する純関数
 */
export const getActionCardType = (
  ctx: ActionCardContext
): ActionCardType => {
  // ① 食事未入力（最優先）
  if (!ctx.hasMealRecord) {
    return 'MEAL_PENDING';
  }

  // ② 売上未入力
  if (!ctx.hasSalesRecord) {
    return 'SALES_PENDING';
  }

  // ③ 明けの日の体調（肯定）
  if (ctx.duty === 'AKEY' && !ctx.hasHealthRecord) {
    return 'HEALTH_CHECK';
  }

  // ④ 次の出番案内（軽い確認）
  return 'NEXT_DUTY_INFO';
};
