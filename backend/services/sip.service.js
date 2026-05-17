const SIP = require("../models/SIP");
const { createInvestment } = require("./investment.service");
const { createTransaction } = require("./transaction.service");
const { normalizeToDateOnly } = require("./calculation.service");

/**
 * Advances a date by one calendar month while clamping to the last valid day
 * of the target month. e.g. Jan 31 → Feb 28, not Mar 3.
 */
const addOneMonthClamped = (date) => {
  const d = new Date(date);
  const targetMonth = d.getUTCMonth() + 1; // 0-indexed, wraps via Date automatically
  d.setUTCMonth(targetMonth);
  // If the day overflowed (e.g. Jan 31 → Mar 3), back up to last day of the
  // intended month.
  if (d.getUTCMonth() !== ((targetMonth) % 12)) {
    d.setUTCDate(0); // setUTCDate(0) → last day of the previous month
  }
  return d;
};

const executeSIPInstalment = async ({ sipId, userId, currentNAV, executionDate }) => {
  const sip = await SIP.findOne({ _id: sipId, userID: userId });

  if (!sip) {
    return { success: false, message: "SIP not found" };
  }

  if (sip.status !== "active") {
    return { success: false, message: "SIP is not active" };
  }

  const today = executionDate ? new Date(executionDate) : new Date();
  const todayDateOnly = normalizeToDateOnly(today);
  const dueDateOnly = normalizeToDateOnly(sip.nextDueDate);

  // Allow execution if today is within 15 days of the due date (or past due)
  const diffDays = Math.ceil((dueDateOnly - todayDateOnly) / (1000 * 60 * 60 * 24));

  if (diffDays > 15) {
    return {
      success: false,
      message: `SIP instalment is not due yet. Next due date is ${dueDateOnly.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}. You can pay up to 15 days in advance.`,
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
    purchaseDate: executionDate || today,
    type: "sip",
  });

  // Guard: createInvestment returns { error } on validation failure
  if (investment?.error) {
    return { success: false, message: investment.error };
  }

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

  // Advance to next due date, clamped to valid month-end
  sip.nextDueDate = addOneMonthClamped(dueDateOnly);
  sip.lastExecutedDate = today;
  await sip.save();

  return {
    success: true,
    investment,
    nextDueDate: sip.nextDueDate,
  };
};

module.exports = { executeSIPInstalment };
