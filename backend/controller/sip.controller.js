const SIP = require("../models/SIP");
const { executeSIPInstalment } = require("../services/sip.service");
const { normalizeToDateOnly } = require("../services/calculation.service");

// GET SIP
exports.getAllSIPs = async (req, res) => {
  try {
    const sips = await SIP.find({ userID: req.user._id }).sort({ scheme_name: 1 });
    res.status(200).json({ success: true, data: sips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE SIP
exports.createSIP = async (req, res) => {
  try {
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

    if (!scheme_code || !scheme_name || !monthlyAmount || !startDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const normalizedStartDate = normalizeToDateOnly(startDate);
    const sip = await SIP.create({
      userID: req.user._id,
      scheme_code,
      scheme_name,
      fund_house,
      scheme_type,
      scheme_category,
      monthlyAmount,
      startDate: normalizedStartDate,
      nextDueDate: normalizedStartDate,
      expectedReturnRate,
      durationYears,
    });

    res.status(201).json({ success: true, data: sip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE Status of SIP
exports.updateSIPStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sip = await SIP.findOneAndUpdate(
      { _id: req.params.id, userID: req.user._id },
      { status },
      { new: true },
    );
    if (!sip) return res.status(404).json({ success: false, message: "SIP not found" });
    res.status(200).json({ success: true, data: sip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE SIP
exports.updateSIP = async (req, res) => {
  try {
    const { monthlyAmount, durationYears, expectedReturnRate } = req.body;
    const sip = await SIP.findOneAndUpdate(
      { _id: req.params.id, userID: req.user._id },
      { monthlyAmount, durationYears, expectedReturnRate },
      { new: true },
    );
    if (!sip) return res.status(404).json({ success: false, message: "SIP not found" });
    res.status(200).json({ success: true, data: sip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE SIP
exports.deleteSIP = async (req, res) => {
  try {
    const sip = await SIP.findOneAndDelete({ _id: req.params.id, userID: req.user._id });
    if (!sip) return res.status(404).json({ success: false, message: "SIP not found" });
    res.status(200).json({ success: true, message: "SIP deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.executeSIPInstalment = async (req, res) => {
  try {
    const { currentNAV } = req.body;
    if (!currentNAV)
      return res.status(400).json({ success: false, message: "Current NAV is required" });

    const result = await executeSIPInstalment({
      sipId: req.params.id,
      userId: req.user._id,
      currentNAV,
    });

    if (!result.success) {
      return res
        .status(result.statusCode || 400)
        .json({ success: false, message: result.message });
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
