/**
 * SIP Model
 * ─────────
 * Tracks systematic investment plans for a user.
 * 
 * Key design decisions:
 *  - `nextDueDate` is tracked to identify when an SIP needs to be manually or
 *    automatically executed.
 *  - `status` allows pausing an SIP without deleting its configuration.
 *
 * Indexes:
 *  - { userID: 1, scheme_code: 1 } → lookup specific SIPs
 *  - { userID: 1, nextDueDate: 1 } → efficient querying of due SIPs
 */
const mongoose = require("mongoose");

const sipSchema = new mongoose.Schema(
  {
    /* ── Ownership ── */
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ── Scheme Details ── */
    scheme_code: {
      type: Number,
      required: true,
    },
    scheme_name: {
      type: String,
      required: true,
    },
    fund_house: {
      type: String,
    },
    scheme_type: {
      type: String,
    },
    scheme_category: {
      type: String,
      required: true,
    },

    /* ── SIP Configuration ── */
    monthlyAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    expectedReturnRate: {
      type: Number,
      required: true,
      default: 12,
      min: 0,
    },
    durationYears: {
      type: Number,
      required: true,
    },

    /* ── State ── */
    status: {
      type: String,
      enum: ["active", "paused", "stopped"],
      default: "active",
    },
    lastExecutedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// ─── Indexes ─────────────────────────────────────────────────────────────
// Compound index: allows fast lookup of user's SIP in a specific scheme.
sipSchema.index({ userID: 1, scheme_code: 1 });
// Efficiently find SIPs that are due for execution for the user.
sipSchema.index({ userID: 1, nextDueDate: 1 });

module.exports = mongoose.model("SIP", sipSchema);
