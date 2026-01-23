// const Student = require("../Models/StudentBulk");
// const FeeStructure = require("../Models/FeeStructure");
// const FeeTransaction = require("../Models/FeeTransaction");
// const FeePayment = require("../Models/FeePayment");



// function calculateCurrentYear(admissionDate) {
//   const admission = new Date(admissionDate);
//   const now = new Date();

//   let year = now.getFullYear() - admission.getFullYear();
//   if (
//     now.getMonth() < admission.getMonth() ||
//     (now.getMonth() === admission.getMonth() && now.getDate() < admission.getDate())
//   ) {
//     year -= 1;
//   }

//   year = year + 1; 

  
//   if (year > 4) year = 4;
//   if (year < 1) year = 1; 

//   return year;
// }


// exports.getStudentFees = async (req, res) => {
//   try {
//     const { htNumber } = req.params;

//     const student = await Student.findOne({
//       htNumber: htNumber.toUpperCase().trim(),
//     });
//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     const currentYear = calculateCurrentYear(student.admissionDate);

//     const structures = await FeeStructure.find();

//     // 🔹 Get Excel uploaded fee amounts (CUSTOM / CONDONATION)
//    const feePayments = await FeePayment.find({
//   htNumber: student.htNumber,
// });


//     const paymentMap = {};
//     feePayments.forEach((p) => {
//       paymentMap[p.feeCategory] = p.amount;
//     });

//     let fees = structures
//       .map((f) => {
//         const category =
//           f.category === "CUSTOM" ? f.customCategoryName : f.category;

//         // ❌ Skip Tuition & Bus here (handled below)
//         if (category === "TuitionFee" || category === "BusFee") return null;

//         // ✅ Override amount if Excel uploaded
//         let amount = f.amount || 0;
//         if (
//           f.category === "CUSTOM" ||
//           f.category === "CondonationFee"
//         ) {
//           amount = paymentMap[f.category] ?? amount;
//         }

//         return { category, amount };
//       })
//       .filter(Boolean);

//     // Tuition & Bus from Student table (unchanged)
//     fees.unshift({
//       category: "TuitionFee",
//       amount: student.TutionFee || 0,
//     });

//     fees.splice(1, 0, {
//       category: "BusFee",
//       amount: student.busFee || 0,
//     });

//     // Payments done (FeeTransaction)
//     const payments = await FeeTransaction.find({
//       htNumber: student.htNumber,
//     });

//     fees = fees.map((f) => {
//       const paid = payments
//         .filter((p) => p.category === f.category)
//         .reduce((sum, p) => sum + p.amountPaid, 0);

//       return {
//         ...f,
//         amountPaid: paid,
//         due: f.amount - paid,
//       };
//     });

//     return res.json({
//       success: true,
//       student: {
//         htNumber: student.htNumber,
//         studentName: student.studentName,
//         branch: student.branch,
//         year: currentYear,
//       },
//       fees,
//     });
//   } catch (err) {
//     console.error("GET FEES ERROR:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



// exports.payFee = async (req, res) => {
//   try {
//     const { htNumber, category, amount } = req.body;

//     if (!htNumber || !category || !amount || amount <= 0) {
//       return res.status(400).json({ success: false, message: "Invalid payment data" });
//     }

//     const student = await Student.findOne({ htNumber: htNumber.toUpperCase().trim() });
//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     const currentYear = calculateCurrentYear(student.admissionDate);

    
//     let totalAmount = 0;
//     if (category === "TuitionFee") totalAmount = student.TutionFee || 0;
//     else if (category === "BusFee") totalAmount = student.busFee || 0;
//     else {
//       const fee = await FeeStructure.findOne({
//         $or: [{ category }, { customCategoryName: category }],
//       });
//       if (!fee) return res.status(400).json({ success: false, message: "Fee category not found" });
//       totalAmount = fee.amount;
//     }

    
//     const paidAgg = await FeeTransaction.aggregate([
//       { $match: { htNumber: student.htNumber, category } },
//       { $group: { _id: null, total: { $sum: "$amountPaid" } } },
//     ]);
//     const alreadyPaid = paidAgg[0]?.total || 0;
//     const due = totalAmount - alreadyPaid;

