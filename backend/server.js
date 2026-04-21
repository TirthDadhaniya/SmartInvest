const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
const connectDB = require("./db/db");

dotenv.config();

connectDB();

const app = express();

// Explicit CORS config: wildcard origin (*) is rejected by browsers when
// withCredentials:true is used. We must specify the exact frontend origin.
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
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true, // Required so browsers send/receive cookies
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/portfolio", require("./routes/portfolio.routes"));
app.use("/api/investments", require("./routes/investment.routes"));
app.use("/api/sips", require("./routes/sip.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));
app.use("/api/goals", require("./routes/goal.routes"));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
