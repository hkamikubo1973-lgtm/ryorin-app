export function getTodayDuty(state?: {
  baseDate: string | null;
  standardCycle?: number;
  targetDate?: string;
}) {
  if (!state?.baseDate) {
    // 初期起動・未設定時の安全弁
    return new Date().toISOString().slice(0, 10);
  }

  const base = new Date(state.baseDate);
  return base.toISOString().slice(0, 10);
}
