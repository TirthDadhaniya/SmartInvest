const SIP = require("../models/SIP");
const { executeSIPInstalment } = require("../services/sip.service");

const normalizeToDateOnly = (value) => {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

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

    const normalizedStartDate = normalizeToDateOnly(startDate);

    if (Number.isNaN(normalizedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    const nextDueDate = new Date(normalizedStartDate);

    const sip = await SIP.create({
      userID: userId,
      scheme_code,
      scheme_name,
      fund_house,
      scheme_type,
      scheme_category,
      monthlyAmount,
      startDate: normalizedStartDate,
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

exports.executeSIPInstalment = async (req, res) => {
  try {
    const { currentNAV } = req.body;
    // currentNAV passed from frontend after fetching from MFAPI

    if (!currentNAV) {
      return res.status(400).json({
        success: false,
        message: "Current NAV is required to execute SIP instalment",
      });
    }

    const executionDate = new Date();

    const result = await executeSIPInstalment({
      sipId: req.params.id,
      userId: req.user._id,
      currentNAV,
      executionDate,
    });

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        message: "SIP instalment executed successfully",
        investment: result.investment,
        nextDueDate: result.nextDueDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
