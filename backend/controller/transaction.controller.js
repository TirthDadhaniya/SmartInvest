const Transaction = require("../models/Transaction");
const { createTransaction } = require("../services/transaction.service");

// GET Transaction
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

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
    });
  }
};

// CREATE Transaction
// exports.createTransaction = async (req, res) => {
//   try {
//     const { scheme_code, scheme_name, type, amount, units, nav, date, profitLoss } =
//       req.body;

//     if (!scheme_code || !sceheme_name || !type || !amount || !units || !nav || !date) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields are missing",
//       });
//     }

//     const transaction = await Transaction.create({
//       userID: req.user._id,
//       scheme_code,
//       scheme_name,
//       type,
//       amount,
//       units,
//       nav,
//       date,
//       profitLoss,
//     });
//     res.status(201).json({
//       success: true,
//       data: transaction,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error creating transaction",
//     });
//   }
// };
