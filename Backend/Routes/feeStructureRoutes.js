const express = require("express");
const router = express.Router();
const adminProtect = require("../Middleware/authMiddleware");

const {
  createFee,
  getFees,
  updateFee,
  deleteFee,
  generateBill,
} = require("../controllers/feeStructureController");

// ✅ PROTECTED ROUTES
router.post("/", adminProtect, createFee);
router.get("/", adminProtect, getFees);
router.put("/:id", adminProtect, updateFee);
router.delete("/:id", adminProtect, deleteFee);
router.post("/generate-bill", adminProtect, generateBill);

module.exports = router;
