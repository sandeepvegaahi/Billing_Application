
const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");


const calculateCurrentYear = (admissionDate) => {
  if (!admissionDate) return 0;

  const admission = new Date(admissionDate);
  const now = new Date();

  let year = now.getFullYear() - admission.getFullYear();

  if (
    now.getMonth() < admission.getMonth() ||
    (now.getMonth() === admission.getMonth() && now.getDate() < admission.getDate())
  ) {
    year -= 1;
  }

  year = year + 1; 
  if (year > 4) year = 4;
  if (year < 1) year = 1;

  return year;
};

const sendError = (res, error, status = 500) => {
  return res.status(status).json({
    success: false,
    message: error.message || error,
  });
};


exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: student,
    });
  } catch (error) {
    return sendError(res, error, 400);
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    const fees = await FeeStructure.find({
      category: { $nin: ["TutionFee", "TuitionFee", "BusFee"] },
    });

    const feeMap = {};
    fees.forEach((f) => {
      const key = f.category === "CUSTOM" ? f.customCategoryName.replace(/\s+/g, "") : f.category;
      feeMap[key] = f.amount;
    });

    const studentsWithFees = students.map((student) => {
      const obj = student.toObject();

      
      if (!obj.graduationYear && obj.admissionDate) {
        obj.graduationYear = new Date(obj.admissionDate).getFullYear() + 4;
      }

      
      obj.currentYear = calculateCurrentYear(obj.admissionDate);

      Object.keys(feeMap).forEach((feeKey) => {
        if (obj[feeKey] === undefined) obj[feeKey] = feeMap[feeKey];
      });

      return obj;
    });

    return res.status(200).json({
      success: true,
      count: studentsWithFees.length,
      data: studentsWithFees,
    });
  } catch (error) {
    return sendError(res, error);
  }
};


exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return sendError(res, "Student not found", 404);
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return sendError(res, error);
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return sendError(res, "Student not found", 404);

    const allowedFields = [
      "htNumber", "studentName", "branch", "fatherName", "parentMobile",
      "studentMobile", "address", "aadharNumber", "email", "admissionType",
      "casteCategory", "gender", "admissionNumber", "admissionDate",
      "dateOfBirth", "TutionFee", "busFee", "academicBatch" // ✅ added
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "admissionDate" && req.body[field]) {
          const date = new Date(req.body[field]);
          if (!isNaN(date.getTime())) student[field] = date;
        } else {
          student[field] = req.body[field];
        }
      }
    });

    const updatedStudent = await student.save(); 
    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.log("Update Error:", error);
    return sendError(res, error, 400);
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return sendError(res, "Student not found", 404);
    return res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    return sendError(res, error);
  }
};


exports.getStudentByRoll = async (req, res) => {
  try {
    const { htNumber } = req.params;
    const student = await Student.findOne({ htNumber: htNumber.toUpperCase() });
    if (!student) return sendError(res, "Student not found", 404);
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return sendError(res, error);
  }
};


exports.getBulkStudentCount = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("COUNT ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
