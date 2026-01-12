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

    academicYear: {
      type: Number, // 1,2,3,4
      required: true,
    },

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

    amountPaid: {
      type: Number,
      required: true,
    },

    billNumber: {
      type: String,
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
  { timestamps: true }
);

module.exports = mongoose.model("FeePayment", feePaymentSchema);
