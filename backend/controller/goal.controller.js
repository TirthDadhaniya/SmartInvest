const Goal = require("../models/Goal");
const Investment = require("../models/Investment");

// GET Goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userID: req.user._id }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching goals",
    });
  }
};

// CREATE Goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate } = req.body;

    if (!name || !targetAmount || !targetDate) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const goal = await Goal.create({
      userID: req.user._id,
      name,
      targetAmount,
      targetDate,
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating goal",
    });
  }
};

// EDIT Goal
exports.updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        userID: req.user._id,
      },
      {
        name,
        targetAmount,
        targetDate,
      },
      { new: true, runValidators: true },
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE Goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET Goal Progress
exports.getGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found or not authorized",
      });
    }

    const totalCurrentValue = await Investment.aggregate([
      {
        $match: {
          userID: req.user._id,
        },
      },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: "$investedAmount" },
        },
      },
    ]);

    console.log("Total Current Value:", totalCurrentValue[0].totalInvested);

    const progressPercent =
      (totalCurrentValue[0]?.totalInvested / goal.targetAmount) * 100 || 0;

    res.status(200).json({
      success: true,
      data: {
        progressPercent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
