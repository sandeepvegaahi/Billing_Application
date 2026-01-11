const express = require("express");
const router = express.Router();
const {
  createFee,
  getFees,
  updateFee,
  deleteFee,
  generateBill,
} = require("../controllers/feeStructureController");

// CRUD routes
router.post("/", createFee);
router.get("/", getFees);
router.put("/:id", updateFee);
router.delete("/:id", deleteFee);

// Generate bill
router.post("/generate-bill", generateBill);

module.exports = router;
