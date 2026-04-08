const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// GENERATE Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//REGISTER user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, riskPreference } = req.body;

    // Check for all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exits
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ name, email, passwordHash, riskPreference });

    if (user) {
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        riskPreference: user.riskPreference,
      };

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

//LOGIN user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for all fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "INavalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.cookie("token", generateToken(user._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.status(200).json({
      success: true,
      message: "User Logged In",
      data: {
        user: userData,
        // token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, riskPreference } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const normalizedEmail =
        typeof email === "string" ? email.trim().toLowerCase() : undefined;

      if (normalizedEmail) {
        if (normalizedEmail === user.email) {
          return res.status(409).json({
            success: false,
            message: "New email must be different from current email",
          });
        }

        const emailExist = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });

        if (emailExist) {
          return res.status(409).json({
            success: false,
            message: "Email already in use",
          });
        }
      }

      user.name = name || user.name;
      user.email = normalizedEmail || user.email;
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
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
