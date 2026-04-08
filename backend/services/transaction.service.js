const Transaction = require("../models/Transaction");

const createTransaction = async ({
  userID,
  scheme_code,
  scheme_name,
  type, // 'buy', 'sell', 'sip'
  amount,
  units,
  nav,
  date,
  profitLoss = null,
}) => {
  const transaction = await Transaction.create({
    userID,
    scheme_code,
    scheme_name,
    type,
    amount,
    units,
    nav,
    date: date || new Date(),
    profitLoss,
  });
  return transaction;
};

module.exports = { createTransaction };
