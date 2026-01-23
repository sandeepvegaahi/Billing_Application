// // const XLSX = require("xlsx");
// // const fs = require("fs");
// // const Student = require("../Models/StudentBulk");
// // const FeePayment = require("../Models/FeePayment");


// // const normalizeRow = (row) => {
// //   const normalized = {};
// //   Object.keys(row).forEach((key) => {
// //     const cleanKey = key.replace(/\s+/g, "").toLowerCase();
// //     normalized[cleanKey] = row[key];
// //   });
// //   return normalized;
// // };

// // const extractNumber = (value) => {
// //   if (value === undefined || value === null || value === "") return undefined;
// //   const num = String(value).replace(/[^0-9]/g, "");
// //   return num ? Number(num) : undefined;
// // };

// // const normalizeAcademicYear = (value) => {
// //   if (!value) return undefined;
// //   const v = String(value).toLowerCase();
// //   if (v.includes("1")) return 1;
// //   if (v.includes("2")) return 2;
// //   if (v.includes("3")) return 3;
// //   if (v.includes("4")) return 4;
// //   return undefined;
// // };

// // const normalizeName = (name) =>
// //   String(name || "").trim().replace(/\s+/g, " ").toLowerCase();

// // exports.bulkUploadFeePayments = async (req, res) => {
// //   try {
// //     if (!req.file)
// //       return res.status(400).json({ success: false, message: "Excel file required" });

// //     const { feeCategory } = req.body;
// //     if (!feeCategory)
// //       return res.status(400).json({ success: false, message: "Fee category required" });

// //     const workbook = XLSX.readFile(req.file.path);
// //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
// //     const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

// //     let updated = 0;
// //     let inserted = 0;
// //     const failedRows = [];
// //     const skippedRows = [];

// //     for (let i = 0; i < rows.length; i++) {
// //       try {
// //         const row = normalizeRow(rows[i]);
// //         if (!row.htnumber) throw new Error("HT Number missing");

// //         const htNumber = String(row.htnumber).trim().toUpperCase();
// //         const studentNameExcel = normalizeName(row.studentname);
// //         const amount = extractNumber(row.amount);
// //         const academicYear = normalizeAcademicYear(row.academicyear);

// //         if (!studentNameExcel) throw new Error("Student name missing");
// //         if (amount === undefined) throw new Error("Amount missing");
// //         if (!academicYear) throw new Error("Academic year invalid");

// //         const student = await Student.findOne({ htNumber });
// //         if (!student) throw new Error("HT Number not found in Student table");

// //         const studentNameDB = normalizeName(student.studentName);
// //         if (studentNameDB !== studentNameExcel)
// //           throw new Error("HT Number or Name mismatch with Student table");

       
// //         if (feeCategory === "BusFee" || feeCategory === "TuitionFee") {
// //           const updateField = feeCategory === "BusFee" ? "busFee" : "TutionFee";

          
// //           await Student.updateOne({ htNumber }, { $set: { [updateField]: amount } });

         
// //           await FeePayment.updateOne(
// //             { htNumber, feeCategory, academicYear },
// //             { $set: { student: student._id, amount, studentName: student.studentName, paymentMode: "EXCEL" } },
// //             { upsert: true } 
// //           );

// //           updated++;
// //           continue;
// //         }

       
// //         const existingFee = await FeePayment.findOne({ htNumber, feeCategory, academicYear });
// //         if (existingFee) {
// //           skippedRows.push(i + 2);
// //           continue;
// //         }

// //         await FeePayment.create({
// //           student: student._id,
// //           htNumber,
// //           studentName: student.studentName,
// //           academicYear,
// //           feeCategory,
// //           amount,
// //           paymentMode: "EXCEL",
// //         });

// //         inserted++;
// //       } catch (err) {
// //         failedRows.push({ row: i + 2, error: err.message });
// //       }
// //     }

// //     fs.unlinkSync(req.file.path);

    
// //     const messages = [];
// //     if (updated > 0) messages.push(`Updated Bus/Tuition fees for ${updated} student(s).`);
// //     if (inserted > 0) messages.push(`Inserted ${inserted} new fee record(s).`);
// //     if (skippedRows.length > 0) messages.push(`Skipped ${skippedRows.length} existing record(s).`);
// //     if (failedRows.length > 0) messages.push(`Failed rows: ${failedRows.map(f => f.row).join(", ")}`);
// //     if (inserted === 0 && updated === 0 && failedRows.length === 0)
// //       messages.push("No new records to add or update.");

// //     return res.json({
// //       success: true,
// //       updated,
// //       inserted,
// //       skipped: skippedRows.length,
// //       failed: failedRows.length,
// //       failedRows,
// //       alertType: failedRows.length > 0 ? "warning" : "success",
// //       message: messages.join("\n"),
// //     });

// //   } catch (err) {
// //     console.error("BULK FEE UPLOAD ERROR:", err);
// //     return res.status(500).json({
// //       success: false,
// //       alertType: "error",
// //       message: err.message,
// //     });
// //   }
// // };

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
//       return res.status(400).json({ success: false, message: "Excel file required" });
//     }

//     const { feeCategory } = req.body;
//     if (!feeCategory) {
//       return res.status(400).json({ success: false, message: "Fee category required" });
//     }

//     const workbook = XLSX.readFile(req.file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

//     let updated = 0;
//     let inserted = 0;
//     const failedRows = [];
//     const skippedRows = [];

//     // ENUM SAFE LIST
//     const predefinedFees = [
//       "TuitionFee",
//       "BusFee",
//       "ExamFee",
//       "UniversityFee",
//       "CondonationFee",
//     ];

