const SIP = require("../models/SIP");

// CREATE SIP
exports.createSIP = async (req, res) => {
  try {
    const sip = await SIP.create(req.body);
    res.status(200).json({
      success: true,
      data: sip,
    });
  } catch (error) {}
};

// GET SIP
exports.getSIP = async (req, res) => {
  try {
    const sip = await SIP.find();
    res.status(200).json({
      success: true,
      data: sip,
    });
  } catch (error) {}
};

// GET BY ID
exports.getSIPbyid = async (req, res) => {
  try {
    const sip = await SIP.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: sip,
    });
  } catch (error) {}
};

// UPDATE Status of SIP
exports.updateStatus = async (req, res) => {
  try {
    const status = await SIP.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {}
};

// UPDATE SIP
exports.updateSIP = async (req, res) => {
  try {
    const sip = await SIP.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: sip,
    });
  } catch (error) {}
};

// DELETE SIP
exports.deleteSIP = async (req, res) => {
  try {
    const sip = await SIP.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "SIP deleted successfully",
    });
  } catch (error) {}
};
