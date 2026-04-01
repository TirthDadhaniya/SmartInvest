const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const connectDB = require("./db/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// app.use("/api/portfolio", require("./routes/portfolio.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
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
