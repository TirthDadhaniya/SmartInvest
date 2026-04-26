const Transaction = require("../models/Transaction");

const getPagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * Retrieves a filtered list of transactions for the user.
 * GET /api/transactions
 * Query Params: type, scheme_code, from (date), to (date)
 */
exports.getTransactions = async (req, res) => {
  try {
    const { type, scheme_code, from, to } = req.query;
    const { page, limit, skip } = getPagination(req.query);

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
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[GetTransactions Error]", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
    });
  }
};
