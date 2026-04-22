const axios = require("axios");
const Investment = require("../models/Investment");

const simplifyCategory = (category) => {
  if (!category) return "Other";
  const cat = category.toLowerCase();
  if (cat.includes("equity") || cat.includes("growth")) return "equity";
  if (cat.includes("debt") || cat.includes("income") || cat.includes("liquid"))
    return "debt";
  if (cat.includes("hybrid") || cat.includes("balanced")) return "hybrid";
  if (cat.includes("index") || cat.includes("etf")) return "index";
  if (cat.includes("tax") || cat.includes("elss")) return "tax-saving";
  return "other";
};

/**
 * Fetches latest NAVs for a list of unique scheme codes.
 * Returns a map of scheme_code -> { nav, fullData }
 */
const getLatestNAVs = async (schemeCodes, includeHistory = false) => {
  const navMap = {};
  const fullDataMap = {};
  const promises = schemeCodes.map(async (code) => {
    try {
      // If history is needed, use the main API, else use /latest for speed
      const url = includeHistory
        ? `https://api.mfapi.in/mf/${code}`
        : `https://api.mfapi.in/mf/${code}/latest`;

      const response = await axios.get(url);
      if (response.data && response.data.data && response.data.data[0]) {
        navMap[code] = parseFloat(response.data.data[0].nav);
        if (includeHistory) fullDataMap[code] = response.data;
      }
    } catch (error) {
      console.error(`Error fetching NAV for ${code}:`, error.message);
    }
  });

  await Promise.all(promises);
  return { navMap, fullDataMap };
};

/**
 * Gets core portfolio statistics for a user.
 */
const getPortfolioStats = async (userId, options = {}) => {
  const investments = await Investment.find({ userID: userId });

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
      categoryAllocation: {},
      uniqueCategories: new Set(),
      weightedExpenseRatio: 0,
    };
  }

  const uniqueSchemes = [...new Set(investments.map((inv) => inv.scheme_code))];
  const { navMap, fullDataMap } = await getLatestNAVs(
    uniqueSchemes,
    options.includeHistory,
  );

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let equityValue = 0;
  let totalExpenseWeight = 0;
  let earliestInvestmentDate = new Date();
  const categoryAllocation = {};
  const uniqueCategories = new Set();

  const processedInvestments = investments.map((inv) => {
    const currentNav = navMap[inv.scheme_code] || inv.purchaseNAV;
    const currentValue = inv.units * currentNav;
    const category = simplifyCategory(inv.scheme_category);

    totalInvested += inv.investedAmount;
    totalCurrentValue += currentValue;

    uniqueCategories.add(category);
    categoryAllocation[category] = (categoryAllocation[category] || 0) + currentValue;

    if (category === "equity" || category === "index") {
      equityValue += currentValue;
    }

    const expenseRatio = inv.expenseRatio || 1.0;
    totalExpenseWeight += inv.investedAmount * expenseRatio;

    const purchaseDate = new Date(inv.purchaseDate);
    if (purchaseDate < earliestInvestmentDate) {
      earliestInvestmentDate = purchaseDate;
    }

    return {
      ...inv.toObject(),
      currentNav,
      currentValue,
      category,
      profitLoss: currentValue - inv.investedAmount,
      plPercentage: ((currentValue - inv.investedAmount) / inv.investedAmount) * 100,
    };
  });

  const totalProfitLoss = totalCurrentValue - totalInvested;

  return {
    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    totalPLPercentage: (totalProfitLoss / totalInvested) * 100,
    earliestInvestmentDate,
    equityValue,
    equityPercentage: (equityValue / totalCurrentValue) * 100,
    investments: processedInvestments,
    categoryAllocation,
    uniqueCategories,
    weightedExpenseRatio: totalExpenseWeight / totalInvested,
    fullDataMap, // Only populated if includeHistory is true
  };
};

module.exports = {
  simplifyCategory,
  getPortfolioStats,
  getLatestNAVs,
};
