
// const XLSX = require("xlsx");
// const fs = require("fs");
// const Student = require("../Models/StudentBulk");
// const FeePayment = require("../Models/FeePayment");

// /* ---------- Helpers ---------- */
// const normalizeRow = (row) => {
//   const normalized = {};
//   Object.keys(row).forEach((key) => {
//     const cleanKey = key.replace(/\s+/g, "").toLowerCase();
//     normalized[cleanKey] = row[key];
//   });
//   return normalized;
// };

// const extractNumber = (value) => {
//   if (value === undefined || value === null || value === "") return undefined;
//   const num = String(value).replace(/[^0-9]/g, "");
//   return num ? Number(num) : undefined;
// };

// const normalizeAcademicYear = (value) => {
//   if (!value) return undefined;
//   const v = String(value).toLowerCase();
//   if (v.includes("1")) return 1;
//   if (v.includes("2")) return 2;
//   if (v.includes("3")) return 3;
//   if (v.includes("4")) return 4;
//   return undefined;
// };

// const normalizeName = (name) =>
//   String(name || "").trim().replace(/\s+/g, " ").toLowerCase();

// /* ---------- Controller ---------- */
// exports.bulkUploadFeePayments = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Excel file required" });
//     }

//     const { feeCategory } = req.body;
//     if (!feeCategory) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Fee category required" });
//     }

//     const workbook = XLSX.readFile(req.file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

//     let updated = 0;
//     let inserted = 0;
//     const failedRows = [];

//     const predefinedFees = [
//       "TuitionFee",
//       "BusFee",
//       "ExamFee",
//       "UniversityFee",
//       "CondonationFee",
//     ];

//     let feeCategoryDB = feeCategory;
//     let customFeeName = null;

//     if (!predefinedFees.includes(feeCategory)) {
//       feeCategoryDB = "CUSTOM";
//       customFeeName = feeCategory;
//     }

//     for (let i = 0; i < rows.length; i++) {
//       try {
//         const row = normalizeRow(rows[i]);

//         if (!row.htnumber) throw new Error("HT Number missing");

//         const htNumber = String(row.htnumber).trim().toUpperCase();
//         const studentNameExcel = normalizeName(row.studentname);
//         const amount = extractNumber(row.amount);
//         const academicYear = normalizeAcademicYear(row.academicyear);

//         if (!studentNameExcel) throw new Error("Student name missing");
//         if (amount === undefined || amount <= 0)
//           throw new Error("Invalid or missing amount");
//         if (!academicYear) throw new Error("Academic year invalid");

//         const student = await Student.findOne({ htNumber });
//         if (!student) throw new Error("HT Number not found");

//         const studentNameDB = normalizeName(student.studentName);
//         if (studentNameDB !== studentNameExcel)
//           throw new Error("HT Number or Name mismatch");

//         // ---------- Predefined Fees ----------
//         if (["BusFee", "TuitionFee"].includes(feeCategory)) {
//           const field = feeCategory === "BusFee" ? "busFee" : "TutionFee";

//           await Student.updateOne({ htNumber }, { $set: { [field]: amount } });

//           await FeePayment.updateOne(
//             { htNumber, feeCategory, academicYear },
//             {
//               $set: {
//                 student: student._id,
//                 studentName: student.studentName,
//                 feeCategory,
//                 amount,
//                 paymentMode: "EXCEL",
//               },
//             },
//             { upsert: true },
//           );

//           updated++;
//           continue;
//         }

//         // ---------- Custom / Condonation / Other Fees ----------
//         const exists = await FeePayment.findOne({
//           htNumber,
//           academicYear,
//           feeCategory: feeCategoryDB,
//           customFeeName,
//         });

//         const fieldName =
//           feeCategory === "CondonationFee"
//             ? "CondonationFee"
//             : customFeeName?.replace(/\s+/g, "");

//         if (exists) {
//           await FeePayment.updateOne(
//             {
//               htNumber,
//               academicYear,
//               feeCategory: feeCategoryDB,
//               customFeeName,
//             },
//             { $set: { amount, paymentMode: "EXCEL" } },
//           );

//           if (fieldName) {
//             await Student.updateOne({ htNumber }, { $set: { [fieldName]: amount } });
//           }

//           updated++;
//           continue;
//         }

//         // Create new fee payment
//         await FeePayment.create({
//           student: student._id,
//           studentName: student.studentName,
//           htNumber,
//           academicYear,
//           feeCategory: feeCategoryDB,
//           customFeeName,
//           amount,
//           paymentMode: "EXCEL",
//         });

//         if (fieldName) {
//           await Student.updateOne({ htNumber }, { $set: { [fieldName]: amount } });
//         }

//         inserted++;
//       } catch (err) {
//         failedRows.push({ row: i + 2, error: err.message });
//       }
//     }

//     fs.unlinkSync(req.file.path);

//     return res.json({
//       success: true,
//       updated,
//       inserted,
//       failed: failedRows.length,
//       failedRows,
//       message: "Upload processed successfully",
//     });
//   } catch (err) {
//     console.error("BULK FEE UPLOAD ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// /* ---------- Pay Fee Backend Fix ---------- */
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
//     if (!student) return res.status(404).json({ success: false, message: "Student not found" });

