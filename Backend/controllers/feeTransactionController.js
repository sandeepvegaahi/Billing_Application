const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");
const FeeTransaction = require("../Models/FeeTransaction");

// Calculate current academic year from admission date
function calculateCurrentYear(admissionDate) {
  const admission = new Date(admissionDate);
  const now = new Date();

  let year = now.getFullYear() - admission.getFullYear();
  if (
    now.getMonth() < admission.getMonth() ||
    (now.getMonth() === admission.getMonth() && now.getDate() < admission.getDate())
  ) {
    year -= 1;
  }

  year = year + 1; // Academic year starts from 1

  // Limit year to max 4
  if (year > 4) year = 4;
  if (year < 1) year = 1; // optional: minimum 1

  return year;
}

/* ================= GET STUDENT FEES ================= */
exports.getStudentFees = async (req, res) => {
  try {
    const { htNumber } = req.params;

    const student = await Student.findOne({
      htNumber: htNumber.toUpperCase().trim(),
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const currentYear = calculateCurrentYear(student.admissionDate);

    const structures = await FeeStructure.find();

    let fees = structures
      .map((f) => {
        const category = f.category === "CUSTOM" ? f.customCategoryName : f.category;
        if (category === "TuitionFee" || category === "BusFee") return null;
        return { category, amount: f.amount };
      })
      .filter(Boolean);

    // Add TuitionFee & BusFee from student table
    fees.unshift({ category: "TuitionFee", amount: student.TutionFee || 0 });
    fees.splice(1, 0, { category: "BusFee", amount: student.busFee || 0 });

    // Fetch previous payments
    const payments = await FeeTransaction.find({ htNumber: student.htNumber });

    fees = fees.map((f) => {
      const paid = payments
        .filter((p) => p.category === f.category)
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

/* ================= PAY FEE ================= */
exports.payFee = async (req, res) => {
  try {
    const { htNumber, category, amount } = req.body;

    if (!htNumber || !category || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment data" });
    }

    const student = await Student.findOne({ htNumber: htNumber.toUpperCase().trim() });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const currentYear = calculateCurrentYear(student.admissionDate);

    // Determine total fee for this category
    let totalAmount = 0;
    if (category === "TuitionFee") totalAmount = student.TutionFee || 0;
    else if (category === "BusFee") totalAmount = student.busFee || 0;
    else {
      const fee = await FeeStructure.findOne({
        $or: [{ category }, { customCategoryName: category }],
      });
      if (!fee) return res.status(400).json({ success: false, message: "Fee category not found" });
      totalAmount = fee.amount;
    }

    // Already paid amount
    const paidAgg = await FeeTransaction.aggregate([
      { $match: { htNumber: student.htNumber, category } },
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

    // Save payment
    await FeeTransaction.create({
      htNumber: student.htNumber,
      studentName: student.studentName,
      branch: student.branch,
      year: currentYear,
      category,
      amountPaid: Number(amount),
      paymentMode: "CASH",
    });

    return res.json({
      success: true,
      message: `₹${amount} paid successfully for ${category}`,
    });
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
};

