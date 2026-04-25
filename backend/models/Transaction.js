/**
 * Transaction Model
 * ─────────────────
 * Immutable ledger of all portfolio events. Used for historical reporting,
 * tax calculation, and auditing.
 *
 * Indexes:
 *  - { userID: 1, date: -1 } → primary sort order for transaction history page
 *  - { userID: 1, type: 1 } → filtering by buy/sell/sip
 *  - { userID: 1, scheme_code: 1 } → filtering by specific fund
 */
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    /* ── Ownership ── */
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ── Scheme Info ── */
    scheme_code: {
      type: Number,
      required: true,
    },
    scheme_name: {
      type: String,
      required: true,
    },

    /* ── Transaction Details ── */
    type: {
      type: String,
      enum: ["buy", "sell", "sip", "redemption"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    nav: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    /* ── Realized P&L (Sells only) ── */
    profitLoss: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

// ─── Indexes ─────────────────────────────────────────────────────────────
// Primary index for the transaction history page (most common query).
transactionSchema.index({ userID: 1, date: -1 });
// Secondary indexes for filtering on the frontend.
transactionSchema.index({ userID: 1, type: 1 });
transactionSchema.index({ userID: 1, scheme_code: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
