// src/utils/dutyCycle.ts

/* =========
   型定義
========= */

export type DutyType = 'work' | 'after' | 'off' | string;

export type DutyCycleSettings = {
  cycleStartDate: string; // YYYY-MM-DD
  dutyCycle: DutyType[];  // ["work","after","off",...]
};

/* =========
   日付ユーティリティ
========= */

const toDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const diffDays = (a: Date, b: Date) => {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

/* =========
   勤務種別を算出
========= */

export const getDutyTypeByDate = (
  targetDate: string,
  settings: DutyCycleSettings
): DutyType => {
  const base = toDate(settings.cycleStartDate);
  const target = toDate(targetDate);

  const days = diffDays(target, base);
  const len = settings.dutyCycle.length;

  const index = ((days % len) + len) % len; // マイナス対策
  return settings.dutyCycle[index];
};

/* =========
   duty_date を算出
   ・work / after → 出庫日（workの日）
   ・off → 自分自身
========= */

export const getDutyDateByDate = (
  targetDate: string,
  settings: DutyCycleSettings
): string => {
  const dutyType = getDutyTypeByDate(targetDate, settings);

  // 出庫日そのもの
  if (dutyType === 'work') return targetDate;

  // 明け（after）は直前の work を探す
  if (dutyType === 'after') {
    let cursor = toDate(targetDate);

    for (let i = 1; i <= settings.dutyCycle.length; i++) {
      cursor.setDate(cursor.getDate() - 1);
      const d = cursor.toISOString().slice(0, 10);

      if (
        getDutyTypeByDate(d, settings) === 'work'
      ) {
        return d;
      }
    }
  }

  // 公休・その他はその日自身
  return targetDate;
};
