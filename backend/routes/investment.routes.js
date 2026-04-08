const express = require("express");
const router = express.Router();
const investmentController = require("../controller/investment.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, investmentController.createInvestment);
router.get("/", protect, investmentController.getInvestments);
router.post("/:id/sell", protect, investmentController.sellInvestment);
router.delete("/:id", protect, investmentController.deleteInvestment);

module.exports = router;
