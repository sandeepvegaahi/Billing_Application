// const Student = require("../Models/Student");
// const FeeTransaction = require("../Models/FeeTransaction");

// /* ================= SEARCH STUDENT ================= */
// exports.searchStudentFee = async (req, res) => {
//   try {
//     const { htNumber } = req.params;

//     const student = await Student.findOne({
//       htNumber: htNumber.toUpperCase()
//     });

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found"
//       });
//     }

//     let transaction = await FeeTransaction.findOne({
//       student: student._id
//     });

//     if (!transaction) {
//       transaction = await FeeTransaction.create({
//         student: student._id,
//         fees: [],
//         receipts: []
//       });
//     }

//     res.status(200).json({
//       success: true,
//       student,
//       fees: transaction.fees,
//       transaction
//     });

//   } catch (error) {
//     console.error("SEARCH ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// };

// /* ================= PAY FEE ================= */
// exports.makePayment = async (req, res) => {
//   try {
//     const { htNumber, category, customCategoryName, amount } = req.body;

//     const student = await Student.findOne({ htNumber });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const transaction = await FeeTransaction.findOne({
//       student: student._id
//     });

//     let fee = transaction.fees.find(
//       f =>
//         f.category === category &&
//         (f.customCategoryName || null) === (customCategoryName || null)
//     );

//     if (!fee) {
//       fee = {
//         category,
//         customCategoryName,
//         totalAmount: amount,
//         paidAmount: 0,
//         dueAmount: amount
//       };
//       transaction.fees.push(fee);
//     }

//     fee.paidAmount += amount;
//     fee.dueAmount = fee.totalAmount - fee.paidAmount;

//     transaction.receipts.push({
//       billNo: `BILL-${Date.now()}`,
//       category,
//       amount
//     });

//     await transaction.save();

//     res.status(200).json({
//       success: true,
//       message: "Payment successful"
//     });

//   } catch (error) {
//     console.error("PAY ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Payment failed"
//     });
//   }
// };

// /* ================= PAYMENT HISTORY ================= */
// exports.paymentHistory = async (req, res) => {
//   try {
//     const { htNumber } = req.params;

//     const student = await Student.findOne({ htNumber });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const transaction = await FeeTransaction.findOne({
//       student: student._id
//     });

//     res.status(200).json({
//       success: true,
//       transaction
//     });

//   } catch (error) {
//     console.error("HISTORY ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch history"
//     });
//   }
// };
