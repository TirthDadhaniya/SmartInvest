const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { routeSchemas } = require("../validation/validator");

const sipController = require("../controller/sip.controller");

router.get("/", protect, sipController.getAllSIPs);
router.post("/", protect, validate(routeSchemas.sip.create), sipController.createSIP);
router.put(
  "/:id/status",
  protect,
  validate(routeSchemas.sip.updateStatus),
  sipController.updateSIPStatus,
);
router.put("/:id", protect, validate(routeSchemas.sip.update), sipController.updateSIP);
router.post(
  "/:id/execute",
  protect,
  validate(routeSchemas.sip.executeInstalment),
  sipController.executeSIPInstalment,
);
router.delete(
  "/:id",
  protect,
  validate(routeSchemas.sip.delete),
  sipController.deleteSIP,
);

module.exports = router;
