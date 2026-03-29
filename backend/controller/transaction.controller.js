const Transaction = require("../models/Transaction");

// CREATE Transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {}
};

// GET Transaction
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {}
};
