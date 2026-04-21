const express = require("express");
const router = express.Router();
const portfolioController = require("../controller/portfolio.controller");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { routeSchemas } = require("../validation/validator");

router.get("/summary", protect, portfolioController.summary);
router.get("/tax-analysis", protect, portfolioController.getTaxAnalysis);
router.get("/break-even", protect, portfolioController.getBreakEven);
router.post(
  "/what-if",
  protect,
  validate(routeSchemas.analytics.whatIf),
  portfolioController.getWhatIf,
);
router.get("/quick-what-if", protect, portfolioController.getQuickWhatIf);
router.get("/goal-gaps", protect, portfolioController.getGoalGaps);
router.get("/stress-test", protect, portfolioController.getStressTest);
router.get("/expense-drain", protect, portfolioController.getExpenseDrain);
router.get("/report-card", protect, portfolioController.getReportCard);

module.exports = router;
