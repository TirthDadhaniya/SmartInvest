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
 * Asset class constants for classification.
 * Standardized to lowercase across the application.
 */
const ASSET_CLASSES = {
  EQUITY: "equity",
  DEBT: "debt",
  HYBRID: "hybrid",
  LIQUID: "liquid",
  OTHER: "other",
};

/**
 * Rates based on Indian financial regulations (2024-2026).
 */
const STAMP_DUTY_RATE = 0.00005; // 0.005% since July 2020
const STT_RATE = 0.00001; // 0.001% Securities Transaction Tax for equity sell

const TAX_RULES = {
  EQUITY: {
    LTCG_RATE: 0.125, // 12.5% after Budget 2024
    STCG_RATE: 0.20,  // 20% after Budget 2024
    EXEMPTION: 125000, // 1.25 Lakh exemption for LTCG
    MIN_DAYS_FOR_LTCG: 365,
  },
  DEBT: {
    RATE: 0.30, // Taxed at slab rate (estimating 30%)
  }
};

/**
 * Normalizes complex fund categories into standard asset classes.
 * @param {string} schemeCategory - The category of the mutual fund scheme
 * @returns {string} One of ASSET_CLASSES
 */
const getAssetClass = (schemeCategory) => {
  const cat = (schemeCategory || "").toLowerCase();

  if (cat.includes("liquid") || cat.includes("overnight")) return ASSET_CLASSES.LIQUID;

  if (
    cat.includes("debt") ||
    cat.includes("income") ||
    cat.includes("gilt") ||
    cat.includes("bond") ||
    cat.includes("money market") ||
    cat.includes("duration") ||
    cat.includes("psu") ||
    cat.includes("short term") ||
    cat.includes("ultra short")
  )
    return ASSET_CLASSES.DEBT;

  if (
    cat.includes("equity") ||
    cat.includes("cap") ||
    cat.includes("elss") ||
    cat.includes("sector") ||
    cat.includes("thematic") ||
    cat.includes("index") ||
    cat.includes("focused") ||
    cat.includes("value") ||
    cat.includes("contra") ||
    cat.includes("dividend") ||
    cat.includes("arbitrage") ||
    cat.includes("growth")
  )
    return ASSET_CLASSES.EQUITY;

  if (cat.includes("hybrid") || cat.includes("balanced")) return ASSET_CLASSES.HYBRID;

  return ASSET_CLASSES.OTHER;
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

  const assetClass = getAssetClass(schemeCategory);
  if (assetClass === ASSET_CLASSES.EQUITY) return 0.3;
  if (assetClass === ASSET_CLASSES.DEBT || assetClass === ASSET_CLASSES.LIQUID) return 0.05;
  if (assetClass === ASSET_CLASSES.HYBRID) return 0.15;

  return STRESS_DROP_MAP.default;
};

/**
 * Provides a default expense ratio based on scheme category if not provided
 * @param {string} schemeCategory - The category of the mutual fund scheme
 * @returns {number} Estimated expense ratio in percentage
 */
const getDefaultExpenseRatio = (schemeCategory) => {
  const cat = (schemeCategory || "").toLowerCase();
  const assetClass = getAssetClass(schemeCategory);

  if (cat.includes("index") || cat.includes("etf")) return 0.2;
  if (assetClass === ASSET_CLASSES.LIQUID) return 0.25;
  if (assetClass === ASSET_CLASSES.DEBT) return 0.6;
  if (assetClass === ASSET_CLASSES.HYBRID) return 1.2;

  if (cat.includes("small cap")) return 1.5;
  if (cat.includes("mid cap")) return 1.3;
  if (cat.includes("large cap")) return 0.8;
  if (cat.includes("flexi") || cat.includes("multi")) return 1.1;
  if (cat.includes("elss")) return 1.0;

  if (assetClass === ASSET_CLASSES.EQUITY) return 1.25;
  return 1.0;
};

/**
 * Calculates comprehensive tax estimates for a portfolio.
 * Handles Equity (LTCG/STCG) and Debt (Slab rate).
 * 
 * @param {Array} investments - Array of processed investments with profitLoss, scheme_category, and purchaseDate
 * @returns {Object} Tax breakdown and total estimates
 */
