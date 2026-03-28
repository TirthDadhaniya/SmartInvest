const express = require("express");
const router = express.Router();
const investmentController = require("../controller/investment.controller");

router.post("/", investmentController.createInvestment);

module.exports = router;
