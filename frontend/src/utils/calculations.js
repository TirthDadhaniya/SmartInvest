export const calculateUnits = (amount, nav) => {
  if (!nav) return 0;
  return amount / nav;
};

export const calculateCurrentValue = (units, currentNAV) => {
  return units * currentNAV;
};

export const calculateProfitLoss = (currentValue, investedAmount) => {
  return currentValue - investedAmount;
};

export const calculateReturnPercent = (profitLoss, investedAmount) => {
  if (!investedAmount) return 0;
  return (profitLoss / investedAmount) * 100;
};

export const calculateSIPFutureValue = (monthlyAmount, years, annualRate) => {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return { invested: monthlyAmount * n, futureValue: monthlyAmount * n, profit: 0 };
  const futureValue = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthlyAmount * n;
  return { futureValue, invested, profit: futureValue - invested };
};

export const calculateLumpsumFutureValue = (amount, years, annualRate) => {
  const r = annualRate / 100;
  return amount * Math.pow(1 + r, years);
};

export const calculateRequiredSIP = (targetAmount, months, annualRate) => {
  const r = annualRate / 100 / 12;
  if(r === 0) return targetAmount / months;
  return targetAmount / (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
};

export const calculateHistoricalReturn = (currentNAV, historicalNAV) => {
  if (!historicalNAV) return 0;
  return ((currentNAV - historicalNAV) / historicalNAV) * 100;
};

export const estimateLTCGTax = (totalProfit) => {
  const exemptionLimit = 100000;
  if (totalProfit <= exemptionLimit) return 0;
  return (totalProfit - exemptionLimit) * 0.10;
};

export const calculateHealthScore = (investments, sips, goals, user) => {
  let score = 50; // base score
  if (investments?.length > 0) score += 15;
  if (sips?.length > 0) score += 20;
  if (goals?.length > 0) score += 15;
  if (user?.riskPreference) score += 5;
  return Math.min(100, score);
};
