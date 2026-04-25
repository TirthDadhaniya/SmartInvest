const Transaction = require("../models/Transaction");

/**
 * Appends an entry to the immutable transaction ledger.
 * Used for historical reporting and auditing.
 * 
 * @param {Object} data - Transaction details
 * @param {string} data.userID - ID of the user
 * @param {number} data.scheme_code - Fund scheme identifier
 * @param {string} data.scheme_name - Fund name
 * @param {string} data.type - Transaction type (buy, sell, sip, redemption)
 * @param {number} data.amount - Total currency amount
 * @param {number} data.units - Units involved
 * @param {number} data.nav - Price per unit at execution
 * @param {Date} [data.date] - Execution date (defaults to now)
 * @param {number} [data.profitLoss=null] - Realized gain/loss (for sell/redemption)
 * @returns {Promise<Object>} - The created transaction record
 */
const createTransaction = async ({
  userID,
  scheme_code,
  scheme_name,
  type,
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
