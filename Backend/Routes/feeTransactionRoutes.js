// const express = require("express");
// const router = express.Router();
// const adminProtect = require("../Middleware/authMiddleware");
// const { getStudentFeeDetails } = require("../controllers/feeTransactionController");

// // Fetch student fee details by HT number
// router.get("/student/:htNumber", adminProtect, getStudentFeeDetails);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { getStudentFees, payFee } = require("../controllers/feeTransactionController");

// Fetch student fee details
router.get("/student/:htNumber", getStudentFees);

// Pay fee
router.post("/pay", payFee);

module.exports = router;
