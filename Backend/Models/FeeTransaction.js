const mongoose = require("mongoose");

const feeTransactionSchema = new mongoose.Schema(
  {
    htNumber: { type: String, required: true, uppercase: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true, uppercase: true },
    year: { type: Number, required: true },
    category: { type: String, required: true },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("FeeTransaction", feeTransactionSchema);
