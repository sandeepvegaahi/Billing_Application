// Controllers/courseController.js
const Course = require("../Models/Course");
const AcademicBatch = require("../Models/AcademicBatch");

exports.createCourseWithBatches = async (req, res) => {
  try {
    const { name, durationYears, leastYear } = req.body;

    if (!name || !durationYears || !leastYear) {
      return res.status(400).json({
        success: false,
        message: "Course name, duration and least year are required",
      });
    }

    // Create course
    const course = await Course.create({
      name: name.trim(),
      durationYears,
    });

    // Generate batches
    const currentYear = new Date().getFullYear();
    const batches = [];

    for (let start = leastYear; start <= currentYear; start++) {
      const end = start + durationYears;
      batches.push({
        course: course._id,
        startYear: start,
        endYear: end,
        label: `${start}-${end}`,
      });
    }

    await AcademicBatch.insertMany(batches);

    res.status(201).json({
      success: true,
      message: "Course and academic batches created",
      course,
      batches,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Controllers/courseController.js
exports.getAcademicBatchesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const batches = await AcademicBatch.find({ course: courseId })
      .sort({ startYear: 1 })
      .select("label");

    res.json({
      success: true,
      data: batches,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
