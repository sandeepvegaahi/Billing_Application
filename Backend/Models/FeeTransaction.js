

const mongoose = require("mongoose");

const feeTransactionSchema = new mongoose.Schema(
  {
    htNumber: { type: String, required: true, uppercase: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    amountPaid: { type: Number, required: true },
    paymentMode: { type: String, default: "CASH" },
    customFeeName: { type: String, trim: true, default: null }, // ADDED
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeTransaction", feeTransactionSchema);