//     if (amount > due) {
//       return res.status(400).json({
//         success: false,
//         message: `Payment exceeds due amount. Due is ₹${due}`,
//       });
//     }

  
//     await FeeTransaction.create({
//       htNumber: student.htNumber,
//       studentName: student.studentName,
//       branch: student.branch,
//       year: currentYear,
//       category,
//       amountPaid: Number(amount),
//       paymentMode: "CASH",
//     });

//     return res.json({
//       success: true,
//       message: `₹${amount} paid successfully for ${category}`,
//     });
//   } catch (err) {
//     console.error("PAYMENT ERROR:", err);
//     res.status(500).json({ success: false, message: "Payment failed" });
//   }
// };

// exports.getStudentFees = async (req, res) => {
//   try {
//     const { htNumber } = req.params;

//     const student = await Student.findOne({
//       htNumber: htNumber.toUpperCase().trim(),
//     });
//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     const currentYear = calculateCurrentYear(student.admissionDate);

//     const structures = await FeeStructure.find();

//     // 🔹 Get Excel uploaded fee amounts (CUSTOM / CONDONATION)
//     const feePayments = await FeePayment.find({
//       htNumber: student.htNumber,
//     });

//     // ✅ Map payments by feeCategory + customFeeName
//     const paymentMap = {};
//     feePayments.forEach((p) => {
//       if (p.feeCategory === "CUSTOM") {
//         paymentMap[`CUSTOM_${p.customFeeName}`] = p.amount;
//       } else {
//         paymentMap[p.feeCategory] = p.amount;
//       }
//     });

//     let fees = structures
//       .map((f) => {
//         const category =
//           f.category === "CUSTOM" ? f.customCategoryName : f.category;

//         // ❌ Skip Tuition & Bus here (handled below)
//         if (category === "TuitionFee" || category === "BusFee") return null;

//         // ✅ Override amount if Excel uploaded
//         let amount = f.amount || 0;
//         if (f.category === "CUSTOM") {
//           amount = paymentMap[`CUSTOM_${f.customCategoryName}`] ?? amount;
//         } else if (f.category === "CondonationFee") {
//           amount = paymentMap[f.category] ?? amount;
//         }

//         return {
//           category,
//           feeType: f.category, // To know original type for CUSTOM or predefined
//           customFeeName: f.category === "CUSTOM" ? f.customCategoryName : null,
//           amount,
//         };
//       })
//       .filter(Boolean);

//     // Tuition & Bus from Student table (unchanged)
//     fees.unshift({
//       category: "TuitionFee",
//       amount: student.TutionFee || 0,
//       feeType: "TuitionFee",
//     });

//     fees.splice(1, 0, {
//       category: "BusFee",
//       amount: student.busFee || 0,
//       feeType: "BusFee",
//     });

//     // Payments done (FeeTransaction)
//     const payments = await FeeTransaction.find({
//       htNumber: student.htNumber,
//     });

//     fees = fees.map((f) => {
//       const paid = payments
//         .filter((p) => {
//           if (f.feeType === "CUSTOM") return p.category === "CUSTOM" && p.customFeeName === f.customFeeName;
//           return p.category === f.category;
//         })
//         .reduce((sum, p) => sum + p.amountPaid, 0);

//       return {
//         ...f,
//         amountPaid: paid,
//         due: f.amount - paid,
//       };
//     });

//     return res.json({
//       success: true,
//       student: {
//         htNumber: student.htNumber,
//         studentName: student.studentName,
//         branch: student.branch,
//         year: currentYear,
//       },
//       fees,
//     });
//   } catch (err) {
//     console.error("GET FEES ERROR:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.payFee = async (req, res) => {
//   try {
//     const { htNumber, category, amount, customFeeName } = req.body;

