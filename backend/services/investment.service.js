const Investment = require("../models/Investment");

const createInvestment = async ({
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
}) => {
  if (
    !scheme_code ||
    !scheme_name ||
    !scheme_category ||
    !investedAmount ||
    !purchaseNAV ||
    !purchaseDate
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
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
    type,
  });

  return investment;
};

module.exports = { createInvestment };