//     // Decide DB values
//     let feeCategoryDB = feeCategory;
//     let customFeeName = null;

//     if (!predefinedFees.includes(feeCategory)) {
//       feeCategoryDB = "CUSTOM";
//       customFeeName = feeCategory; // HostleFee / any name
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
//         if (amount === undefined) throw new Error("Amount missing");
//         if (!academicYear) throw new Error("Academic year invalid");

//         const student = await Student.findOne({ htNumber });
//         if (!student) throw new Error("HT Number not found");

//         const studentNameDB = normalizeName(student.studentName);
//         if (studentNameDB !== studentNameExcel)
//           throw new Error("HT Number or Name mismatch");

//         /* ---------- Bus / Tuition (UNCHANGED) ---------- */
//         if (feeCategory === "BusFee" || feeCategory === "TuitionFee") {
//           const updateField =
//             feeCategory === "BusFee" ? "busFee" : "TutionFee";

//           await Student.updateOne(
//             { htNumber },
//             { $set: { [updateField]: amount } }
//           );

//           await FeePayment.updateOne(
//             { htNumber, feeCategory, academicYear },
//             {
//               $set: {
//                 student: student._id,
//                 studentName: student.studentName,
//                 amount,
//                 feeCategory,
//                 paymentMode: "EXCEL",
//               },
//             },
//             { upsert: true }
//           );

//           updated++;
//           continue;
//         }

//         /* ---------- CUSTOM / OTHER FEES ---------- */
//         const exists = await FeePayment.findOne({
//   htNumber,
//   academicYear,
//   feeCategory: "CUSTOM",
//   customFeeName: {
//     $eq: customFeeName,
//   },
// });


//         if (exists) {
//           skippedRows.push(i + 2);
//           continue;
//         }

//         await FeePayment.create({
//           student: student._id,
//           studentName: student.studentName,
//           htNumber,
//           academicYear,
//           feeCategory: feeCategoryDB,   // ENUM SAFE
//           customFeeName,                // HostleFee
//           amount,
//           paymentMode: "EXCEL",
//         });

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
//       skipped: skippedRows.length,
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

const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");
const FeePayment = require("../Models/FeePayment");

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
  if (v.includes("1")) return 1;
  if (v.includes("2")) return 2;
  if (v.includes("3")) return 3;
  if (v.includes("4")) return 4;
  return undefined;
};

const normalizeName = (name) =>
  String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/* ---------- Controller ---------- */
exports.bulkUploadFeePayments = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Excel file required" });
    }

    const { feeCategory } = req.body;
    if (!feeCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Fee category required" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let updated = 0;
    let inserted = 0;
    const failedRows = [];
    const skippedRows = [];

    // ENUM SAFE LIST
    const predefinedFees = [
      "TuitionFee",
      "BusFee",
      "ExamFee",
      "UniversityFee",
      "CondonationFee",
    ];

    // Decide DB values
    let feeCategoryDB = feeCategory;
    let customFeeName = null;

    if (!predefinedFees.includes(feeCategory)) {
      feeCategoryDB = "CUSTOM";
      customFeeName = feeCategory; // HostelFee / Library / Event / etc
    }

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = normalizeRow(rows[i]);

        if (!row.htnumber) throw new Error("HT Number missing");

        const htNumber = String(row.htnumber).trim().toUpperCase();
        const studentNameExcel = normalizeName(row.studentname);
        const amount = extractNumber(row.amount);
        const academicYear = normalizeAcademicYear(row.academicyear);

        if (!studentNameExcel) throw new Error("Student name missing");
        if (amount === undefined) throw new Error("Amount missing");
        if (!academicYear) throw new Error("Academic year invalid");

        const student = await Student.findOne({ htNumber });
        if (!student) throw new Error("HT Number not found");

        const studentNameDB = normalizeName(student.studentName);
        if (studentNameDB !== studentNameExcel)
          throw new Error("HT Number or Name mismatch");

        /* ---------- Bus / Tuition (UNCHANGED) ---------- */
        if (feeCategory === "BusFee" || feeCategory === "TuitionFee") {
          const updateField = feeCategory === "BusFee" ? "busFee" : "TutionFee";

          await Student.updateOne({ htNumber }, { $set: { [updateField]: amount } });

          await FeePayment.updateOne(
            { htNumber, feeCategory, academicYear },
            {
              $set: {
                student: student._id,
                studentName: student.studentName,
                amount,
                feeCategory,
                paymentMode: "EXCEL",
              },
            },
            { upsert: true }
          );

          updated++;
          continue;
        }

        /* ---------- CUSTOM / OTHER FEES ---------- */
        const exists = await FeePayment.findOne({
          htNumber,
          academicYear,
          feeCategory: "CUSTOM",
          customFeeName: customFeeName,
        });

        if (exists) {
          // ✅ UPDATE ONLY THIS SPECIFIC CUSTOM FEE
          await FeePayment.updateOne(
            {
              htNumber,
              academicYear,
              feeCategory: "CUSTOM",
              customFeeName: customFeeName,
            },
            {
              $set: {
                amount,
                paymentMode: "EXCEL",
              },
            }
          );
          updated++;
          continue;
        }

        // CREATE NEW CUSTOM FEE
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

        inserted++;
      } catch (err) {
        failedRows.push({ row: i + 2, error: err.message });
      }
    }

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      updated,
      inserted,
      skipped: skippedRows.length,
      failed: failedRows.length,
      failedRows,
      message: "Upload processed successfully",
    });
  } catch (err) {
    console.error("BULK FEE UPLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


