const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { routeSchemas } = require("../validation/validator");

router.post(
  "/register",
  validate(routeSchemas.auth.register),
  authController.registerUser,
);
router.post("/login", validate(routeSchemas.auth.login), authController.loginUser);
router.post("/logout", authController.logoutUser);
router.get("/me", protect, authController.getUser);
router.put(
  "/me",
  protect,
  validate(routeSchemas.auth.updateUser),
  authController.updateUser,
);

module.exports = router;
