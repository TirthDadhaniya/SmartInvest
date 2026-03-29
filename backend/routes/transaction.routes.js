const express = require("express");
const router = express.Router();

const transactionController = require("../controller/transaction.controller");

router.get("/", transactionController.getTransaction);
router.post("/", transactionController.createTransaction);

module.exports = router;
