import { SalaryConfig } from '../types/SalaryConfig';

type DailySales = {
  normal: number;
  charter: number;
  other: number;
};

export const calculateDailySalary = (
  sales: DailySales,
  config: SalaryConfig
): number => {

  const total =
    (sales.normal || 0) +
    (sales.charter || 0) +
    (sales.other || 0);

  // 歩合計算
  let salary = total * (config.rate / 100);

  // 調整給加算
  salary += config.adjustment || 0;

  // 下限保証（あれば）
  if (config.minimum && salary < config.minimum) {
    salary = config.minimum;
  }

  return Math.floor(salary);
};

// 月額（概算）
export const calculateMonthlySalary = (
  dailySalary: number,
  workingDays: number
): number => {
  return Math.floor(dailySalary * workingDays);
};