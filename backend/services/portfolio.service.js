const axios = require('axios');
const Investment = require('../models/Investment');
const calcService = require('./calculation.service');

/**
 * Normalizes complex fund categories into a few standard buckets
 * for charting and analysis.
 * @param {string} category - Raw category from MF API
 * @returns {string} - Simplified category (lowercase)
 */
const simplifyCategory = (category) => {
  if (!category) return "other";
  const cat = category.toLowerCase();

  // Index funds
  if (cat.includes("index") || cat.includes("etf")) return "index";

  // Tax saving
  if (cat.includes("tax") || cat.includes("elss")) return "tax-saving";

  // Equity
  if (
    cat.includes("equity") ||
    cat.includes("cap") ||
    cat.includes("sector") ||
    cat.includes("thematic") ||
    cat.includes("focused") ||
    cat.includes("value") ||
    cat.includes("contra") ||
    cat.includes("dividend") ||
    cat.includes("arbitrage") ||
    cat.includes("growth")
  )
    return "equity";

  // Debt & Liquid
  if (
    cat.includes("debt") ||
    cat.includes("income") ||
    cat.includes("liquid") ||
    cat.includes("overnight") ||
    cat.includes("gilt") ||
    cat.includes("bond") ||
    cat.includes("money market") ||
    cat.includes("duration") ||
    cat.includes("psu")
  )
    return "debt";

  // Hybrid
  if (cat.includes("hybrid") || cat.includes("balanced")) return "hybrid";

  return "other";
};

/**
 * Fetches latest NAVs for a list of unique scheme codes.
 * Returns a map of scheme_code -> { nav, fullData }
 * Uses the high-performance /latest endpoint when history isn't needed.
 */
const getLatestNAVs = async (schemeCodes, includeHistory = false) => {
  const navMap = {};
  const fullDataMap = {};

  const promises = schemeCodes.map(async code => {
    try {
      // If history is needed, use the main API, else use /latest for speed.
      const url = includeHistory
        ? `https://api.mfapi.in/mf/${code}`
        : `https://api.mfapi.in/mf/${code}/latest`;

      const response = await axios.get(url);
      if (response.data && response.data.data && response.data.data[0]) {
        navMap[code] = parseFloat(response.data.data[0].nav);
        if (includeHistory) fullDataMap[code] = response.data;
        return { success: true, code };
      }

      return { success: false, code, message: 'Invalid NAV payload' };
    } catch (error) {
      return { success: false, code, message: error.message };
    }
  });

  const results = await Promise.all(promises);
  results.forEach(result => {
    if (!result.success) {
      console.error(`[NAV Fetch Error] for ${result.code}:`, result.message);
    }
  });

  return { navMap, fullDataMap };
};

/**
 * Aggregates user investments and calculates real-time portfolio performance.
 * @param {string} userId - User ID
 * @param {object} options - { includeHistory: boolean }
 * @returns {Promise<object>} - Comprehensive portfolio statistics
 */
const getPortfolioStats = async (userId, options = {}) => {
  // Use .lean() for faster lookup as we convert to object anyway
  const investments = await Investment.find({ userID: userId }).lean();

  if (investments.length === 0) {
    return {
      totalInvested: 0,
      totalCurrentValue: 0,
      totalProfitLoss: 0,
      totalPLPercentage: 0,
      earliestInvestmentDate: new Date(),
      equityValue: 0,
      equityPercentage: 0,
      investments: [],
      aggregatedInvestments: [],
      categoryAllocation: {},
      uniqueCategories: new Set(),
      uniqueAssetClasses: new Set(),
      weightedExpenseRatio: 0,
    };
  }

  const uniqueSchemes = [...new Set(investments.map(inv => inv.scheme_code))];
  const { navMap, fullDataMap } = await getLatestNAVs(uniqueSchemes, options.includeHistory);

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let equityValue = 0;
  let totalExpenseWeight = 0;
  let earliestInvestmentDate = new Date();
  
  const categoryAllocation = {};
  const uniqueCategories = new Set();
  const uniqueAssetClasses = new Set();
  const aggregatedMap = {};

  const processedInvestments = investments.map(inv => {
    const currentNav = navMap[inv.scheme_code] || inv.purchaseNAV;
    const currentValue = inv.units * currentNav;
    const category = simplifyCategory(inv.scheme_category);
    const assetClass = calcService.getAssetClass(inv.scheme_category);

    totalInvested += inv.investedAmount;
    totalCurrentValue += currentValue;

    uniqueCategories.add(category);
    uniqueAssetClasses.add(assetClass);
    categoryAllocation[category] = (categoryAllocation[category] || 0) + currentValue;

    if (category === "equity" || category === "index" || category === "tax-saving") {
      equityValue += currentValue;
    }

    const expenseRatio = inv.expenseRatio || 1.0;
    totalExpenseWeight += currentValue * expenseRatio; // Based on CMV

    const purchaseDate = new Date(inv.purchaseDate);
    if (purchaseDate < earliestInvestmentDate) {
      earliestInvestmentDate = purchaseDate;
    }

    const enrichedInv = {
      ...inv,
      currentNav,
      currentValue,
      category,
      profitLoss: currentValue - inv.investedAmount,
      plPercentage: ((currentValue - inv.investedAmount) / inv.investedAmount) * 100,
    };

    // Grouping logic for UI Position View
    if (!aggregatedMap[inv.scheme_code]) {
      aggregatedMap[inv.scheme_code] = {
        scheme_code: inv.scheme_code,
        scheme_name: inv.scheme_name,
        scheme_category: inv.scheme_category,
        category,
        investedAmount: 0,
        currentValue: 0,
        units: 0,
        purchaseNAV: 0, // Will be weighted average
        currentNav,
      };
    }
    
    const agg = aggregatedMap[inv.scheme_code];
    agg.investedAmount += inv.investedAmount;
    agg.currentValue += currentValue;
    agg.units += inv.units;

    return enrichedInv;
  });

  // Calculate weighted average purchase NAV for aggregated view
  const aggregatedInvestments = Object.values(aggregatedMap).map(agg => {
    agg.purchaseNAV = agg.units > 0 ? agg.investedAmount / agg.units : 0;
    agg.profitLoss = agg.currentValue - agg.investedAmount;
    agg.plPercentage = agg.investedAmount > 0 ? (agg.profitLoss / agg.investedAmount) * 100 : 0;
    return agg;
  });

  const totalProfitLoss = totalCurrentValue - totalInvested;

  return {
    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    totalPLPercentage: totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0,
    earliestInvestmentDate,
    equityValue,
    equityPercentage: totalCurrentValue > 0 ? (equityValue / totalCurrentValue) * 100 : 0,
    investments: processedInvestments,
    aggregatedInvestments,
    categoryAllocation,
    uniqueCategories,
    uniqueAssetClasses,
    weightedExpenseRatio: totalCurrentValue > 0 ? totalExpenseWeight / totalCurrentValue : 0,
    fullDataMap,
  };
};

module.exports = {
  simplifyCategory,
  getPortfolioStats,
};
