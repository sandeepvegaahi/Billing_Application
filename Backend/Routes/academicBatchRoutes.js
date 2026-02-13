const express = require("express");
const router = express.Router();
const adminProtect = require("../Middleware/authMiddleware");
const {
  generateBatches,
  getBatches,
} = require("../controllers/academicBatchController");

router.post("/generate", adminProtect, generateBatches); 
router.get("/", adminProtect, getBatches); 

module.exports = router;
