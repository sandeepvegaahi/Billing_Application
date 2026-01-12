// const mongoose = require("mongoose");

// const feeSchema = new mongoose.Schema({
//   category: { type: String, required: true },
//   customCategoryName: { type: String },
//   totalAmount: { type: Number, required: true },
//   paidAmount: { type: Number, default: 0 },
//   dueAmount: { type: Number, required: true }
// });

// const receiptSchema = new mongoose.Schema({
//   billNo: String,
//   date: { type: Date, default: Date.now },
//   category: String,
//   amount: Number
// });

// const feeTransactionSchema = new mongoose.Schema({
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Student",
//     required: true
//   },
//   fees: [feeSchema],
//   receipts: [receiptSchema]
// });

// module.exports = mongoose.model("FeeTransaction", feeTransactionSchema);
