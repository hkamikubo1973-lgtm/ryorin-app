// src/utils/pickActionCardMessage.ts
import { ActionCardType } from '../types/actionCard';
import { ACTION_CARD_MESSAGES } from '../constants/actionCardMessages';

export const pickActionCardMessage = (
  type: ActionCardType
): string | null => {
  const list = ACTION_CARD_MESSAGES[type];
  if (!list || list.length === 0) return null;

  const index = Math.floor(Math.random() * list.length);
  return list[index];
};
