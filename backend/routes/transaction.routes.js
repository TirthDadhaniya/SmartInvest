const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const transactionController = require("../controller/transaction.controller");

router.get("/", protect, transactionController.getTransactions);
// router.post("/", protect, transactionController.createTransaction);

module.exports = router;
