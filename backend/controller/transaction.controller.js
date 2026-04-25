const Transaction = require("../models/Transaction");

/**
 * Retrieves a filtered list of transactions for the user.
 * GET /api/transactions
 * Query Params: type, scheme_code, from (date), to (date)
 */
exports.getTransactions = async (req, res) => {
  try {
    const { type, scheme_code, from, to } = req.query;

    let filter = { userID: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (scheme_code) {
      filter.scheme_code = scheme_code;
    }

    if (from || to) {
      filter.date = {};
      if (from) {
        filter.date.$gte = new Date(from);
      }
      if (to) {
        filter.date.$lte = new Date(to);
      }
    }

    // Use .lean() for faster performance as we don't need Mongoose model methods here
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("[GetTransactions Error]", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
    });
  }
};
