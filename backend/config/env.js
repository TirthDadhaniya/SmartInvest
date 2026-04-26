const requiredEnv = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return {
      success: false,
      message: `Missing required environment variable(s): ${missing.join(", ")}`,
      missing,
    };
  }

  return { success: true };
};

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
};

module.exports = {
  getCookieOptions,
  validateEnv,
};
