const express = require("express");
const multer = require("multer");
const router = express.Router();

const adminProtect = require("../Middleware/authMiddleware");
const { bulkUploadFeePayments } = require("../controllers/bulkFeePaymentUpload");

const upload = multer({ dest: "uploads/" });

router.post(
  "/bulk-upload",
  adminProtect,
  upload.single("file"),
  bulkUploadFeePayments
);

module.exports = router;
