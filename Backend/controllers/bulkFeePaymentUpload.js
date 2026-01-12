const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");
const FeePayment = require("../Models/FeePayment");

/* ================= NORMALIZE KEYS ================= */
const normalizeRow = (row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    const cleanKey = key.replace(/\s+/g, "").toLowerCase();
    normalized[cleanKey] = row[key];
  });
  return normalized;
};

/* ================= NUMBER CLEAN ================= */
const extractNumber = (value) => {
  if (!value) return 0;
  const num = String(value).replace(/[^0-9]/g, "");
  return num ? Number(num) : 0;
};

/* ================= BULK UPLOAD FEE PAYMENTS ================= */
exports.bulkUploadFeePayments = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Excel file required" });

    const { feeCategory } = req.body;
    if (!feeCategory)
      return res.status(400).json({ message: "feeCategory is required" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let inserted = 0;
    const failedRows = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = normalizeRow(rows[i]);

        if (!row.htnumber || !row.billnumber || !row.amount || !row.academicyear)
          throw new Error("Required fields missing");

        const htNumber = String(row.htnumber).trim().toUpperCase();
        const student = await Student.findOne({ htNumber });
        if (!student) throw new Error("Student not found");

        // ✅ Avoid duplicate per fee category
        const exists = await FeePayment.findOne({
          billNumber: row.billnumber,
          feeCategory: feeCategory,
        });
        if (exists) continue;

        await FeePayment.create({
          student: student._id,
          htNumber,
          academicYear: Number(row.academicyear),
          feeCategory,
          amountPaid: extractNumber(row.amount),
          billNumber: String(row.billnumber).trim(),
          paymentMode: "EXCEL",
          paymentDate: row.paymentdate ? new Date(row.paymentdate) : new Date(),
        });

        inserted++;
      } catch (err) {
        failedRows.push({ row: i + 2, error: err.message });
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      inserted,
      failed: failedRows.length,
      failedRows,
      message: `${inserted} payment(s) uploaded successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
