const Goal = require("../models/Goal");
const portfolioService = require("../services/portfolio.service");

/**
 * Retrieves all goals for the user.
 * GET /api/goals
 */
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userID: req.user._id })
      .sort({ name: 1 })
      .lean();
    
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching goals" });
  }
};

/**
 * Creates a new financial goal.
 * POST /api/goals
 */
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }
    const goal = await Goal.create({ userID: req.user._id, name, targetAmount, targetDate });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating goal" });
  }
};

/**
 * Updates an existing goal.
 * PUT /api/goals/:id
 */
exports.updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userID: req.user._id },
      { name, targetAmount, targetDate },
      { new: true, runValidators: true }
    );

    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Permanently deletes a goal.
 * DELETE /api/goals/:id
 */
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userID: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
    res.status(200).json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Calculates real-time progress for a specific goal based on portfolio performance.
 * GET /api/goals/:id/progress
 */
exports.getGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userID: req.user._id }).lean();
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    const { totalInvested, totalCurrentValue, earliestInvestmentDate } = 
      await portfolioService.getPortfolioStats(req.user._id);

    if (totalInvested === 0) {
      return res.status(200).json({
        success: true,
        data: { 
          progressPercent: 0, 
          currentValue: 0, 
          message: "Add investments to track progress." 
        }
      });
    }

    // 1. Calculate historical returns (CAGR)
    const now = new Date();
    const holdingYears = Math.max(0.1, (now - earliestInvestmentDate) / (1000 * 60 * 60 * 24 * 365.25));
    const annualReturn = Math.max(0.05, Math.pow(totalCurrentValue / totalInvested, 1 / holdingYears) - 1);
    const monthlyRate = annualReturn / 12;

    // 2. Goal timing
    const targetDate = new Date(goal.targetDate);
    const monthsRemaining = Math.max(1, (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()));

    // 3. Projections
    const progressPercent = Math.min(100, (totalCurrentValue / goal.targetAmount) * 100);
    const projectedValue = totalCurrentValue * Math.pow(1 + monthlyRate, monthsRemaining);
    const gap = goal.targetAmount - projectedValue;

    // 4. Required SIP for the gap
    // Formula: Gap = SIP * [((1+r)^n - 1) / r] * (1+r)
    const requiredSIP = gap > 0 
      ? (gap * monthlyRate) / ((Math.pow(1 + monthlyRate, monthsRemaining) - 1) * (1 + monthlyRate))
      : 0;

    // 5. Status Message Generation
    let gapStatus = gap <= 0 ? "on_track" : "behind";
    let gapMessage = gap <= 0 
      ? "You are on track to reach this goal!" 
      : `You might be short by ₹${Math.round(gap).toLocaleString("en-IN")}. Consider an extra SIP of ₹${Math.round(requiredSIP).toLocaleString("en-IN")}/month.`;

    res.status(200).json({
      success: true,
      data: {
        currentValue: Math.round(totalCurrentValue),
        targetAmount: goal.targetAmount,
        progressPercent: Math.round(progressPercent),
        projectedValue: Math.round(projectedValue),
        monthsRemaining,
        gapStatus,
        gapMessage,
        requiredSIP: Math.round(requiredSIP),
        actualAnnualReturn: Math.round(annualReturn * 1000) / 10
      }
    });
  } catch (error) {
    console.error("[GetGoalProgress Error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
