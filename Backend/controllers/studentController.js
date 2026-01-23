const Student = require("../Models/StudentBulk");

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
    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
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


exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!student) return sendError(res, "Student not found", 404);

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    return sendError(res, error, 400);
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return sendError(res, "Student not found", 404);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return sendError(res, error);
  }
};


exports.getStudentByRoll = async (req, res) => {
  try {
    const { htNumber } = req.params;

    const student = await Student.findOne({
      htNumber: htNumber.toUpperCase(),
    });

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
