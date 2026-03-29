const express = require("express");
const router = express.Router();
const investmentController = require("../controller/investment.controller");

router.post("/", investmentController.createInvestment);
router.get("/", investmentController.getInvestment);
router.get("/:id", investmentController.getInvestmentbyid);
router.put("/:id", investmentController.updateInvestment);
router.delete("/:id", investmentController.deleteInvestment);

module.exports = router;
