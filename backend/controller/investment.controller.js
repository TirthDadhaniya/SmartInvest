const Investment = require("../models/Investment");
const { createInvestment, processSell } = require("../services/investment.service");
const { createTransaction } = require("../services/transaction.service");

// GET /api/investments/
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userID: req.user._id }).sort({
      scheme_name: 1,
    });
    res.status(200).json({ success: true, data: investments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/investments/
exports.createInvestment = async (req, res) => {
  try {
    const investment = await createInvestment({ userID: req.user._id, ...req.body });
    if (investment?.error) {
      return res.status(400).json({ success: false, message: investment.error });
    }

    await createTransaction({
      userID: req.user._id,
      scheme_code: investment.scheme_code,
      scheme_name: investment.scheme_name,
      type: "buy",
      amount: investment.investedAmount,
      units: investment.units,
      nav: investment.purchaseNAV,
      date: investment.purchaseDate,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Investment created successfully",
        data: investment,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SELL Investment
exports.sellInvestment = async (req, res) => {
  try {
    const { unitsToSell, currentNAV } = req.body;
    const investment = await Investment.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!investment)
      return res.status(404).json({ success: false, message: "Investment not found" });

    const result = await processSell(investment, unitsToSell, currentNAV);
    if (result?.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    await createTransaction({
      userID: req.user._id,
      scheme_code: investment.scheme_code,
      scheme_name: investment.scheme_name,
      type: "sell",
      amount: result.sellAmount,
      units: unitsToSell,
      nav: currentNAV,
      date: new Date(),
      profitLoss: result.profitLoss,
    });

    res.status(200).json({
      success: true,
      message: "Investment updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE investment
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userID: req.user._id,
    });
    if (!investment)
      return res.status(404).json({ success: false, message: "Investment not found" });

    await createTransaction({
      userID: req.user._id,
      scheme_code: investment.scheme_code,
      scheme_name: investment.scheme_name,
      type: "redemption",
      amount: investment.investedAmount,
      units: investment.units,
      nav: investment.purchaseNAV,
      date: new Date(),
    });

    res.status(200).json({ success: true, message: "Investment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
