const mongoose = require("mongoose");

const sipSchema = new mongoose.Schema(
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
    },
    durationYears: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "stopped"],
      default: "active",
    },
    lastExecutedDate: {
      type: Date,
      default: null,
    },
    // goalId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Goal",
    //   default: null,
    // },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SIP", sipSchema);
