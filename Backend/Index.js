const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();


connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend API running 🚀");
});




app.use("/api/admin", require("./Routes/adminRoutes"));


app.use("/api/students", require("./Routes/studentRoutes"));


app.use("/api/fee-payments", require("./Routes/feeBulkUploadRoutes"));
app.use("/api/fee-transactions-bulk", require("./Routes/bulkPaidTransactionRoutes"));



app.use("/api/fee-structure", require("./Routes/feeStructureRoutes"));


app.use("/api/fee-structure/categories", require("./Routes/feeCategoryRoutes"));


app.use("/api/templates", require("./Routes/templateRoutes"));

app.use("/api/fee-transaction", require("./Routes/feeTransactionRoutes"));
app.use("/api/reports", require("./Routes/reportsRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
