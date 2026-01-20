const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend API running 🚀");
});

// ================= ROUTES =================

// Admin routes
app.use("/api/admin", require("./Routes/adminRoutes"));

// Student routes
app.use("/api/students", require("./Routes/studentRoutes"));

// Fee Payments bulk upload routes
app.use("/api/fee-payments", require("./Routes/feeBulkUploadRoutes"));

// Fee Structure routes
app.use("/api/fee-structure", require("./Routes/feeStructureRoutes"));

// ✅ New: Fee categories (including CUSTOM) for upload dropdown
app.use("/api/fee-structure/categories", require("./Routes/feeCategoryRoutes"));

// // ✅ Optional: Fee templates for download
// app.use("/api/templates", require("./Routes/feeTemplateRoutes"));
// after all other routes
app.use("/api/templates", require("./Routes/templateRoutes"));

// Fee transaction routes
app.use("/api/fee-transaction", require("./Routes/feeTransactionRoutes"));

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
