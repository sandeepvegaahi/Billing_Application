

const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");


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

const excelDateToJSDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "number") {
    const utcDays = Math.floor(value - 25569);
    return new Date(utcDays * 86400 * 1000);
  }

  // force yyyy-mm-dd
  const parsed = new Date(String(value).trim());
  return isNaN(parsed) ? null : parsed;
};


const AcademicBatch = require("../Models/AcademicBatch");

exports.bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required" });

    
    const selectedAcademicYear = req.body.academicYear;
const { academicBatchId } = req.body;

let selectedBatch = null;
let batchStartYear = null;

if (academicBatchId) {
  selectedBatch = await AcademicBatch.findById(academicBatchId).lean();
  if (!selectedBatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid Academic Batch selected",
    });
  }
  batchStartYear = selectedBatch.startYear; // 🔑 2018 from 2018-2022
}

    const workbook = XLSX.readFile(req.file.path, {
  cellDates: true,
});

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const rows = XLSX.utils.sheet_to_json(sheet, {
  defval: "",
  raw: false,   // 👈 THIS IS CRITICAL
});


    let inserted = 0;
    let updated = 0;
    const failedRows = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        
        const row = normalizeRow(rows[i]);
        if (!row.htnumber) throw new Error("HT Number missing");
const admissionDateRaw = row.admissiondate;

let admissionYear = null;

// Case 1: Excel date number
if (typeof admissionDateRaw === "number") {
  const date = excelDateToJSDate(admissionDateRaw);
  admissionYear = date?.getFullYear();
}

// Case 2: String like "2017" or "2017-06-01"
else if (typeof admissionDateRaw === "string") {
  const yearMatch = admissionDateRaw.match(/\d{4}/);
  admissionYear = yearMatch ? Number(yearMatch[0]) : null;
}

// Case 3: JS Date
else if (admissionDateRaw instanceof Date) {
  admissionYear = admissionDateRaw.getFullYear();
}
if (batchStartYear && admissionYear) {
  if (admissionYear !== batchStartYear) {
    throw new Error(
      `Admission year ${admissionYear} must match batch start year ${batchStartYear}`
    );
  }
}


        const htNumber = String(row.htnumber).trim().toUpperCase();
        const existingStudent = await Student.findOne({ htNumber });

        const admissionType =
          String(row.admissiontype || "").toUpperCase() === "MANAGEMENT"
            ? "MANAGEMENT"
            : "CONVENER";

        const gender =
          String(row.gender || "").toUpperCase() === "FEMALE" || row.gender === "1"
            ? "FEMALE"
            : "MALE";

        const busFee = extractNumber(row.busfee);
        const TutionFee = extractNumber(
          row.tutionfee || row.tuitionfee || row.collegetuitionfee || row.fee
        );

        
        const academicYear = selectedAcademicYear || normalizeAcademicYear(row.academicyear);

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

        if (!row.studentname || !row.branch) {
          throw new Error("Student Name or Branch missing for new student");
        }

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
          email: String(row.email || "").trim().toLowerCase(),
          admissionType,
          casteCategory: String(row.castecategory || "").trim().toUpperCase(),
          gender,
          admissionNumber: row.admissionnumber ? String(row.admissionnumber).trim() : undefined,
          admissionDate: excelDateToJSDate(row.admissiondate),
          dateOfBirth: excelDateToJSDate(row.dateofbirth),
          busFee,
          TutionFee,
         // admissionFee: extractNumber(row.admissionfee),
        };

        await Student.create(studentData);
        inserted++;
      } catch (err) {
        failedRows.push({ row: i + 2, error: err.message });
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
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAcademicYears = async (req, res) => {
  try {

    const earliestStudent = await Student.findOne()
      .sort({ admissionDate: 1 })
      .select("admissionDate")
      .lean();

    if (!earliestStudent || !earliestStudent.admissionDate) {
      return res.json({ success: true, data: [] });
    }

    const startYear = earliestStudent.admissionDate.getFullYear();
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let y = startYear; y <= currentYear; y++) {
      years.push(`${y}-${y + 1}`);
    }

    return res.json({ success: true, data: years });
  } catch (err) {
    console.error("FETCH ACADEMIC YEARS ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch academic years" });
  }
};


