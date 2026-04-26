const Investment = require("../models/Investment");
const { createInvestment, processSell } = require("../services/investment.service");
const { createTransaction } = require("../services/transaction.service");

const getPagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * Retrieves all investments for the logged-in user.
 * GET /api/investments/
 */
exports.getInvestments = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { userID: req.user._id };

    const [investments, total] = await Promise.all([
      Investment.find(filter).sort({ scheme_name: 1 }).skip(skip).limit(limit).lean(),
      Investment.countDocuments(filter),
    ]);
    
    res.status(200).json({
      success: true,
      data: investments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Creates a new investment record and logs a buy transaction.
 * POST /api/investments/
 */
exports.createInvestment = async (req, res) => {
  try {
    const investment = await createInvestment({ userID: req.user._id, ...req.body });

    if (investment?.error) {
      return res.status(400).json({
        success: false,
        message: investment.error,
      });
    }

    // Register transaction event
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

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      data: investment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Adds more units to an existing investment.
 * Recalculates weighted average purchase NAV.
 * POST /api/investments/:id/buy-more
 */
exports.buyMoreInvestment = async (req, res) => {
  try {
    const { investedAmount, purchaseNAV, purchaseDate } = req.body;
    const explicitUnits = Number(req.body.units || 0);

    const investment = await Investment.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!investment) {
      return res.status(404).json({ success: false, message: "Investment not found" });
    }

    const amount = Number(investedAmount || 0);
    const nav = Number(purchaseNAV || 0);
    const units = explicitUnits > 0 ? explicitUnits : nav > 0 ? amount / nav : 0;

    if (amount <= 0 || nav <= 0 || units <= 0) {
      return res.status(400).json({ success: false, message: "Invalid buy details" });
    }

    const prevUnits = Number(investment.units || 0);
    const prevInvested = Number(investment.investedAmount || 0);
    
    // Update existing record with weighted average cost
    const nextUnits = prevUnits + units;
    const nextInvestedAmount = prevInvested + amount;

    investment.units = nextUnits;
    investment.investedAmount = nextInvestedAmount;
    investment.purchaseNAV = nextUnits > 0 ? nextInvestedAmount / nextUnits : investment.purchaseNAV;
    
    await investment.save();

    // Log transaction
    await createTransaction({
      userID: req.user._id,
      scheme_code: investment.scheme_code,
      scheme_name: investment.scheme_name,
      type: "buy",
      amount,
      units,
      nav,
      date: purchaseDate ? new Date(purchaseDate) : new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Investment updated successfully",
      data: investment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Partial or full sell of an investment.
 * POST /api/investments/:id/sell
 */
exports.sellInvestment = async (req, res) => {
  try {
    const { unitsToSell, currentNAV, sellDate } = req.body;
    const investment = await Investment.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!investment) {
      return res.status(404).json({ success: false, message: "Investment not found" });
    }

    const result = await processSell(investment, unitsToSell, currentNAV);
    if (result?.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    // Log transaction event
    await createTransaction({
      userID: req.user._id,
      scheme_code: investment.scheme_code,
      scheme_name: investment.scheme_name,
      type: "sell",
      amount: result.sellAmount,
      units: unitsToSell,
      nav: currentNAV,
      date: sellDate ? new Date(sellDate) : new Date(),
      profitLoss: result.profitLoss,
    });

    res.status(200).json({
      success: true,
      message: "Units sold successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Permanently deletes an investment record.
 * Logs it as a 'redemption' event.
 * DELETE /api/investments/:id
 */
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userID: req.user._id,
    });
    
    if (!investment) {
      return res.status(404).json({ success: false, message: "Investment not found" });
    }

    // Record the full exit
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

    res.status(200).json({ success: true, message: "Investment removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
