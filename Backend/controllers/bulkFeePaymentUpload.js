
const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");
const FeePayment = require("../Models/FeePayment");
const FeeTransaction = require("../Models/FeeTransaction");
const AcademicBatch = require("../Models/AcademicBatch"); // ✅ NEW

/* ---------- Helpers ---------- */
const normalizeRow = (row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    const cleanKey = key.replace(/\s+/g, "").toLowerCase();
    normalized[cleanKey] = row[key];
  });
  return normalized;
};

const getYear = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d) ? null : d.getFullYear();
};

const extractNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = String(value).replace(/[^0-9]/g, "");
  return num ? Number(num) : undefined;
};

const normalizeName = (name) =>
  String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/* ---------- Controller: Bulk Upload Fee Payments ---------- */
exports.bulkUploadFeePayments = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Excel file required" });

    const { feeCategory, academicYear, academicBatchId } = req.body;

    if (!feeCategory)
      return res.status(400).json({ message: "Fee category required" });

    // ✅ Academic Batch Validation (NEW)
    if (!academicBatchId) {
      return res.status(400).json({
        success: false,
        message: "Academic Batch is required for fee upload",
      });
    }

    const selectedBatch = await AcademicBatch.findById(academicBatchId).lean();

    if (!selectedBatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Academic Batch selected",
      });
    }

    const batchStartYear = selectedBatch.startYear;
    const batchEndYear = selectedBatch.endYear;

    const selectedYear = Number(academicYear);

    if (
      !selectedYear ||
      selectedYear < batchStartYear ||
      selectedYear >= batchEndYear
    ) {
      return res.status(400).json({
        success: false,
        message: `Academic Year must be between ${batchStartYear}-${batchEndYear}`,
      });
    }

    const finalAcademicYear = `${selectedYear}-${selectedYear + 1}`;

    // ⬇️ Your existing logic continues
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let updated = 0;
    let inserted = 0;
    const failedRows = [];

    const predefinedFees = [
      "TuitionFee",
      "BusFee",
      "ExamFee",
      "UniversityFee",
      "CondonationFee",
    ];
    const feeCategoryDB = predefinedFees.includes(feeCategory)
      ? feeCategory
      : "CUSTOM";
    const customFeeName = feeCategoryDB === "CUSTOM" ? feeCategory : null;

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = normalizeRow(rows[i]);
        if (!row.htnumber) throw new Error("HT Number missing");

        const htNumber = String(row.htnumber).trim().toUpperCase();
        const studentNameExcel = normalizeName(row.studentname);
        const amount = extractNumber(row.amount);

        if (!studentNameExcel) throw new Error("Student name missing");
        if (amount === undefined || amount <= 0)
          throw new Error("Invalid or missing amount");

        const student = await Student.findOne({ htNumber });
        if (!student) throw new Error("HT Number not found");

        const studentNameDB = normalizeName(student.studentName);
        if (studentNameDB !== studentNameExcel)
          throw new Error("HT Number or Name mismatch");

        // ✅ Use academic year from batch logic
        const academicYear = finalAcademicYear;

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

        // Custom / Other Fees
        const exists = await FeePayment.findOne({
          htNumber,
          academicYear,
          feeCategory: feeCategoryDB,
          customFeeName,
        });

        const fieldName =
          feeCategory === "CondonationFee"
            ? "CondonationFee"
            : customFeeName?.replace(/\s+/g, "");

        if (exists) {
          await FeePayment.updateOne(
            {
              htNumber,
              academicYear,
              feeCategory: feeCategoryDB,
              customFeeName,
            },
            { $set: { amount, paymentMode: "EXCEL" } }
          );

          if (fieldName)
            await Student.updateOne(
              { htNumber },
              { $set: { [fieldName]: amount } }
            );

          updated++;
          continue;
        }

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

        if (fieldName)
          await Student.updateOne(
            { htNumber },
            { $set: { [fieldName]: amount } }
          );

        inserted++;
      } catch (err) {
        failedRows.push({ row: i + 2, error: err.message });
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      updated,
      inserted,
      failed: failedRows.length,
      failedRows,
    });
  } catch (err) {
    console.error("BULK FEE UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
