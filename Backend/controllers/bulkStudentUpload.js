// const XLSX = require("xlsx");
// const fs = require("fs");
// const Student = require("../Models/StudentBulk");

// /* ================= NORMALIZE KEYS ================= */
// const normalizeRow = (row) => {
//   const normalized = {};
//   Object.keys(row).forEach((key) => {
//     const cleanKey = key.replace(/\s+/g, "").toLowerCase();
//     normalized[cleanKey] = row[key];
//   });
//   return normalized;
// };

// /* ================= EXCEL DATE ================= */
// const excelDateToJSDate = (value) => {
//   if (!value) return null;
//   if (value instanceof Date) return value;
//   if (typeof value === "number") return new Date((value - 25569) * 86400 * 1000);
//   const parsed = new Date(value);
//   return isNaN(parsed) ? null : parsed;
// };

// /* ================= NUMBER CLEAN ================= */
// const extractNumber = (value) => {
//   if (!value) return 0;
//   const num = String(value).replace(/[^0-9]/g, "");
//   return num ? Number(num) : 0;
// };

// /* ================= BULK UPLOAD STUDENTS ================= */
// exports.bulkUploadStudents = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "Excel file required" });

//     const workbook = XLSX.readFile(req.file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

//     let inserted = 0; // newly added
//     const failedRows = [];

//     for (let i = 0; i < rows.length; i++) {
//       try {
//         const row = normalizeRow(rows[i]);

//         if (!row.htnumber || !row.studentname || !row.branch) {
//           throw new Error("Required fields missing");
//         }

//         const htNumber = String(row.htnumber).trim().toUpperCase();
//         const existingStudent = await Student.findOne({ htNumber });

//         const admissionType =
//           String(row.admissiontype || "").toUpperCase() === "MANAGEMENT"
//             ? "MANAGEMENT"
//             : "CONVENER";

//         const gender =
//           String(row.gender || "").toUpperCase() === "FEMALE" || row.gender === "1"
//             ? "FEMALE"
//             : "MALE";

//         const studentData = {
//           htNumber,
//           studentName: String(row.studentname).trim(),
//           branch: String(row.branch).trim().toUpperCase(),
//           fatherName: String(row.fathername || "").trim(),
//           parentMobile: String(row.parentmobile || "").trim(),
//           studentMobile: String(row.studentmobile || "").trim(),
//           address: String(row.address || "").trim(),
//           ...(row.aadharnumber && { aadharNumber: String(row.aadharnumber).replace(/\.0$/, "").trim() }),
//           email: String(row.email || "").trim().toLowerCase(),
//           admissionType,
//           casteCategory: String(row.castecategory || "").trim().toUpperCase(),
//           gender,
//           admissionNumber: row.admissionnumber ? String(row.admissionnumber).trim() : undefined,
//           admissionDate: excelDateToJSDate(row.admissiondate),
//           dateOfBirth: excelDateToJSDate(row.dateofbirth),
//           TutionFee: extractNumber(row.tutionfee || row.tuitionfee || row.collegetuitionfee || row.fee),
//           admissionFee: extractNumber(row.admissionfee),
//           busFee: extractNumber(row.busfee),
//         };

//         if (existingStudent) {
//           // Already exists, keep old data unchanged
//           continue;
//         } else {
//           await Student.create(studentData);
//           inserted++; // count new student
//         }
//       } catch (err) {
//         failedRows.push({ row: i + 2, error: err.message });
//       }
//     }

//     fs.unlinkSync(req.file.path);

//     res.json({
//       success: true,
//       inserted,       // number of new students added
//       failed: failedRows.length,
//       failedRows,
//       message: `${inserted} student${inserted !== 1 ? "s" : ""} added successfully!`
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");

/* ================= NORMALIZE KEYS ================= */
const normalizeRow = (row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    const cleanKey = key.replace(/\s+/g, "").toLowerCase();
    normalized[cleanKey] = row[key];
  });
  return normalized;
};

/* ================= EXCEL DATE ================= */
const excelDateToJSDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000);
  }
  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
};

/* ================= NUMBER CLEAN ================= */
const extractNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = String(value).replace(/[^0-9]/g, "");
  return num ? Number(num) : undefined;
};

/* ================= ACADEMIC YEAR NORMALIZE ================= */
const normalizeAcademicYear = (value) => {
  if (!value) return undefined;
  const v = String(value).toLowerCase();

  if (v.includes("1")) return "1st Year";
  if (v.includes("2")) return "2nd Year";
  if (v.includes("3")) return "3rd Year";
  if (v.includes("4")) return "4th Year";

  return undefined;
};

/* ================= BULK UPLOAD STUDENTS ================= */
exports.bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file required" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let inserted = 0;
    let updated = 0;
    const failedRows = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = normalizeRow(rows[i]);

        if (!row.htnumber) {
          throw new Error("HT Number missing");
        }

        const htNumber = String(row.htnumber).trim().toUpperCase();
        const existingStudent = await Student.findOne({ htNumber });

        /* ================= COMMON DATA ================= */
        const admissionType =
          String(row.admissiontype || "").toUpperCase() === "MANAGEMENT"
            ? "MANAGEMENT"
            : "CONVENER";

        const gender =
          String(row.gender || "").toUpperCase() === "FEMALE" ||
          row.gender === "1"
            ? "FEMALE"
            : "MALE";

        /* ================= FEES & YEAR ================= */
        const busFee = extractNumber(row.busfee);
        const TutionFee = extractNumber(
          row.tutionfee || row.tuitionfee || row.collegetuitionfee || row.fee
        );
        const academicYear = normalizeAcademicYear(row.academicyear);

        /* ================= EXISTING STUDENT → UPDATE ================= */
        if (existingStudent) {
          const updateFields = {};

          if (busFee !== undefined) updateFields.busFee = busFee;
          if (TutionFee !== undefined) updateFields.TutionFee = TutionFee;
          if (academicYear) updateFields.academicYear = academicYear;

          if (Object.keys(updateFields).length > 0) {
            await Student.updateOne({ htNumber }, { $set: updateFields });
            updated++;
          }
          continue;
        }

        /* ================= NEW STUDENT → INSERT ================= */
        if (!row.studentname || !row.branch) {
          throw new Error("Student Name or Branch missing for new student");
        }
        console.log(busFee);
        const studentData = {
          htNumber,
          studentName: String(row.studentname).trim(),
          branch: String(row.branch).trim().toUpperCase(),

          academicYear,

          fatherName: String(row.fathername || "").trim(),
          parentMobile: String(row.parentmobile || "").trim(),
          studentMobile: String(row.studentmobile || "").trim(),
          address: String(row.address || "").trim(),

          ...(row.aadharnumber && {
            aadharNumber: String(row.aadharnumber).replace(/\.0$/, "").trim(),
          }),

          email: String(row.email || "")
            .trim()
            .toLowerCase(),
          admissionType,
          casteCategory: String(row.castecategory || "")
            .trim()
            .toUpperCase(),
          gender,

          admissionNumber: row.admissionnumber
            ? String(row.admissionnumber).trim()
            : undefined,

          admissionDate: excelDateToJSDate(row.admissiondate),
          dateOfBirth: excelDateToJSDate(row.dateofbirth),

          busFee,
          TutionFee,
          admissionFee: extractNumber(row.admissionfee),
        };

        await Student.create(studentData);
        inserted++;
      } catch (err) {
        failedRows.push({
          row: i + 2,
          error: err.message,
        });
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      inserted,
      updated,
      failed: failedRows.length,
      failedRows,
      message: `Inserted: ${inserted}, Updated: ${updated}`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
