const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { routeSchemas } = require("../validation/validator");

const transactionController = require("../controller/transaction.controller");

router.get(
  "/",
  protect,
  validate(routeSchemas.transaction.getTransactions),
  transactionController.getTransactions,
);
// router.post("/", protect, transactionController.createTransaction);

module.exports = router;
