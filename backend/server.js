const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/investment", require("./routes/investment.routes"));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