//     if (!htNumber || !category || !amount || amount <= 0) {
//       return res.status(400).json({ success: false, message: "Invalid payment data" });
//     }

//     const student = await Student.findOne({ htNumber: htNumber.toUpperCase().trim() });
//     if (!student) {
//       return res.status(404).json({ success: false, message: "Student not found" });
//     }

//     const currentYear = calculateCurrentYear(student.admissionDate);

//     // Determine total amount
//     let totalAmount = 0;

//     if (category === "TuitionFee") totalAmount = student.TutionFee || 0;
//     else if (category === "BusFee") totalAmount = student.busFee || 0;
//     else if (category === "CUSTOM") {
//       if (!customFeeName) {
//         return res.status(400).json({ success: false, message: "customFeeName required for CUSTOM fees" });
//       }

//       // Look for FeePayment record to get amount
//       const feeRecord = await FeePayment.findOne({
//         htNumber: student.htNumber,
//         feeCategory: "CUSTOM",
//         customFeeName,
//         academicYear: currentYear,
//       });

//       if (!feeRecord) {
//         return res.status(400).json({ success: false, message: `Custom fee ${customFeeName} not found` });
//       }

//       totalAmount = feeRecord.amount;
//     } else {
//       // Predefined other fees (ExamFee, UniversityFee, CondonationFee)
//       const fee = await FeeStructure.findOne({
//         $or: [{ category }, { customCategoryName: category }],
//       });
//       if (!fee) return res.status(400).json({ success: false, message: "Fee category not found" });
//       totalAmount = fee.amount;
//     }

//     // Check already paid
//     const paidAgg = await FeeTransaction.aggregate([
//       {
//         $match: {
//           htNumber: student.htNumber,
//           category,
//           ...(category === "CUSTOM" && customFeeName ? { customFeeName } : {}),
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$amountPaid" } } },
//     ]);

//     const alreadyPaid = paidAgg[0]?.total || 0;
//     const due = totalAmount - alreadyPaid;

//     if (amount > due) {
//       return res.status(400).json({
//         success: false,
//         message: `Payment exceeds due amount. Due is ₹${due}`,
//       });
//     }

//     // Create transaction
//     await FeeTransaction.create({
//       htNumber: student.htNumber,
//       studentName: student.studentName,
//       branch: student.branch,
//       year: currentYear,
//       category,
//       amountPaid: Number(amount),
//       paymentMode: "CASH",
//       ...(category === "CUSTOM" && customFeeName ? { customFeeName } : {}),
//     });

//     return res.json({
//       success: true,
//       message: `₹${amount} paid successfully for ${category}${customFeeName ? ` (${customFeeName})` : ""}`,
//     });
//   } catch (err) {
//     console.error("PAYMENT ERROR:", err);
//     res.status(500).json({ success: false, message: "Payment failed" });
//   }
// };


const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");
const FeeTransaction = require("../Models/FeeTransaction");
const FeePayment = require("../Models/FeePayment");

function calculateCurrentYear(admissionDate) {
  const admission = new Date(admissionDate);
  const now = new Date();

  let year = now.getFullYear() - admission.getFullYear();
  if (
    now.getMonth() < admission.getMonth() ||
    (now.getMonth() === admission.getMonth() && now.getDate() < admission.getDate())
  ) {
    year -= 1;
  }

  year = year + 1;
  if (year > 4) year = 4;
  if (year < 1) year = 1;

  return year;
}

