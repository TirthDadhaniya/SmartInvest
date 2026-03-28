const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    investedAmount: {
      type: Number,
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    purchaseNAV: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["lumpsum", "sip"],
      default: "lumpsum",
    },
    isin_growth: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Investment", investmentSchema);
