const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    scheme_code: {
      type: Number,
      required: true,
      unique: true,
    },
    scheme_name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["buy", "sell", "sip"],
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
    profitLoss: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