// ---------------- GET STUDENT FEES ----------------
exports.getStudentFees = async (req, res) => {
  try {
    const { htNumber } = req.params;

    const student = await Student.findOne({ htNumber: htNumber.toUpperCase().trim() });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const currentYear = calculateCurrentYear(student.admissionDate);
    const structures = await FeeStructure.find();
    const feePayments = await FeePayment.find({ htNumber: student.htNumber });

    // Map Excel/custom payments
    const paymentMap = {};
    feePayments.forEach((p) => {
      if (p.feeCategory === "CUSTOM") paymentMap[`CUSTOM_${p.customFeeName}`] = p.amount;
      else paymentMap[p.feeCategory] = p.amount;
    });

    let fees = structures
      .map((f) => {
        const category = f.category === "CUSTOM" ? f.customCategoryName : f.category;
        if (category === "TuitionFee" || category === "BusFee") return null;

        let amount = f.amount || 0;
        if (f.category === "CUSTOM") amount = paymentMap[`CUSTOM_${f.customCategoryName}`] ?? amount;
        else if (f.category === "CondonationFee") amount = paymentMap[f.category] ?? amount;

        return {
          category,
          feeType: f.category,
          customFeeName: f.category === "CUSTOM" ? f.customCategoryName : null,
          amount,
        };
      })
      .filter(Boolean);

    // Tuition & Bus
    fees.unshift({ category: "TuitionFee", amount: student.TutionFee || 0, feeType: "TuitionFee" });
    fees.splice(1, 0, { category: "BusFee", amount: student.busFee || 0, feeType: "BusFee" });

    // Add paid & due
    const payments = await FeeTransaction.find({ htNumber: student.htNumber });
    fees = fees.map((f) => {
      const paid = payments
        .filter((p) => f.feeType === "CUSTOM" ? (p.category === "CUSTOM" && p.customFeeName === f.customFeeName) : p.category === f.category)
        .reduce((sum, p) => sum + p.amountPaid, 0);

      return { ...f, amountPaid: paid, due: f.amount - paid };
    });

    return res.json({ success: true, student: { htNumber: student.htNumber, studentName: student.studentName, branch: student.branch, year: currentYear }, fees });
  } catch (err) {
    console.error("GET FEES ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- PAY FEE ----------------
// ---------------- PAY FEE ----------------
exports.payFee = async (req, res) => {
  try {
    const { htNumber, category, amount, customFeeName } = req.body;

    if (!htNumber || !category || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment data" });
    }

    const student = await Student.findOne({ htNumber: htNumber.toUpperCase().trim() });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const currentYear = calculateCurrentYear(student.admissionDate);

    // Calculate total amount based on category
    let totalAmount = 0;

    if (category === "TuitionFee") {
      totalAmount = student.TutionFee || 0; // keep original field name
    } else if (category === "BusFee") {
      totalAmount = student.busFee || 0;
    } else if (category === "CUSTOM") {
      if (!customFeeName) {
        return res.status(400).json({ success: false, message: "customFeeName required for CUSTOM fees" });
      }

      const feeRecord = await FeePayment.findOne({
        htNumber: student.htNumber,
        feeCategory: "CUSTOM",
        customFeeName,
        academicYear: currentYear,
      });

      if (!feeRecord) {
        return res.status(400).json({ success: false, message: `Custom fee ${customFeeName} not found` });
      }

      totalAmount = feeRecord.amount;
    } else {
      // Other fees from FeeStructure
      const fee = await FeeStructure.findOne({
        $or: [{ category }, { customCategoryName: category }],
      });

      if (!fee) return res.status(400).json({ success: false, message: "Fee category not found" });

      totalAmount = fee.amount;
    }

    // Calculate already paid
    const paidAgg = await FeeTransaction.aggregate([
      {
        $match: {
          htNumber: student.htNumber,
          category,
          ...(category === "CUSTOM" && customFeeName ? { customFeeName } : {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);

    const alreadyPaid = paidAgg[0]?.total || 0;
    const due = totalAmount - alreadyPaid;

    if (amount > due) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds due amount. Due is ₹${due}`,
      });
    }

    // Save transaction
    await FeeTransaction.create({
      htNumber: student.htNumber,
      studentName: student.studentName,
      branch: student.branch,
      year: currentYear,
      category,
      amountPaid: Number(amount),
      paymentMode: "CASH",
      ...(category === "CUSTOM" && customFeeName ? { customFeeName } : {}),
    });

    return res.json({
      success: true,
      message: `₹${amount} paid successfully for ${category}${customFeeName ? ` (${customFeeName})` : ""}`,
    });

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
};
