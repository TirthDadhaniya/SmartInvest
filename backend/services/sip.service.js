const SIP = require("../models/SIP");
const { createInvestment } = require("../services/investment.service");
const { createTransaction } = require("../services/transaction.service");

const normalizeToDateOnly = (value) => {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const executeSIPInstalment = async ({ sipId, userId, currentNAV, executionDate }) => {
  const sip = await SIP.findOne({
    _id: sipId,
    userID: userId,
  });

  if (!sip) {
    return {
      success: false,
      statusCode: 404,
      message: "SIP not found",
    };
  }

  if (sip.status !== "active") {
    return {
      success: false,
      statusCode: 400,
      message: "SIP is not active",
    };
  }

  const today = executionDate ? new Date(executionDate) : new Date();
  const todayDateOnly = normalizeToDateOnly(today);
  const dueDateOnly = normalizeToDateOnly(sip.nextDueDate);

  if (todayDateOnly < dueDateOnly) {
    return {
      success: false,
      statusCode: 400,
      message: `SIP instalment is not due yet. Next due date is ${dueDateOnly.toDateString()}`,
    };
  }

  const investment = await createInvestment({
    userID: userId,
    scheme_code: sip.scheme_code,
    scheme_name: sip.scheme_name,
    fund_house: sip.fund_house,
    scheme_type: sip.scheme_type,
    scheme_category: sip.scheme_category,
    investedAmount: sip.monthlyAmount,
    purchaseNAV: currentNAV,
    purchaseDate: executionDate,
    type: "sip",
  });

  await createTransaction({
    userID: userId,
    scheme_code: investment.scheme_code,
    scheme_name: investment.scheme_name,
    type: "sip",
    amount: investment.investedAmount,
    units: investment.units,
    nav: investment.purchaseNAV,
    date: investment.purchaseDate,
  });
  const updatedDueDate = new Date(dueDateOnly);
  updatedDueDate.setUTCMonth(updatedDueDate.getUTCMonth() + 1);
  sip.nextDueDate = updatedDueDate;
  sip.lastExecutedDate = today;
  await sip.save();

  return {
    success: true,
    investment,
    nextDueDate: sip.nextDueDate,
  };
};

module.exports = { executeSIPInstalment };
