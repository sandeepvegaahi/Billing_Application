const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
connectDB();

app.use(cors());

// ✅ JSON & URLENCODED
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Backend API running 🚀");
});

app.use("/api/admin", require("./Routes/adminRoutes"));
app.use("/api", require("./Routes/studentRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
