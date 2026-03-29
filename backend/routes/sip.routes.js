const express = require("express");
const router = express.Router();

const sipController = require("../controller/sip.controller");

router.get("/", sipController.getSIPs);
router.post("/", sipController.createSIP);
router.put("/:id/status", sipController.updateStatus);
router.put("/:id", sipController.updateSIP);
router.delete("/:id", sipController.deleteSIP);

module.exports = router;
