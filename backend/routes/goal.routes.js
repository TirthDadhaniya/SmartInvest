const express = require("express");
const router = express.Router();
const goalController = require("../controller/goal.controller");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { routeSchemas } = require("../validation/validator");

router.get("/", protect, goalController.getGoals);
router.post("/", protect, validate(routeSchemas.goal.create), goalController.createGoal);
router.put(
  "/:id",
  protect,
  validate(routeSchemas.goal.update),
  goalController.updateGoal,
);
router.delete(
  "/:id",
  protect,
  validate(routeSchemas.goal.goalById),
  goalController.deleteGoal,
);
router.get(
  "/:id/progress",
  protect,
  validate(routeSchemas.goal.goalById),
  goalController.getGoalProgress,
);

module.exports = router;
