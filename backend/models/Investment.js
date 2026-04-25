/**
 * Investment Model
 * ────────────────
 * Represents a single mutual fund investment held by a user.
 * Each record tracks the original cost basis (investedAmount, purchaseNAV),
 * current unit count, and metadata about the scheme.
 *
 * Key design decisions:
 *  - `units` is stored (not computed) so partial sells can decrement it.
 *  - `expenseRatio` is user-entered; defaults to 0 if the user doesn't know it.
 *  - `type` distinguishes lumpsum buys from SIP-generated investments.
 *
 * Indexes:
 *  - { userID, scheme_code }  → compound lookup (allows same scheme across users)
 *  - { userID, purchaseDate } → efficient date-sorted queries for portfolio views
 */
const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    /* ── Ownership ── */
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ── Scheme Identity ── */
    scheme_code: { type: Number, required: true },
    scheme_name: { type: String, required: true },
    fund_house: { type: String },
    scheme_type: { type: String },
    scheme_category: { type: String, required: true },
    subCategory: { type: String },

    /* ── Financial Data ── */
    investedAmount: { type: Number, required: true, min: 0 },
    units: { type: Number, required: true },
    purchaseNAV: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
    expenseRatio: { type: Number, default: 0, min: 0 },

    /* ── Classification ── */
    type: {
      type: String,
      enum: ["lumpsum", "sip"],
      default: "lumpsum",
    },

    /* ── Optional Identifiers ── */
    isin_growth: { type: String },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound: allows multiple users to hold the same scheme, and efficiently
// queries a user's investments by scheme.
investmentSchema.index({ userID: 1, scheme_code: 1 });
// Performance: date-sorted queries for portfolio summaries.
investmentSchema.index({ userID: 1, purchaseDate: -1 });

module.exports = mongoose.model("Investment", investmentSchema);
