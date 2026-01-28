

const express = require("express");
const router = express.Router();
const adminProtect = require("../Middleware/authMiddleware");

const { getFinancialReport, getDueReport, getSummaryReport } = require("../controllers/reportsController");

router.get("/financial", adminProtect, getFinancialReport);
router.get("/due", adminProtect, getDueReport);
router.get("/summary", adminProtect, getSummaryReport);

module.exports = router;
