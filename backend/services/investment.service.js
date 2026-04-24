const Investment = require("../models/Investment");

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
    remainingAmount: Math.max(0, remainingAmount)
  };
};

module.exports = { createInvestment, processSell };
