export const calculateSIPFutureValue = (monthlyAmount, years, annualRate) => {
  const r = annualRate / 100 / 12;
  const n = years * 12;

  if (r === 0) {
    return {
      invested: monthlyAmount * n,
      futureValue: monthlyAmount * n,
      profit: 0,
    };
  }

  const futureValue = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthlyAmount * n;

  return {
    futureValue,
    invested,
    profit: futureValue - invested,
  };
};
