export const calculateExpectedSalary = (dailyAmount, config) => {
  if (!config || !config.target_days || config.target_days === 0) return 0;

  const dailyThreshold = config.monthly_threshold / config.target_days;

  if (dailyAmount <= dailyThreshold) {
    return dailyAmount * config.low_rate;
  } else {
    const base = dailyThreshold * config.low_rate;
    const extra = (dailyAmount - dailyThreshold) * config.high_rate;
    return base + extra;
  }
};