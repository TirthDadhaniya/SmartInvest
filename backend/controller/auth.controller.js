const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token valid for 30 days.
 * @param {string} id - User ID to embed in the token.
 * @returns {string} - Signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Registers a new user.
 * POST /api/auth/register
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, riskPreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user record
    const user = await User.create({ name, email, passwordHash, riskPreference });

    if (user) {
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        riskPreference: user.riskPreference,
      };

      // Set auth cookie
      res.cookie("token", generateToken(user._id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: userData,
          message: "User created successfully",
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Authenticates user and sets cookie.
 * POST /api/auth/login
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Set auth cookie
    res.cookie("token", generateToken(user._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      riskPreference: user.riskPreference,
    };

    res.status(200).json({
      success: true,
      message: "User Logged In",
      data: {
        user: userData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Gets currently logged in user info.
 * GET /api/auth/me
 */
exports.getUser = async (req, res) => {
  try {
    // req.user is attached by the 'protect' middleware
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Updates user profile details.
 * PUT /api/auth/me
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, riskPreference } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle email change logic
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      
      // If user wants to change email
      if (normalizedEmail !== user.email) {
        const emailExist = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        }).lean();

        if (emailExist) {
          return res.status(409).json({
            success: false,
            message: "Email already in use",
          });
        }
        user.email = normalizedEmail;
      }
    }

    user.name = name || user.name;
    user.riskPreference = riskPreference || user.riskPreference;

    const updatedUser = await user.save();

    const userData = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      riskPreference: updatedUser.riskPreference,
    };

    res.status(200).json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error("[UpdateUser Error]", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Clears authentication cookie.
 * POST /api/auth/logout
 */
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
