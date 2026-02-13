const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentBulkk",
      required: true,
    },

    htNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    academicYear: {
      type: String, 
      required: true,
    },
    //academicBatch: { type: String, required: true },

    feeCategory: {
      type: String,
      enum: [
        "TuitionFee",
        "BusFee",
        "ExamFee",
        "UniversityFee",
        "CondonationFee",
        "CUSTOM",
      ],
      required: true,
    },

    // ✅ NEW FIELD
    customFeeName: {
      type: String,
      trim: true,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMode: {
      type: String,
      default: "EXCEL",
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FeePayment", feePaymentSchema);
