const express = require("express");
const multer = require("multer");
const adminProtect = require("../Middleware/authMiddleware");
const {
  bulkUploadPaidTransactions,
} = require("../controllers/bulkPaidTransactionUpload");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/bulk-upload-paid",
  adminProtect,
  upload.single("file"),
  bulkUploadPaidTransactions
);

module.exports = router;
