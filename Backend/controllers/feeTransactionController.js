const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");
const FeeTransaction = require("../Models/FeeTransaction");

/* ================= GET STUDENT FEE DETAILS ================= */
exports.getStudentFeeDetails = async (req, res) => {
  try {
    const { htNumber } = req.params;

    // Get student from bulk upload
    const student = await Student.findOne({ htNumber: htNumber.toUpperCase() });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Get fees from FeeStructure (exclude TuitionFee & BusFee)
    const feesFromStructure = await FeeStructure.find().sort({ createdAt: 1 });

    const feeDetails = feesFromStructure.map((f) => {
      const name = f.category === "CUSTOM" ? f.customCategoryName : f.category;
      if (name === "TuitionFee" || name === "BusFee") return null; // skip
      return { category: name, amount: f.amount };
    }).filter(f => f !== null);

    // Add TuitionFee & BusFee from student bulk
    if (student.TutionFee) feeDetails.unshift({ category: "TuitionFee", amount: student.TutionFee });
    if (student.busFee) feeDetails.splice(1, 0, { category: "BusFee", amount: student.busFee });

    res.status(200).json({
      success: true,
      student: {
        htNumber: student.htNumber,
        studentName: student.studentName,
        branch: student.branch,
        year: student.year,
      },
      fees: feeDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
