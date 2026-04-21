const Investment = require("../models/Investment");
const SIP = require("../models/SIP");
const Goal = require("../models/Goal");
const axios = require("axios");

// ============================================================================
// HELPER: Stress drop assumptions by category
// ============================================================================
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

const getStressDrop = (schemeCategory) => {
  const cat = (schemeCategory || "").toLowerCase();
  for (const [key, val] of Object.entries(STRESS_DROP_MAP)) {
    if (key !== "default" && cat.includes(key)) return val;
  }
  // Broad classification fallback
  if (cat.includes("equity")) return 0.3;
  if (cat.includes("debt") || cat.includes("income")) return 0.05;
  return STRESS_DROP_MAP.default;
};

// ============================================================================
// HELPER: Default expense ratio estimate by category
// ============================================================================
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
  return 1.0; // generic default
};

// ============================================================================
// HELPER: LTCG Tax calculation (portfolio level)
// ============================================================================
const calculateLTCGTax = (totalProfitLoss) => {
  const exemptionLimit = 100000; // ₹1 Lakh per year
  const taxRate = 0.1; // 10%
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

// ============================================================================
// HELPER: Break-even NAV calculation
// ============================================================================
const calculateBreakEvenNAV = (purchaseNAV, schemeCategory, purchaseDate) => {
  const holdingDays =
    (Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24);
  const cat = (schemeCategory || "").toLowerCase();
  // Equity funds held < 365 days → assume 1% exit load
  const exitLoadPct = cat.includes("equity") && holdingDays < 365 ? 1 : 0;
  const breakEvenNAV = purchaseNAV * (1 + exitLoadPct / 100);
  return {
    breakEvenNAV,
    exitLoadPct,
    holdingDays: Math.floor(holdingDays),
  };
};

// ============================================================================
// HELPER: Required SIP calculation (reverse SIP formula)
// ============================================================================
const calculateRequiredSIP = (targetAmount, monthsRemaining, annualRate) => {
  if (monthsRemaining <= 0) return targetAmount; // need it all now
  const r = annualRate / 100 / 12;
  if (r === 0) return targetAmount / monthsRemaining;
  // P = FV × r / [((1+r)^n − 1) × (1+r)]
  const n = monthsRemaining;
  return (targetAmount * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
};

// ============================================================================
// HELPER: Fetch NAVs for scheme codes (shared logic)
// ============================================================================
const fetchNAVMap = async (uniqueSchemeCodes) => {
  const navPromises = uniqueSchemeCodes.map(async (code) => {
    try {
      const response = await axios.get(`https://api.mfapi.in/mf/${code}`);
      const data = response.data;
      return { code, nav: parseFloat(data.data[0].nav), fullData: data };
    } catch (err) {
      return { code, nav: null, fullData: null };
    }
  });
  const results = await Promise.all(navPromises);
  const navMap = {};
  const fullDataMap = {};
  results.forEach((r) => {
    if (r.nav) navMap[r.code] = r.nav;
    if (r.fullData) fullDataMap[r.code] = r.fullData;
  });
  return { navMap, fullDataMap };
};

module.exports = {
  getStressDrop,
  getDefaultExpenseRatio,
  calculateLTCGTax,
  calculateBreakEvenNAV,
  calculateRequiredSIP,
  fetchNAVMap,
};