const calculateTaxEstimates = (investments) => {
  let totalEquityLTCGProfit = 0;
  let totalEquitySTCGProfit = 0;
  let totalDebtProfit = 0;

  const investmentDetails = investments.map((inv) => {
    const assetClass = getAssetClass(inv.scheme_category);
    const holdingDays = (Date.now() - new Date(inv.purchaseDate).getTime()) / (1000 * 60 * 60 * 24);
    const profit = inv.profitLoss || 0;
    
    let taxType = "NONE";
    let estTax = 0;

    if (profit > 0) {
      if (assetClass === ASSET_CLASSES.EQUITY || (inv.scheme_category || "").toLowerCase().includes("aggressive hybrid")) {
        if (holdingDays > TAX_RULES.EQUITY.MIN_DAYS_FOR_LTCG) {
          taxType = "EQUITY_LTCG";
          totalEquityLTCGProfit += profit;
        } else {
          taxType = "EQUITY_STCG";
          estTax = profit * TAX_RULES.EQUITY.STCG_RATE;
          totalEquitySTCGProfit += profit;
        }
      } else {
        // Debt, Liquid, etc. taxed at slab rate regardless of period
        taxType = "DEBT_SLAB";
        estTax = profit * TAX_RULES.DEBT.RATE;
        totalDebtProfit += profit;
      }
    }

    return {
      ...inv,
      taxType,
      holdingDays: Math.floor(holdingDays),
      estTaxBeforeExemption: estTax, 
    };
  });

  // Calculate final LTCG tax after applying exemption
  const taxableLTCGAmount = Math.max(0, totalEquityLTCGProfit - TAX_RULES.EQUITY.EXEMPTION);
  const totalLTCGTax = taxableLTCGAmount * TAX_RULES.EQUITY.LTCG_RATE;
  
  // Distribute LTCG tax proportionally among LTCG investments for display
  const finalInvestments = investmentDetails.map((inv) => {
    let finalTax = inv.estTaxBeforeExemption;
    if (inv.taxType === "EQUITY_LTCG" && totalEquityLTCGProfit > 0) {
      finalTax = (inv.profitLoss / totalEquityLTCGProfit) * totalLTCGTax;
    }
    return {
      ...inv,
      estimatedTax: finalTax,
      afterTaxProfit: inv.profitLoss - finalTax,
    };
  });

  const totalSTCGTax = totalEquitySTCGProfit * TAX_RULES.EQUITY.STCG_RATE;
  const totalDebtTax = totalDebtProfit * TAX_RULES.DEBT.RATE;
  const totalEstimatedTax = totalLTCGTax + totalSTCGTax + totalDebtTax;

  return {
    summary: {
      totalProfit: totalEquityLTCGProfit + totalEquitySTCGProfit + totalDebtProfit,
      equityLTCGProfit: totalEquityLTCGProfit,
      equitySTCGProfit: totalEquitySTCGProfit,
      debtProfit: totalDebtProfit,
      ltcgExemption: TAX_RULES.EQUITY.EXEMPTION,
      estimatedLTCGTax: totalLTCGTax,
      estimatedSTCGTax: totalSTCGTax,
      estimatedDebtTax: totalDebtTax,
      totalTax: totalEstimatedTax,
    },
    investments: finalInvestments,
  };
};

/**
 * Calculates the break-even NAV considering potential exit loads, stamp duty, and STT.
 * Professional Formula: Break-Even NAV = Purchase NAV / ((1 - Stamp Duty) * (1 - Exit Load) * (1 - STT))
 *
 * @param {number} purchaseNAV - The NAV at which units were purchased
 * @param {string} schemeCategory - The category of the mutual fund scheme
 * @param {Date|string} purchaseDate - The date of purchase
 * @returns {Object} Break-even details including NAV and exit load percentage
 */
const calculateBreakEvenNAV = (purchaseNAV, schemeCategory, purchaseDate) => {
  const holdingDays = (Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24);
  const assetClass = getAssetClass(schemeCategory);
  const cat = (schemeCategory || "").toLowerCase();

  let exitLoadPct = 0;
  let appliesSTT = false;

  // 1. Equity & Equity-heavy Hybrids (1% load for 1 year, STT applies)
  if (assetClass === ASSET_CLASSES.EQUITY || cat.includes("aggressive hybrid")) {
    exitLoadPct = holdingDays < 365 ? 1.0 : 0;
    appliesSTT = true;
  }
  // 2. Liquid Funds (Graded exit load for first 7 days)
  else if (assetClass === ASSET_CLASSES.LIQUID) {
    if (holdingDays < 1) exitLoadPct = 0.007;
    else if (holdingDays < 2) exitLoadPct = 0.0065;
    else if (holdingDays < 3) exitLoadPct = 0.006;
    else if (holdingDays < 4) exitLoadPct = 0.0055;
    else if (holdingDays < 5) exitLoadPct = 0.005;
    else if (holdingDays < 6) exitLoadPct = 0.0045;
    else exitLoadPct = 0;
  }
  // 3. Debt Funds (Typical 0.5% load for 30 days)
  else if (assetClass === ASSET_CLASSES.DEBT) {
    // Ultra-short and Money Market usually have 0 load
    if (!cat.includes("ultra short") && !cat.includes("money market")) {
      exitLoadPct = holdingDays < 30 ? 0.5 : 0;
    }
  }
  // 4. Other Hybrids
  else if (assetClass === ASSET_CLASSES.HYBRID) {
    exitLoadPct = holdingDays < 365 ? 1.0 : 0;
  }

  const exitLoad = exitLoadPct / 100;
  const stt = appliesSTT ? STT_RATE : 0;

  // Apply the professional break-even formula
  const breakEvenNAV = purchaseNAV / ((1 - STAMP_DUTY_RATE) * (1 - exitLoad) * (1 - stt));

  return {
    breakEvenNAV: Number(breakEvenNAV.toFixed(4)),
    exitLoadPct,
    holdingDays: Math.floor(holdingDays),
    assetClass,
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
  getAssetClass,
  getStressDrop,
  getDefaultExpenseRatio,
  calculateTaxEstimates,
  calculateBreakEvenNAV,
  calculateRequiredSIP,
  calculateCAGR,
  calculateReportCard,
};
