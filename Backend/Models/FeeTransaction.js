// const mongoose = require("mongoose");

// const feeSchema = new mongoose.Schema({
//   category: { type: String, required: true },
//   amount: { type: Number, required: true },
//   amountPaid: { type: Number, default: 0 },
//   due: { type: Number, default: 0 },
// });

// const feeTransactionSchema = new mongoose.Schema(
//   {
//     htNumber: { type: String, required: true },
//     studentName: String,
//     branch: String,
//     year: Number,
//     fees: [feeSchema],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("FeeTransaction", feeTransactionSchema);
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeTransaction", feeTransactionSchema);
