const Investment = require("../models/Investment");

/**
 * Creates a new investment record in the database
 * @param {Object} data - Investment data
 * @param {string} data.userID - ID of the user owning the investment
 * @param {string} data.scheme_code - Mutual fund scheme code
 * @param {string} data.scheme_name - Name of the scheme
 * @param {string} data.fund_house - Name of the fund house
 * @param {string} data.scheme_type - Type of scheme (e.g., Open Ended)
 * @param {string} data.scheme_category - Category of scheme (e.g., Large Cap)
 * @param {number} data.investedAmount - Amount invested
 * @param {number} data.purchaseNAV - NAV at the time of purchase
 * @param {Date|string} data.purchaseDate - Date of purchase
 * @param {string} [data.type='lumpsum'] - Type of investment (lumpsum or sip)
 * @param {number} [data.expenseRatio=0] - Expense ratio of the fund
 * @returns {Promise<Object>} The created investment or an error object
 */
const createInvestment = async (data) => {
  const {
    userID,
    scheme_code,
    scheme_name,
    fund_house,
    scheme_type,
    scheme_category,
    investedAmount,
    purchaseNAV,
    purchaseDate,
    type,
    expenseRatio,
  } = data;

  if (!scheme_code || !scheme_name || !scheme_category || !investedAmount || !purchaseNAV || !purchaseDate) {
    return { error: "Missing required fields for investment", statusCode: 400 };
  }

  const units = investedAmount / purchaseNAV;

  const investment = await Investment.create({
    userID,
    scheme_code,
    scheme_name,
    fund_house,
    scheme_type,
    scheme_category,
    investedAmount,
    units,
    purchaseNAV,
    purchaseDate,
    type: type || "lumpsum",
    expenseRatio: expenseRatio || 0,
  });

  return investment;
};

/**
 * Processes the sale of units from an investment
 * @param {Object} investment - The Mongoose investment document
 * @param {number} unitsToSell - Number of units to sell
 * @param {number} currentNAV - Current NAV at the time of sale
 * @returns {Promise<Object>} Sale results including amounts and remaining units
 */
const processSell = async (investment, unitsToSell, currentNAV) => {
  if (!unitsToSell || unitsToSell <= 0) {
    return { error: "Units to sell must be greater than zero", statusCode: 400 };
  }

  if (unitsToSell > investment.units) {
    return { error: "Units to sell cannot be greater than available units", statusCode: 400 };
  }

  const sellAmount = unitsToSell * currentNAV;
  const originalAmount = unitsToSell * investment.purchaseNAV;
  const profitLoss = sellAmount - originalAmount;

  const remainingUnits = investment.units - unitsToSell;
  const remainingAmount = remainingUnits * investment.purchaseNAV;

  if (remainingUnits <= 0) {
    await investment.deleteOne();
  } else {
    investment.units = remainingUnits;
    investment.investedAmount = remainingAmount;
    await investment.save();
  }

  return {
    sellAmount,
    profitLoss,
    remainingUnits,
    remainingAmount: Math.max(0, remainingAmount),
  };
};

module.exports = {
  createInvestment,
  processSell,
};
