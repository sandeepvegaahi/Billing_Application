

const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");
const FeePayment = require("../Models/FeePayment");
const FeeTransaction = require("../Models/FeeTransaction");
const AcademicBatch = require("../Models/AcademicBatch");

const normalize = (val) =>
  String(val || "")
    .replace(/"/g, "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

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

function getBatchStartYearSafe(dateVal) {
  const d = new Date(dateVal);
  if (isNaN(d)) throw new Error("Invalid admission date");
  return d.getFullYear();
}


exports.bulkUploadPaidTransactions = async (req, res) => {
  try {
    console.log("🚀 BULK PAID UPLOAD HIT");

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const { feeCategory, academicBatchId, academicYear } = req.body;

    if (!feeCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Fee category is required" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const selectedBatch = await AcademicBatch.findById(academicBatchId);
    if (!selectedBatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid academic batch selected" });

    const batchStartYear = Number(selectedBatch.startYear);
    const batchEndYear = Number(selectedBatch.endYear);

    let inserted = 0;
    let failed = 0;
    const failedRows = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];

        const htNumber = normalize(
          row.htNumber || row.HTNumber || row["HT Number"],
        );

        const studentNameExcel = String(
          row.studentName || row.StudentName || "",
        )
          .trim()
          .toLowerCase();

        const amount = Number(row.amount || row.Amount || 0);

        if (!htNumber || !amount || amount <= 0) {
          throw new Error("Missing htNumber / amount");
        }

        const student = await Student.findOne({ htNumber });
        if (!student) throw new Error("Student not found");

        const studentNameDB = String(student.studentName || "")
          .trim()
          .toLowerCase();

        if (studentNameExcel && studentNameExcel !== studentNameDB) {
          throw new Error("HT Number / Name mismatch");
        }

        
        const studentBatchStart = getBatchStartYearSafe(student.admissionDate);
        const studentBatchEnd = studentBatchStart + 4;

        if (
          studentBatchStart !== batchStartYear ||
          studentBatchEnd !== batchEndYear
        ) {
          throw new Error(
            `Wrong Academic Batch selected. Student belongs to batch ${studentBatchStart}-${studentBatchEnd}.`,
          );
        }

     
        const year = calculateCurrentYear(student.admissionDate);

        let totalAmount = 0;

        if (feeCategory === "TuitionFee") {
          totalAmount = student.TutionFee || 0;
        } else if (feeCategory === "BusFee") {
          totalAmount = student.busFee || 0;
        } else if (feeCategory === "CondonationFee") {
          const feeRecord = await FeePayment.findOne({
            htNumber,
            feeCategory: "CondonationFee",
          });
          if (!feeRecord) throw new Error("Condonation fee not assigned");
          totalAmount = feeRecord.amount || 0;
        } else if (feeCategory === "CUSTOM") {
          const feeRecord = await FeePayment.findOne({
            htNumber,
            feeCategory: "CUSTOM",
            academicBatchId,
            academicYear,
          });

          if (!feeRecord)
            throw new Error("Custom fee not assigned for this student");

          totalAmount = feeRecord.amount || 0;
        } else {
          const fee = await FeeStructure.findOne({
            $or: [
              { category: feeCategory },
              { customCategoryName: feeCategory },
            ],
          });
          if (!fee) throw new Error("Fee category not found");
          totalAmount = fee.amount || 0;
        }

        const paidAgg = await FeeTransaction.aggregate([
          {
            $match: {
              htNumber,
              category: feeCategory,
              year,
            },
          },
          { $group: { _id: null, total: { $sum: "$amountPaid" } } },
        ]);

        const alreadyPaid = paidAgg[0]?.total || 0;
        const due = totalAmount - alreadyPaid;

        if (amount > due) {
          throw new Error(`Amount exceeds due ₹${due}`);
        }

    
        await FeeTransaction.create({
          htNumber,
          studentName: student.studentName,
          branch: student.branch,
          year,
          category: feeCategory,
          amountPaid: amount,
          paymentMode: "OFFLINE_EXCEL",
          academicBatchId,
          academicYear,
        });

        inserted++;
      } catch (err) {
        failed++;
        failedRows.push({ row: i + 2, error: err.message });
        console.error("❌ ROW FAILED:", i + 2, err.message);
      }
    }

    fs.unlinkSync(req.file.path);

  
    return res.status(200).json({
      success: true,
      inserted,
      failed,
      failedRows,
      message:
        failed > 0
          ? "Some rows failed. Download error report."
          : "Bulk upload completed successfully",
    });
  } catch (err) {
    console.error("❌ BULK UPLOAD ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
