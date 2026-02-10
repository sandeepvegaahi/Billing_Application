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
//     (now.getMonth() === admission.getMonth() &&
//       now.getDate() < admission.getDate())
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
//     if (!student)
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });

//     const currentYear = calculateCurrentYear(student.admissionDate);
//     const structures = await FeeStructure.find();
//     const feePayments = await FeePayment.find({ htNumber: student.htNumber });

//     const paymentMap = {};
//     feePayments.forEach((p) => {
//       if (p.feeCategory === "CUSTOM" && p.customFeeName) {
//         paymentMap[`CUSTOM_${p.customFeeName}`] = p.amount;
//       } else {
//         paymentMap[p.feeCategory] = p.amount;
//       }
//     });

//     let fees = structures
//       .map((f) => {
//         const category =
//           f.category === "CUSTOM" ? f.customCategoryName : f.category;
//         if (category === "TuitionFee" || category === "BusFee") return null;

//         let amount = f.amount || 0;
//         if (f.category === "CUSTOM") {
//           amount = paymentMap[`CUSTOM_${f.customCategoryName}`] ?? amount;
//         } else if (f.category === "CondonationFee") {
//           amount = paymentMap["CondonationFee"] ?? amount;
//         }

//         return {
//           category,
//           feeType: f.category,
//           customFeeName: f.category === "CUSTOM" ? f.customCategoryName : null,
//           amount,
//         };
//       })
//       .filter(Boolean);

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

//     const payments = await FeeTransaction.find({ htNumber: student.htNumber });
//     fees = fees.map((f) => {
//       const paid = payments
//         .filter((p) =>
//           f.feeType === "CUSTOM"
//             ? p.category === "CUSTOM" && p.customFeeName === f.customFeeName
//             : p.category === f.category,
//         )
//         .reduce((sum, p) => sum + p.amountPaid, 0);

//       return { ...f, amountPaid: paid, due: f.amount - paid };
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
//     console.log("========= PAY FEE DEBUG =========");
//     console.log("REQ BODY:", JSON.stringify(req.body, null, 2));
//     if (!htNumber || !category || !amount || amount <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid payment data" });
//     }

//     const student = await Student.findOne({
//       htNumber: htNumber.toUpperCase().trim(),
//     });
//     if (!student) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });
//     }

//     const currentYear = calculateCurrentYear(student.admissionDate);

//     let totalAmount = 0;

//     if (category === "TuitionFee") {
//       totalAmount = student.TutionFee || 0;
//     } else if (category === "BusFee") {
//       totalAmount = student.busFee || 0;
//     } else if (category === "CondonationFee") {
//       // Fetch assigned fee for student
//       const feeRecord = await FeePayment.findOne({
//         htNumber: student.htNumber,
//         feeCategory: "CondonationFee",
//       });

//       // Aggregate already paid amount
//       const paidAgg = await FeeTransaction.aggregate([
//         {
//           $match: {
//             htNumber: student.htNumber,
//             category: "CondonationFee",
//           },
//         },
//         { $group: { _id: null, total: { $sum: "$amountPaid" } } },
//       ]);

//       const alreadyPaid = paidAgg[0]?.total || 0;

//       // Handle case when fee is not assigned but some payment exists
//       if (!feeRecord) {
//         if (alreadyPaid > 0) {
//           return res.status(400).json({
//             success: false,
//             message: `Condonation fee not assigned, but student already paid ₹${alreadyPaid}`,
//           });
//         } else {
//           return res.status(400).json({
//             success: false,
//             message: "Condonation fee not assigned to this student",
//           });
//         }
//       }

//       const totalAmount = feeRecord.amount ?? 0;
//       const due = Math.max(totalAmount - alreadyPaid, 0);

//       if (amount > due) {
//         return res.status(400).json({
//           success: false,
//           message: `Payment exceeds due amount. Due is ₹${due}`,
//         });
//       }

//       // Save the payment
//       await FeeTransaction.create({
//         htNumber: student.htNumber,
//         studentName: student.studentName,
//         branch: student.branch,
//         year: currentYear,
//         category: "CondonationFee",
//         amountPaid: Number(amount),
//         paymentMode: "CASH",
//       });

