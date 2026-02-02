const express = require("express");
const router = express.Router();
const adminProtect = require("../Middleware/authMiddleware");
const {
  generateBatches,
  getBatches,
} = require("../controllers/academicBatchController");

router.post("/generate", adminProtect, generateBatches); // Admin inputs starting year
router.get("/", adminProtect, getBatches); // Fetch all batches

module.exports = router;
