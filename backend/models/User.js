/**
 * User Model
 * ──────────
 * Represents an authenticated user in the SmartInvest system.
 * Stores core identity, hashed password, and high-level risk preference
 * which influences portfolio grading and tips.
 *
 * Indexes:
 *  - { email: 1 } → primary login identifier (unique)
 */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* ── Identity ── */
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    /* ── Security ── */
    passwordHash: {
      type: String,
      required: true,
    },

    /* ── Preferences ── */
    riskPreference: {
      type: String,
      enum: ["Conservative", "Moderate", "Aggressive"],
      default: "Moderate",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
