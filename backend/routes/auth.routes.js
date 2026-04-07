const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);
router.get("/me", protect, authController.getUser);
router.put("/me", protect, authController.updateUser);

module.exports = router;
