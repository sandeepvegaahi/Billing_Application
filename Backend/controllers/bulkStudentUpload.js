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
  if (typeof value === "number") return new Date((value - 25569) * 86400 * 1000);
  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
};

/* ================= NUMBER CLEAN ================= */
const extractNumber = (value) => {
  if (!value) return 0;
  const num = String(value).replace(/[^0-9]/g, "");
  return num ? Number(num) : 0;
};

/* ================= BULK UPLOAD STUDENTS ================= */
exports.bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let inserted = 0;
    let updated = 0;
    const failedRows = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = normalizeRow(rows[i]);

        if (!row.htnumber || !row.studentname || !row.branch) {
          throw new Error("Required fields missing");
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

        const studentData = {
          htNumber,
          studentName: String(row.studentname).trim(),
          branch: String(row.branch).trim().toUpperCase(),
          fatherName: String(row.fathername || "").trim(),
          parentMobile: String(row.parentmobile || "").trim(),
          studentMobile: String(row.studentmobile || "").trim(),
          address: String(row.address || "").trim(),
          ...(row.aadharnumber && { aadharNumber: String(row.aadharnumber).replace(/\.0$/, "").trim() }),
          email: String(row.email || "").trim().toLowerCase(),
          admissionType,
          casteCategory: String(row.castecategory || "").trim().toUpperCase(),
          gender,
          admissionNumber: row.admissionnumber ? String(row.admissionnumber).trim() : undefined,
          admissionDate: excelDateToJSDate(row.admissiondate),
          dateOfBirth: excelDateToJSDate(row.dateofbirth),
          TutionFee: extractNumber(row.tutionfee || row.tuitionfee || row.collegetuitionfee || row.fee),
          admissionFee: extractNumber(row.admissionfee),
          busFee: extractNumber(row.busfee),
        };

        if (existingStudent) {
          await Student.updateOne({ htNumber }, { $set: studentData });
          updated++;
        } else {
          await Student.create(studentData);
          inserted++;
        }
      } catch (err) {
        failedRows.push({ row: i + 2, error: err.message });
      }
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true, inserted, updated, failed: failedRows.length, failedRows });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= BULK UPLOAD TUITION ================= */
exports.bulkUploadTuition = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let updated = 0;
    for (const row of rows) {
      const htNumber = String(row.htNumber || row.htnumber).trim().toUpperCase();
      const tuitionFee = extractNumber(row.tuitionFee || row.tutionfee || 0);

      const student = await Student.findOneAndUpdate({ htNumber }, { TutionFee: tuitionFee });
      if (student) updated++;
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true, updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= BULK UPLOAD BUS FEE ================= */
exports.bulkUploadBus = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let updated = 0;
    for (const row of rows) {
      const htNumber = String(row.htNumber || row.htnumber).trim().toUpperCase();
      const busFee = extractNumber(row.busFee || row.busfee || 0);

      const student = await Student.findOneAndUpdate({ htNumber }, { busFee });
      if (student) updated++;
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true, updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
