const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      "TuitionFee",
      "BusFee",
      "ExamFee",
      "UniversityFee",
      "CondonationFee",
      "CUSTOM"          // 👈 IMPORTANT
    ],
    required: true
  },

  customCategoryName: {
    type: String,       // 👈 LibraryFee, HostelFee, etc
    default: null
  },

  amount: Number,
  year: String,
  billPrefix: String,
  currentBillNumber: Number
});

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