//       return res.json({
//         success: true,
//         message: `₹${amount} paid successfully for CondonationFee`,
//       });
//     } else if (category === "CUSTOM") {
//       if (!customFeeName) {
//         return res.status(400).json({
//           success: false,
//           message: "customFeeName required for CUSTOM fees",
//         });
//       }

//       const normalizedCustomFeeName = customFeeName.trim();

//       const feeRecord = await FeePayment.findOne({
//         htNumber: student.htNumber,
//         feeCategory: "CUSTOM",
//         customFeeName: normalizedCustomFeeName,
//       });
//       if (!feeRecord) {
//         // No fee assigned yet, but check if student already paid
//         const paidAgg = await FeeTransaction.aggregate([
//           {
//             $match: {
//               htNumber: student.htNumber,
//               category: "CondonationFee",
//             },
//           },
//           { $group: { _id: null, total: { $sum: "$amountPaid" } } },
//         ]);

//         const alreadyPaid = paidAgg[0]?.total || 0;

//         if (alreadyPaid > 0) {
//           return res.status(400).json({
//             success: false,
//             message: `Condonation fee not assigned, but student already paid ₹${alreadyPaid}`,
//           });
//         }

//         return res.status(400).json({
//           success: false,
//           message: "Condonation fee not assigned to this student",
//         });
//       }

//       totalAmount = feeRecord.amount ?? 0;

//       // Ensure totalAmount is at least alreadyPaid
//       const paidAgg = await FeeTransaction.aggregate([
//         {
//           $match: {
//             htNumber: student.htNumber,
//             category: "CondonationFee",
//           },
//         },
//         { $group: { _id: null, total: { $sum: "$amountPaid" } } },
//       ]);

//       const alreadyPaid = paidAgg[0]?.total || 0;
//       const due = Math.max(totalAmount - alreadyPaid, 0);
//     } else {
//       const fee = await FeeStructure.findOne({
//         $or: [{ category }, { customCategoryName: category }],
//       });

//       if (!fee) {
//         return res.status(400).json({
//           success: false,
//           message: "Fee category not found",
//         });
//       }

//       totalAmount = fee.amount;
//     }

//     const paidAgg = await FeeTransaction.aggregate([
//       {
//         $match: {
//           htNumber: student.htNumber,
//           category,
//           ...(category === "CUSTOM" ? { customFeeName } : {}),
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
//       message: `₹${amount} paid successfully for ${category}${
//         customFeeName ? ` (${customFeeName})` : ""
//       }`,
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
    (now.getMonth() === admission.getMonth() &&
      now.getDate() < admission.getDate())
  ) {
    year -= 1;
  }

  year = year + 1;
  if (year > 4) year = 4;
  if (year < 1) year = 1;

  return year;
}

function getAcademicYear(admissionDate) {
  const now = new Date();

  let startYear =
    now.getMonth() >= 5 // June = 5
      ? now.getFullYear()
      : now.getFullYear() - 1;

  let endYear = startYear + 1;

  return `${startYear}-${endYear}`;
}

