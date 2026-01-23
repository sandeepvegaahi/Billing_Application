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
      "CUSTOM"         
    ],
    required: true
  },

  customCategoryName: {
    type: String,      
    default: null
  },

  amount: Number,
  year: String,
  billPrefix: String,
  currentBillNumber: Number
});

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
