const express = require("express");
const router = express.Router();
const goalController = require("../controller/goal.controller");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, goalController.getGoals);
router.post("/", protect, goalController.createGoal);
router.put("/:id", protect, goalController.updateGoal);
router.delete("/:id", protect, goalController.deleteGoal);
router.get("/:id/progress", protect, goalController.getGoalProgress);

module.exports = router;