exports.getStudentFees = async (req, res) => {
  try {
    const { htNumber } = req.params;

    const student = await Student.findOne({
      htNumber: htNumber.toUpperCase().trim(),
    });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const currentYear = calculateCurrentYear(student.admissionDate);
    const structures = await FeeStructure.find();
    const feePayments = await FeePayment.find({ htNumber: student.htNumber });

    const paymentMap = {};
    feePayments.forEach((p) => {
      if (p.feeCategory === "CUSTOM" && p.customFeeName) {
        paymentMap[`CUSTOM_${p.customFeeName}`] = p.amount;
      } else {
        paymentMap[p.feeCategory] = p.amount;
      }
    });

    let fees = structures
      .map((f) => {
        const category =
          f.category === "CUSTOM" ? f.customCategoryName : f.category;
        if (category === "TuitionFee" || category === "BusFee") return null;

        let amount = f.amount || 0;
        if (f.category === "CUSTOM") {
          amount = paymentMap[`CUSTOM_${f.customCategoryName}`] ?? amount;
        } else if (f.category === "CondonationFee") {
          amount = paymentMap["CondonationFee"] ?? amount;
        }

        return {
          category,
          feeType: f.category,
          customFeeName: f.category === "CUSTOM" ? f.customCategoryName : null,
          amount,
        };
      })
      .filter(Boolean);

    fees.unshift({
      category: "TuitionFee",
      amount: student.TutionFee || 0,
      feeType: "TuitionFee",
    });
    fees.splice(1, 0, {
      category: "BusFee",
      amount: student.busFee || 0,
      feeType: "BusFee",
    });

    /* ✅ FIX: Filter payments by current academic year */
    const payments = await FeeTransaction.find({
      htNumber: student.htNumber,
      year: currentYear,
    });

    fees = fees.map((f) => {
      const paid = payments
        .filter((p) =>
          f.feeType === "CUSTOM"
            ? p.category === "CUSTOM" && p.customFeeName === f.customFeeName
            : p.category === f.category,
        )
        .reduce((sum, p) => sum + p.amountPaid, 0);

      return { ...f, amountPaid: paid, due: f.amount - paid };
    });

    return res.json({
      success: true,
      student: {
        htNumber: student.htNumber,
        studentName: student.studentName,
        branch: student.branch,
        year: currentYear,
      },
      fees,
    });
  } catch (err) {
    console.error("GET FEES ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.payFee = async (req, res) => {
//   try {
//     const { htNumber, category, amount, customFeeName } = req.body;

//     if (!htNumber || !category || !amount || amount <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid payment data" });
//     }

//     const student = await Student.findOne({
//       htNumber: htNumber.toUpperCase().trim(),
//     });
//     if (!student) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });
//     }

//     const currentYear = calculateCurrentYear(student.admissionDate);
//     let totalAmount = 0;

//     if (category === "TuitionFee") {
//       totalAmount = student.TutionFee || 0;
//     } else if (category === "BusFee") {
//       totalAmount = student.busFee || 0;
//     } else if (category === "CondonationFee") {
//       const feeRecord = await FeePayment.findOne({
//         htNumber: student.htNumber,
//         feeCategory: "CondonationFee",
//       });

//       const paidAgg = await FeeTransaction.aggregate([
//         {
//           $match: {
//             htNumber: student.htNumber,
//             category: "CondonationFee",
//             year: currentYear, // ✅ FIX
//           },
//         },
//         { $group: { _id: null, total: { $sum: "$amountPaid" } } },
//       ]);

//       const alreadyPaid = paidAgg[0]?.total || 0;

//       if (!feeRecord) {
//         if (alreadyPaid > 0) {
//           return res.status(400).json({
//             success: false,
//             message: `Condonation fee not assigned, but student already paid ₹${alreadyPaid}`,
//           });
//         } else {
//           return res.status(400).json({
//             success: false,
//             message: "Condonation fee not assigned to this student",
//           });
//         }
//       }

//       totalAmount = feeRecord.amount ?? 0;
//       const due = Math.max(totalAmount - alreadyPaid, 0);

//       if (amount > due) {
//         return res.status(400).json({
//           success: false,
//           message: `Payment exceeds due amount. Due is ₹${due}`,
//         });
//       }

//       await FeeTransaction.create({
//         htNumber: student.htNumber,
//         studentName: student.studentName,
//         branch: student.branch,
//         year: currentYear,
//         category: "CondonationFee",
//         amountPaid: Number(amount),
//         paymentMode: "CASH",
//       });

//       return res.json({
//         success: true,
//         message: `₹${amount} paid successfully for CondonationFee`,
//       });
//     } else if (category === "CUSTOM") {
//       const normalizedCustomFeeName = customFeeName.trim();

//       const feeRecord = await FeePayment.findOne({
//         htNumber: student.htNumber,
//         feeCategory: "CUSTOM",
//         customFeeName: normalizedCustomFeeName,
//       });

//       if (!feeRecord) {
//         return res.status(400).json({
//           success: false,
//           message: "Custom fee not assigned to this student",
//         });
//       }

//       totalAmount = feeRecord.amount ?? 0;

//       const paidAgg = await FeeTransaction.aggregate([
//         {
//           $match: {
//             htNumber: student.htNumber,
//             category: "CUSTOM",
//             customFeeName: normalizedCustomFeeName,
//             year: currentYear, // ✅ FIX
//           },
//         },
//         { $group: { _id: null, total: { $sum: "$amountPaid" } } },
//       ]);

//       const alreadyPaid = paidAgg[0]?.total || 0;
//       const due = totalAmount - alreadyPaid;

//       if (amount > due) {
//         return res.status(400).json({
//           success: false,
//           message: `Payment exceeds due amount. Due is ₹${due}`,
//         });
//       }
//     } else {
//       const fee = await FeeStructure.findOne({
//         $or: [{ category }, { customCategoryName: category }],
//       });

//       if (!fee) {
//         return res.status(400).json({
//           success: false,
//           message: "Fee category not found",
//         });
//       }

//       totalAmount = fee.amount;
//     }

//     const paidAgg = await FeeTransaction.aggregate([
//       {
//         $match: {
//           htNumber: student.htNumber,
//           category,
//           ...(category === "CUSTOM" ? { customFeeName } : {}),
//           year: currentYear, // ✅ FIX
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
//       message: `₹${amount} paid successfully for ${category}${
//         customFeeName ? ` (${customFeeName})` : ""
//       }`,
//     });
//   } catch (err) {
//     console.error("PAYMENT ERROR:", err);
//     res.status(500).json({ success: false, message: "Payment failed" });
//   }
// };

exports.payFee = async (req, res) => {
  try {
    const { htNumber, category, amount, customFeeName } = req.body;

    if (!htNumber || !category || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment data" });
    }

    const student = await Student.findOne({
      htNumber: htNumber.toUpperCase().trim(),
    });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const currentYear = calculateCurrentYear(student.admissionDate);
    const academicYear = getAcademicYear(student.admissionDate);

    let totalAmount = 0;

    if (category === "TuitionFee") {
      totalAmount = student.TutionFee || 0;
    } else if (category === "BusFee") {
      totalAmount = student.busFee || 0;
    } else if (category === "CondonationFee") {
      const feeRecord = await FeePayment.findOne({
        htNumber: student.htNumber,
        feeCategory: "CondonationFee",
      });

      const paidAgg = await FeeTransaction.aggregate([
        {
          $match: {
            htNumber: student.htNumber,
            category: "CondonationFee",
            year: currentYear,
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]);

      const alreadyPaid = paidAgg[0]?.total || 0;

      if (!feeRecord) {
        if (alreadyPaid > 0) {
          return res.status(400).json({
            success: false,
            message: `Condonation fee not assigned, but student already paid ₹${alreadyPaid}`,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Condonation fee not assigned to this student",
          });
        }
      }

      totalAmount = feeRecord.amount ?? 0;
    } else if (category === "CUSTOM") {
      const normalizedCustomFeeName = customFeeName.trim();

      const feeRecord = await FeePayment.findOne({
        htNumber: student.htNumber,
        feeCategory: "CUSTOM",
        customFeeName: normalizedCustomFeeName,
      });

      if (!feeRecord) {
        return res.status(400).json({
          success: false,
          message: "Custom fee not assigned to this student",
        });
      }

      totalAmount = feeRecord.amount ?? 0;
    } else {
      const fee = await FeeStructure.findOne({
        $or: [{ category }, { customCategoryName: category }],
      });

      if (!fee) {
        return res.status(400).json({
          success: false,
          message: "Fee category not found",
        });
      }

      totalAmount = fee.amount;
    }

    const paidAgg = await FeeTransaction.aggregate([
      {
        $match: {
          htNumber: student.htNumber,
          category,
          ...(category === "CUSTOM"
            ? { customFeeName: customFeeName?.trim() }
            : {}),
          year: currentYear,
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

    await FeeTransaction.create({
      htNumber: student.htNumber,
      studentName: student.studentName,
      branch: student.branch,
      year: currentYear,
      academicYear,
      category,
      amountPaid: Number(amount),
      paymentMode: "CASH",
      ...(category === "CUSTOM" && customFeeName ? { customFeeName } : {}),
    });

    return res.json({
      success: true,
      message: `₹${amount} paid successfully for ${category}${
        customFeeName ? ` (${customFeeName})` : ""
      }`,
    });
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
};
