/**
 * Financial calculation and grading utilities for SmartInvest.
 */

/**
 * Normalizes a date to UTC midnight (00:00:00.000)
 * @param {Date|string|number} value - The date value to normalize
 * @returns {Date} Normalized date object
 */
const normalizeToDateOnly = (value) => {
  if (!value) return new Date();
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * Calculates the difference in years between two dates
 * @param {Date|string|number} start - Start date
 * @param {Date|string|number} end - End date (defaults to now)
 * @returns {number} Difference in years (minimum 0.1)
 */
const getYearsBetween = (start, end = new Date()) => {
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0.1, diff);
};

/**
 * Calculates the difference in months between two dates
 * @param {Date|string|number} start - Start date
 * @param {Date|string|number} end - End date (defaults to now)
 * @returns {number} Difference in months (minimum 1)
 */
const getMonthsBetween = (start, end = new Date()) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()));
};

/**
 * Map of scheme categories to their expected maximum drawdown in stress scenarios
 * @type {Object.<string, number>}
 */
const STRESS_DROP_MAP = {
  "small cap": 0.4,
  "mid cap": 0.35,
  "large cap": 0.25,
  "flexi cap": 0.3,
  "multi cap": 0.3,
  "large & mid cap": 0.3,
  elss: 0.3,
  sector: 0.4,
  thematic: 0.35,
  index: 0.25,
  focused: 0.3,
  value: 0.3,
  contra: 0.3,
  "dividend yield": 0.25,
  hybrid: 0.15,
  balanced: 0.15,
  "aggressive hybrid": 0.2,
  "conservative hybrid": 0.1,
  "equity savings": 0.12,
  arbitrage: 0.05,
  debt: 0.05,
  liquid: 0.02,
  overnight: 0.01,
  "ultra short": 0.03,
  "money market": 0.03,
  "short duration": 0.04,
  "medium duration": 0.06,
  "long duration": 0.08,
  gilt: 0.07,
  "credit risk": 0.08,
  "banking & psu": 0.04,
  "corporate bond": 0.05,
  "solution oriented": 0.2,
  default: 0.25,
};

/**
 * Determines the stress test drop percentage based on scheme category
 * @param {string} schemeCategory - The category of the mutual fund scheme
 * @returns {number} The drop percentage as a decimal (e.g., 0.3 for 30%)
 */
const getStressDrop = (schemeCategory) => {
  const cat = (schemeCategory || "").toLowerCase();
  for (const [key, val] of Object.entries(STRESS_DROP_MAP)) {
    if (key !== "default" && cat.includes(key)) return val;
  }
  if (cat.includes("equity")) return 0.3;
  if (cat.includes("debt") || cat.includes("income")) return 0.05;
  return STRESS_DROP_MAP.default;
};

/**
 * Provides a default expense ratio based on scheme category if not provided
 * @param {string} schemeCategory - The category of the mutual fund scheme
 * @returns {number} Estimated expense ratio in percentage
 */
const getDefaultExpenseRatio = (schemeCategory) => {
  const cat = (schemeCategory || "").toLowerCase();
  if (cat.includes("index") || cat.includes("etf")) return 0.2;
  if (cat.includes("liquid") || cat.includes("overnight")) return 0.25;
  if (cat.includes("debt") || cat.includes("income")) return 0.6;
  if (cat.includes("hybrid") || cat.includes("balanced")) return 1.2;
  if (cat.includes("small cap")) return 1.5;
  if (cat.includes("mid cap")) return 1.3;
  if (cat.includes("large cap")) return 0.8;
  if (cat.includes("flexi") || cat.includes("multi")) return 1.1;
  if (cat.includes("elss")) return 1.0;
  if (cat.includes("equity")) return 1.25;
  return 1.0;
};

/**
 * Calculates Long Term Capital Gains (LTCG) tax for equity investments
 * @param {number} totalProfitLoss - Total profit or loss realized
 * @returns {Object} Tax calculation details
 */
const calculateLTCGTax = (totalProfitLoss) => {
  const exemptionLimit = 100000;
  const taxRate = 0.1;
  const taxableAmount = Math.max(0, totalProfitLoss - exemptionLimit);
  const estimatedTax = taxableAmount * taxRate;
  return {
    grossProfit: totalProfitLoss,
    exemptionLimit,
    taxableAmount,
    taxRate,
    estimatedTax,
    netProfitAfterTax: totalProfitLoss - estimatedTax,
  };
};

