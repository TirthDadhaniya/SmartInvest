const express = require("express");
const router = express.Router();
const portfolioController = require("../controller/portfolio.controller");
const { protect } = require("../middleware/authMiddleware");
//

router.get("/summary", protect, portfolioController.summary);

module.exports = router;
