const Investment = require("../models/Investment");

// CREATE Investment
exports.createInvestment = async (req, res) => {
  try {
    const investment = await Investment.create(req.body);
    res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {}
};

// GET Investment
exports.getInvestment = async (req, res) => {
  try {
    const investments = await Investment.find();
    res.status(200).json({
      success: true,
      data: investments,
    });
  } catch (error) {}
};

// GET BY ID
exports.getInvestmentbyid = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {}
};

// UPDATE investment
exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: investment,
    });
  } catch (error) {}
};

// DELETE investment
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Investment deleted successfully",
    });
  } catch (error) {}
};
