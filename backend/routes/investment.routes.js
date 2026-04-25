const express = require("express");
const router = express.Router();
const investmentController = require("../controller/investment.controller");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { routeSchemas } = require("../validation/validator");

router.get("/", protect, investmentController.getInvestments);
router.post(
  "/",
  protect,
  validate(routeSchemas.investment.create),
  investmentController.createInvestment,
);
router.post(
  "/:id/buy",
  protect,
  validate(routeSchemas.investment.buyMore),
  investmentController.buyMoreInvestment,
);
router.post(
  "/:id/sell",
  protect,
  validate(routeSchemas.investment.sell),
  investmentController.sellInvestment,
);
router.delete(
  "/:id",
  protect,
  validate(routeSchemas.investment.delete),
  investmentController.deleteInvestment,
);

module.exports = router;
