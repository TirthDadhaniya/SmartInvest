const express = require("express");
const router = express.Router();
const investmentController = require("../controller/investment.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, investmentController.createInvestment);
router.get("/", protect, investmentController.getInvestments);
router.get("/:id", protect, investmentController.getInvestmentbyid);
router.put("/:id", protect, investmentController.updateInvestment);
router.delete("/:id", protect, investmentController.deleteInvestment);

module.exports = router;
