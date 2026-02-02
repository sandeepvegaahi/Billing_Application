
const express = require("express");
const multer = require("multer");
const router = express.Router();

const adminProtect = require("../Middleware/authMiddleware");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByRoll,
  getBulkStudentCount,
} = require("../controllers/studentController");

const { bulkUploadStudents, getAcademicYears } = require("../controllers/bulkStudentUpload");
const upload = multer({ dest: "uploads/" });

router.use((req, res, next) => {
  console.log("STUDENT ROUTE HIT:", req.method, req.originalUrl);
  next();
});

// Count of bulk students
router.get("/bulk/count", adminProtect, getBulkStudentCount);

// Bulk upload endpoint
router.post("/bulk-upload/students", adminProtect, upload.single("file"), bulkUploadStudents);

// Get academic years
router.get("/academic-years", adminProtect, getAcademicYears);

// Student routes
router.get("/roll/:htNumber", adminProtect, getStudentByRoll);
router.post("/register", adminProtect, createStudent);
router.get("/", adminProtect, getStudents);
router.put("/:id", adminProtect, updateStudent);
router.delete("/:id", adminProtect, deleteStudent);
router.get("/:id", adminProtect, getStudentById);

module.exports = router;

