export const calculateDailySalary = (sales: number, config: any) => {
  const total = Number(sales) || 0

  const lowRate = Number(config.low_rate) || 0
  const highRate = Number(config.high_rate) || 0
  const threshold = Number(config.monthly_threshold) || 0

  if (total >= threshold) {
    return Math.floor(total * highRate)
  }

  return Math.floor(total * lowRate)
}


export const calculateMonthlySalary = (sales: number, config: any) => {
  const total = Number(sales) || 0

  const lowRate = Number(config.low_rate) || 0
  const highRate = Number(config.high_rate) || 0
  const threshold = Number(config.monthly_threshold) || 0

  if (total >= threshold) {
    return Math.floor(total * highRate)
  }

  return Math.floor(total * lowRate)
}
