const express = require("express");
const router = express.Router();
const goalController = require("../controller/goal.controller");

router.get("/", goalController.getGoals);
router.post("/", goalController.createGoal);
router.put("/:id", goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);
router.get("/progress", goalController.getGoalProgress);

module.exports = router;
