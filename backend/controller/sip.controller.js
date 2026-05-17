const SIP = require("../models/SIP");
const { executeSIPInstalment } = require("../services/sip.service");
const { normalizeToDateOnly } = require("../services/calculation.service");
const axios = require("axios");

/**
 * Retrieves all SIPs for the logged-in user.
 * GET /api/sips
 */
exports.getAllSIPs = async (req, res) => {
  try {
    const sips = await SIP.find({ userID: req.user._id })
      .sort({ scheme_name: 1 })
      .lean();
    
    res.status(200).json({ success: true, data: sips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Registers a new systematic investment plan.
 * POST /api/sips
 */
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

/**
 * Updates the lifecycle status of an SIP.
 * PUT /api/sips/:id/status
 */
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

/**
 * Updates SIP configuration details.
 * PUT /api/sips/:id
 */
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

/**
 * Permanently deletes an SIP configuration.
 * DELETE /api/sips/:id
 */
exports.deleteSIP = async (req, res) => {
  try {
    const sip = await SIP.findOneAndDelete({ _id: req.params.id, userID: req.user._id });
    if (!sip) return res.status(404).json({ success: false, message: "SIP not found" });
    res.status(200).json({ success: true, message: "SIP deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Executes a manual SIP instalment.
 * Creates an investment record and a transaction entry.
 * POST /api/sips/:id/execute
 */
exports.executeSIPInstalment = async (req, res) => {
  try {
    let { currentNAV } = req.body;

    if (!currentNAV) {
      const sip = await SIP.findOne({ _id: req.params.id, userID: req.user._id });
      if (sip) {
        try {
          const response = await axios.get(`https://api.mfapi.in/mf/${sip.scheme_code}`);
          if (response.data?.data?.[0]?.nav) {
            currentNAV = parseFloat(response.data.data[0].nav);
          }
        } catch (fetchError) {
          console.error("[ExecuteSIP NAV Fetch Error]", fetchError.message);
        }
      }
    }

    if (!currentNAV) {
      return res.status(400).json({
        success: false,
        message: "Current NAV is required and could not be fetched automatically.",
      });
    }

    const result = await executeSIPInstalment({
      sipId: req.params.id,
      userId: req.user._id,
      currentNAV,
    });

    if (!result.success) {
      const status = result.message === "SIP not found" ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message });
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("[ExecuteSIP Error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
