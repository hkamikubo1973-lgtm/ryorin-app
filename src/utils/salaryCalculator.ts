export const calculateDailySalary = (sales: number, config: any) => {

  const total = Number(sales) || 0
  const threshold = Number(config.monthly_threshold) || 0
  const lowRate = Number(config.low_rate) || 0
  const highRate = Number(config.high_rate) || 0
  const adjustment = Number(config.adjustment) || 0

  // 足切り部分
  const base = Math.min(total, threshold) * lowRate

  // 超過部分
  const extra = Math.max(0, total - threshold) * highRate

  return Math.floor(base + extra + adjustment)
}