//     let totalAmount = 0;

//     if (category === "TuitionFee") totalAmount = student.TutionFee || 0;
//     else if (category === "BusFee") totalAmount = student.busFee || 0;
//     else {
//       const feeRecord = await FeePayment.findOne({
//         htNumber: student.htNumber,
//         feeCategory: category === "CUSTOM" ? "CUSTOM" : category,
//         ...(category === "CUSTOM" ? { customFeeName } : {}),
//       });

//       if (!feeRecord || feeRecord.amount === undefined) {
//         return res.status(400).json({
//           success: false,
//           message: `Fee record not found or amount missing for ${category}${customFeeName ? ` (${customFeeName})` : ""}`,
//         });
//       }

//       totalAmount = feeRecord.amount;
//     }

//     // Aggregate already paid
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
//     const due = Math.max(0, totalAmount - alreadyPaid);

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


const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");
const FeePayment = require("../Models/FeePayment");
const FeeTransaction = require("../Models/FeeTransaction");

/* ---------- Helpers ---------- */
const normalizeRow = (row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    const cleanKey = key.replace(/\s+/g, "").toLowerCase();
    normalized[cleanKey] = row[key];
  });
  return normalized;
};

const extractNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = String(value).replace(/[^0-9]/g, "");
  return num ? Number(num) : undefined;
};

const normalizeAcademicYear = (value) => {
  if (!value) return undefined;
  const v = String(value).toLowerCase();
  if (v.includes("1")) return "1st Year";
  if (v.includes("2")) return "2nd Year";
  if (v.includes("3")) return "3rd Year";
  if (v.includes("4")) return "4th Year";
  return undefined;
};

const normalizeName = (name) =>
  String(name || "").trim().replace(/\s+/g, " ").toLowerCase();

/* ---------- Controller: Bulk Upload Fee Payments ---------- */
exports.bulkUploadFeePayments = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required" });

    const { feeCategory } = req.body;
    if (!feeCategory) return res.status(400).json({ message: "Fee category required" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let updated = 0;
    let inserted = 0;
    const failedRows = [];

    const predefinedFees = ["TuitionFee", "BusFee", "ExamFee", "UniversityFee", "CondonationFee"];
    const feeCategoryDB = predefinedFees.includes(feeCategory) ? feeCategory : "CUSTOM";
    const customFeeName = feeCategoryDB === "CUSTOM" ? feeCategory : null;

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = normalizeRow(rows[i]);
        if (!row.htnumber) throw new Error("HT Number missing");

        const htNumber = String(row.htnumber).trim().toUpperCase();
        const studentNameExcel = normalizeName(row.studentname);
        const amount = extractNumber(row.amount);
        const academicYear = normalizeAcademicYear(row.academicyear);

        if (!studentNameExcel) throw new Error("Student name missing");
        if (amount === undefined || amount <= 0) throw new Error("Invalid or missing amount");
        if (!academicYear) throw new Error("Academic year invalid");

        const student = await Student.findOne({ htNumber });
        if (!student) throw new Error("HT Number not found");

        const studentNameDB = normalizeName(student.studentName);
        if (studentNameDB !== studentNameExcel) throw new Error("HT Number or Name mismatch");

        // Predefined Fees
        if (["BusFee", "TuitionFee"].includes(feeCategory)) {
          const field = feeCategory === "BusFee" ? "busFee" : "TutionFee";

          await Student.updateOne({ htNumber }, { $set: { [field]: amount } });

          await FeePayment.updateOne(
            { htNumber, feeCategory, academicYear },
            {
              $set: {
                student: student._id,
                studentName: student.studentName,
                feeCategory,
                amount,
                paymentMode: "EXCEL",
              },
            },
            { upsert: true }
          );

          updated++;
          continue;
        }

        // Custom / Condonation / Other Fees
        const exists = await FeePayment.findOne({
          htNumber,
          academicYear,
          feeCategory: feeCategoryDB,
          customFeeName,
        });

        const fieldName = feeCategory === "CondonationFee" ? "CondonationFee" : customFeeName?.replace(/\s+/g, "");

        if (exists) {
          await FeePayment.updateOne(
            { htNumber, academicYear, feeCategory: feeCategoryDB, customFeeName },
            { $set: { amount, paymentMode: "EXCEL" } }
          );

          if (fieldName) await Student.updateOne({ htNumber }, { $set: { [fieldName]: amount } });

          updated++;
          continue;
        }

        // Insert new
        await FeePayment.create({
          student: student._id,
          studentName: student.studentName,
          htNumber,
          academicYear,
          feeCategory: feeCategoryDB,
          customFeeName,
          amount,
          paymentMode: "EXCEL",
        });

        if (fieldName) await Student.updateOne({ htNumber }, { $set: { [fieldName]: amount } });

        inserted++;
      } catch (err) {
        failedRows.push({ row: i + 2, error: err.message });
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({ success: true, updated, inserted, failed: failedRows.length, failedRows });
  } catch (err) {
    console.error("BULK FEE UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



