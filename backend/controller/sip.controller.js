const SIP = require("../models/SIP");
const { createTransaction } = require("../services/transaction.service");

// GET SIP
exports.getAllSIPs = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const sips = await SIP.find({ userID: req.user._id }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: sips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE SIP
exports.createSIP = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const {
      scheme_code,
      scheme_name,
      fund_house,
      scheme_type,
      scheme_category,
      monthlyAmount,
      startDate,
      expectedReturnRate,
      durationYears,
    } = req.body;

    if (
      !scheme_code ||
      !scheme_name ||
      !fund_house ||
      !scheme_type ||
      !scheme_category ||
      !monthlyAmount ||
      !startDate ||
      !expectedReturnRate ||
      !durationYears
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userId = req.user._id;

    const nextDueDate = new Date(startDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const sip = await SIP.create({
      userID: userId,
      scheme_code,
      scheme_name,
      fund_house,
      scheme_type,
      scheme_category,
      monthlyAmount,
      startDate,
      nextDueDate,
      expectedReturnRate,
      durationYears,
    });

    res.status(200).json({
      success: true,
      data: sip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE Status of SIP
exports.updateSIPStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const sip = await SIP.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!sip) {
      return res.status(404).json({
        success: false,
        message: "SIP not found or not authorized",
      });
    }

    sip.status = status;
    await sip.save();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE SIP
exports.updateSIP = async (req, res) => {
  try {
    const { monthlyAmount, durationYears, expectedReturnRate } = req.body;

    if (!monthlyAmount || !expectedReturnRate || !durationYears) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const sip = await SIP.findOneAndUpdate(
      {
        _id: req.params.id,
        userID: req.user._id,
      },
      {
        monthlyAmount,
        durationYears,
        expectedReturnRate,
      },
      { new: true },
    );

    if (!sip) {
      return res.status(404).json({
        success: false,
        message: "SIP not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: sip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE SIP
exports.deleteSIP = async (req, res) => {
  try {
    const sip = await SIP.findOneAndDelete({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!sip) {
      return res.status(404).json({
        success: false,
        message: "SIP not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "SIP deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
