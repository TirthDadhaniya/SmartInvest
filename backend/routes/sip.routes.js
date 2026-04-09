const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const sipController = require("../controller/sip.controller");

router.get("/", protect, sipController.getAllSIPs);
router.post("/", protect, sipController.createSIP);
router.put("/:id/status", protect, sipController.updateSIPStatus);
router.put("/:id", protect, sipController.updateSIP);
router.delete("/:id", protect, sipController.deleteSIP);

module.exports = router;
