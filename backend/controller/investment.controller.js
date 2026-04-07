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

// GET BY ID
exports.getInvestmentbyid = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE investment
exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Investment updated",
      data: investment,
    });
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
    const investment = await Investment.findByIdAndDelete(req.params.id);
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
