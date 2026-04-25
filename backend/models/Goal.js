/**
 * Goal Model
 * ──────────
 * Represents a user's financial objective (e.g. Retirement, Vacation).
 * Portfolio analysis calculates how much of the portfolio is "allocated" 
 * to this goal based on timeline and amount.
 *
 * Indexes:
 *  - { userID: 1 } → fetch all goals for a single user quickly
 */
const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    /* ── Ownership ── */
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ── Goal Details ── */
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Goal", goalSchema);
