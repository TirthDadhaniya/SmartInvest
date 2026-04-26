const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./db/db");
const { requestLogger } = require("./middleware/requestLogger");
const { validateEnv } = require("./config/env");

// ─── Environment ──────────────────────────────────────────────────────────────
// MUST be called before reading any process.env values
dotenv.config();
const envValidation = validateEnv();
if (!envValidation.success) {
  console.error(envValidation.message);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

const app = express();
app.set("trust proxy", 1);

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
// Prevents abuse: 100 requests per 15 minutes per IP in production.
// Relaxed to 500 req/15 min in development for comfortable testing.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 500,
  standardHeaders: true,  // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(limiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Explicit origin allowlist. Wildcard (*) is rejected by browsers when
// withCredentials:true is used, so we must specify exact frontend origins.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true, // Required so browsers send/receive cookies
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" })); // Cap body size
app.use(cookieParser());

// ─── Request Logger ───────────────────────────────────────────────────────────
// Logs every request with timing, user ID, and HTTP status.
// Placed AFTER body parsers but BEFORE routes.
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/portfolio", require("./routes/portfolio.routes"));
app.use("/api/investments", require("./routes/investment.routes"));
app.use("/api/sips", require("./routes/sip.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));
app.use("/api/goals", require("./routes/goal.routes"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
