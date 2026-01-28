const XLSX = require("xlsx");
const fs = require("fs");

const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");
const FeePayment = require("../Models/FeePayment");
const FeeTransaction = require("../Models/FeeTransaction");

/* ---------- Helpers (reuse-safe) ---------- */
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
  String(name || "").trim().replace(/\s+/g, " ").toLowerCase();

/* ---------- Controller ---------- */
exports.bulkUploadPaidTransactions = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "Excel file required" });

    const { feeCategory } = req.body;
    if (!feeCategory)
      return res.status(400).json({ success: false, message: "Fee category required" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let inserted = 0;
    const failedRows = [];

    const predefinedFees = [
      "TuitionFee",
      "BusFee",
      "ExamFee",
      "UniversityFee",
      "CondonationFee",
    ];

    let feeCategoryDB = feeCategory;
    let customFeeName = null;

    if (!predefinedFees.includes(feeCategory)) {
      feeCategoryDB = "CUSTOM";
      customFeeName = feeCategory;
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
        if (amount === undefined || amount <= 0) throw new Error("Invalid amount");
        if (!academicYear) throw new Error("Academic year invalid");

        const student = await Student.findOne({ htNumber });
        if (!student) throw new Error("HT Number not found");

        const studentNameDB = normalizeName(student.studentName);
        if (studentNameDB !== studentNameExcel)
          throw new Error("HT Number / Name mismatch");

        /* ---------- Determine TOTAL FEE ---------- */
        let totalAmount = 0;

        if (feeCategory === "TuitionFee") {
          totalAmount = student.TutionFee || 0;
        } else if (feeCategory === "BusFee") {
          totalAmount = student.busFee || 0;
        } else if (feeCategoryDB === "CUSTOM") {
          const feeRecord = await FeePayment.findOne({
            htNumber,
            academicYear,
            feeCategory: "CUSTOM",
            customFeeName,
          });
          if (!feeRecord) throw new Error("Custom fee not assigned");
          totalAmount = feeRecord.amount;
        } else {
          const fee = await FeeStructure.findOne({
            $or: [{ category: feeCategory }, { customCategoryName: feeCategory }],
          });
          if (!fee) throw new Error("Fee category not found");
          totalAmount = fee.amount;
        }

        /* ---------- Calculate Already Paid ---------- */
        const paidAgg = await FeeTransaction.aggregate([
          {
            $match: {
              htNumber,
              category: feeCategoryDB === "CUSTOM" ? "CUSTOM" : feeCategory,
              ...(feeCategoryDB === "CUSTOM" ? { customFeeName } : {}),
            },
          },
          { $group: { _id: null, total: { $sum: "$amountPaid" } } },
        ]);

        const alreadyPaid = paidAgg[0]?.total || 0;
        const due = totalAmount - alreadyPaid;

        if (amount > due)
          throw new Error(`Payment exceeds due (₹${due})`);

        /* ---------- Create TRANSACTION ---------- */
        await FeeTransaction.create({
          htNumber,
          studentName: student.studentName,
          branch: student.branch,
          year: academicYear,
          category: feeCategoryDB === "CUSTOM" ? "CUSTOM" : feeCategory,
          amountPaid: amount,
          paymentMode: "OFFLINE_EXCEL",
          ...(feeCategoryDB === "CUSTOM" ? { customFeeName } : {}),
        });

        inserted++;
      } catch (err) {
        failedRows.push({ row: i + 2, error: err.message });
      }
    }

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      inserted,
      failed: failedRows.length,
      failedRows,
      message: "Offline payments uploaded successfully",
    });
  } catch (err) {
    console.error("PAID BULK UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
