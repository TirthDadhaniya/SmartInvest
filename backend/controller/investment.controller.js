const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");

// GET Investment
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userID: req.user._id }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: investments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE Investment
exports.createInvestment = async (req, res) => {
  try {
    const {
      scheme_code,
      scheme_name,
      fund_house,
      scheme_type,
      scheme_category,
      investedAmount,
      purchaseNAV,
      purchaseDate,
      type,
    } = req.body;

    const userId = req.user._id;

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
      userID: userId,
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

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      data: investment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SELL Investment
exports.sellInvestment = async (req, res) => {
  try {
    const { unitsToSell, currentNAV } = req.body;

    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: "Investment not found",
      });
    }

    if (!unitsToSell || unitsToSell <= 0) {
      return res.status(400).json({
        success: false,
        message: "Units to sell must be greater than zero",
      });
    }

    if (unitsToSell > investment.units) {
      return res.status(400).json({
        success: false,
        message: "Units to sell cannot be greater than available units",
      });
    }

    // calculate sell amount
    const sellAmount = unitsToSell * currentNAV;

    // calculate original invested amount for sold units
    const originalAmount = unitsToSell * investment.purchaseNAV;

    //calculate profit/loss
    const profitLoss = sellAmount - originalAmount;

    // calculate remaining units and amount
    const remainingUnits = investment.units - unitsToSell;

    // update invested amount based on remaining units
    const remainingAmount = remainingUnits * investment.purchaseNAV;

    // delete investment if all units are sold
    if (remainingUnits <= 0) {
      await investment.deleteOne();
    } else {
      investment.units = remainingUnits;
      investment.investedAmount = remainingAmount;

      await investment.save();

      res.status(200).json({
        success: true,
        message: "Investment updated successfully",
        data: {
          soldUnits: unitsToSell,
          sellAmount,
          profitLoss,
          remainingUnits,
          updatedInvestedAmount: remainingUnits > 0 ? remainingAmount : 0,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE investment
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: "Investment not found",
      });
    }

    // Check ownership
    if (investment.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await investment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Investment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
