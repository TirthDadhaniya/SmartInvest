const Investment = require("../models/Investment");
const axios = require("axios");
const { simplifyCategory } = require("../services/portfolio.service");

exports.summary = async (req, res) => {
  try {
    const investments = await Investment.find({ userID: req.user._id });

    let totalInvested = 0;
    let totalCurrentValue = 0;

    const currentValues = await Promise.all(
      investments.map(async (inv) => {
        const response = await axios.get(
          `https://api.mfapi.in/mf/${inv.scheme_code}/latest`,
        );

        const currentNav = parseFloat(response.data.data[0].nav);

        const currentValue = currentNav * inv.units;
        const unrealizedPL = currentValue - inv.investedAmount;
        const plPercentage = (unrealizedPL / inv.investedAmount) * 100;

        totalInvested += inv.investedAmount;
        totalCurrentValue += currentValue;

        return {
          currentValue: currentValue.toFixed(2),
          unrealizedPL: unrealizedPL.toFixed(2),
          plPercentage: plPercentage.toFixed(2) + "%",
          category: simplifyCategory(inv.category),
        };
      }),
    );

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalPLPercentage = (totalProfitLoss / totalInvested) * 100;

    // portfolio health

    //asset allocation
    // assest allocation percentage - with amount
    // next SIP reminder

    // last 5 transactions

    res.status(200).json({
      success: true,
      data: {
        totalInvested: totalInvested.toFixed(2),
        totalCurrentValue: totalCurrentValue.toFixed(2),
        totalProfitLoss: totalProfitLoss.toFixed(2),
        totalPLPercentage: totalPLPercentage.toFixed(2) + "%",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