/**
 * Calculates the break-even NAV considering potential exit loads
 * @param {number} purchaseNAV - The NAV at which units were purchased
 * @param {string} schemeCategory - The category of the mutual fund scheme
 * @param {Date|string} purchaseDate - The date of purchase
 * @returns {Object} Break-even details including NAV and exit load percentage
 */
const calculateBreakEvenNAV = (purchaseNAV, schemeCategory, purchaseDate) => {
  const holdingDays = (Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24);
  const cat = (schemeCategory || "").toLowerCase();
  // Simplified logic: 1% exit load for equity if held < 1 year
  const exitLoadPct = cat.includes("equity") && holdingDays < 365 ? 1 : 0;
  const breakEvenNAV = purchaseNAV * (1 + exitLoadPct / 100);
  return {
    breakEvenNAV,
    exitLoadPct,
    holdingDays: Math.floor(holdingDays),
  };
};

/**
 * Calculates the required monthly SIP to reach a target amount
 * @param {number} targetAmount - The target maturity amount
 * @param {number} monthsRemaining - Number of months to invest
 * @param {number} annualRate - Expected annual return rate in percentage
 * @returns {number} Required monthly SIP amount
 */
const calculateRequiredSIP = (targetAmount, monthsRemaining, annualRate) => {
  if (monthsRemaining <= 0) return targetAmount;
  const r = (annualRate || 12) / 100 / 12;
  if (r === 0) return targetAmount / monthsRemaining;
  const n = monthsRemaining;
  return (targetAmount * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
};

/**
 * Calculates Compound Annual Growth Rate (CAGR)
 * @param {number} invested - Initial invested amount
 * @param {number} current - Current market value
 * @param {number} years - Holding period in years
 * @returns {number} CAGR as a decimal
 */
const calculateCAGR = (invested, current, years) => {
  if (invested <= 0 || years <= 0) return 0.12;
  return Math.pow(current / invested, 1 / Math.max(0.1, years)) - 1;
};

/**
 * Generates a report card grade based on a numerical score
 * @param {number} score - The numerical score (0-100)
 * @returns {string} Letter grade (A+, A, B+, B, C+, C)
 */
const getGrade = (score) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C+";
  return "C";
};

/**
 * Generates a comprehensive portfolio report card based on multiple metrics
 * @param {Object} stats - Portfolio statistics
 * @param {Array} goals - User goals
 * @param {Array} sips - User SIPs
 * @param {string} userRiskPreference - User's risk profile
 * @returns {Object} Graded report card with category breakdowns
 */
const calculateReportCard = (stats, goals, sips, userRiskPreference) => {
  const categories = [];

  // 1. Diversification (Max 30)
  const divScore = Math.min(30, stats.uniqueCategories.size * 7.5);
  categories.push({
    name: "Diversification",
    score: divScore,
    grade: getGrade(divScore * 3.33),
    description: `Found ${stats.uniqueCategories.size} asset categories.`,
  });

  // 2. Cost Efficiency (Max 25)
  // Penalize higher expense ratios
  const costScore = Math.max(0, 25 - (stats.weightedExpenseRatio * 10));
  categories.push({
    name: "Cost Efficiency",
    score: costScore,
    grade: getGrade(costScore * 4),
    description: `Weighted expense ratio is ${stats.weightedExpenseRatio.toFixed(2)}%.`,
  });

  // 3. Goal Alignment (Max 25)
  const goalScore = goals.length > 0 ? 25 : 0;
  categories.push({
    name: "Goal Progress",
    score: goalScore,
    grade: goals.length > 0 ? "A" : "C",
    description: goals.length > 0 ? `${goals.length} goals identified.` : "No goals set.",
  });

  // 4. SIP Consistency (Max 20)
  const activeSips = sips.filter((s) => s.status === "active").length;
  const sipScore = Math.min(20, activeSips * 10);
  categories.push({
    name: "SIP Consistency",
    score: sipScore,
    grade: getGrade(sipScore * 5),
    description: `${activeSips} active SIPs.`,
  });

  const totalScore = divScore + costScore + goalScore + sipScore;

  return {
    overallGrade: getGrade(totalScore),
    portfolioScore: Math.round(totalScore),
    categories,
    summary: {
      totalInvested: Math.round(stats.totalInvested),
      totalCurrentValue: Math.round(stats.totalCurrentValue),
      totalFunds: stats.investments.length,
      activeSIPs: activeSips,
    },
  };
};

module.exports = {
  normalizeToDateOnly,
  getYearsBetween,
  getMonthsBetween,
  getStressDrop,
  getDefaultExpenseRatio,
  calculateLTCGTax,
  calculateBreakEvenNAV,
  calculateRequiredSIP,
  calculateCAGR,
  calculateReportCard,
};
