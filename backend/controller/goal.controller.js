const Goal = require("../models/Goal");

// CREATE Goal
exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {}
};

// GET Goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find();
    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {}
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
