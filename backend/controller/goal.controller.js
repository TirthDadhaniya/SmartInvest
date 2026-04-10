const Goal = require("../models/Goal");

// GET Goals
exports.getGoals = async (req, res) => {
  try {
    const goals = (await Goal.find({ userID: req.user._id })).toSorted({ name: 1 });
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

// GET BY ID
exports.getGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {}
};

// UPDATE Goal
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {}
};

// DELETE Goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {}
};
