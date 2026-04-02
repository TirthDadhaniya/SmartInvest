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
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ name, email, passwordHash, riskPreference });

    // Generate Token
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // res.cookie("token", token);

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
          token: generateToken(user._id),
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
    const { email, passwordHash } = req.body;

    // Check for all fields
    if (!email || !passwordHash) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "INavalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        succes: false,
        message: "Invalid email or password",
      });
    }

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
        token: generateToken(user._id),
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
    const { name, email, passwordHash, riskPreference } = req.body;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
