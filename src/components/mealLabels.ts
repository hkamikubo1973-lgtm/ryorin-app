// src/components/mealLabels.ts

export const MEAL_LABEL_JP = {
  rice: 'ごはん・丼',
  noodle: '麺類',
  light: '軽食・パン',
  healthy: '定食',
  supplement: '補給のみ',
  skip: '抜き',
} as const;

export type MealLabelJP = keyof typeof MEAL_LABEL_JP;
