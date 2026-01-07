const express = require("express");
const multer = require("multer");

// Controllers
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByRoll,
} = require("../controllers/studentController");

// Middleware
const adminProtect = require("../Middleware/authMiddleware");

// Bulk upload controllers
const { bulkUploadStudents } = require("../controllers/bulkStudentUpload");
const { bulkUploadTuition } = require("../controllers/bulkTuitionUpload");
const { bulkUploadBus } = require("../controllers/bulkBusUpload");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

/* ================= BULK UPLOAD ROUTES ================= */

router.post(
  "/bulk-upload/students",
  adminProtect,
  upload.single("file"),
  bulkUploadStudents
);

router.post(
  "/bulk-upload/tuition",
  adminProtect,
  upload.single("file"),
  bulkUploadTuition
);

router.post(
  "/bulk-upload/bus",
  adminProtect,
  upload.single("file"),
  bulkUploadBus
);

/* ================= SEARCH ROUTES ================= */

// Search student by Roll Number
router.get("/roll/:htNumber", adminProtect, getStudentByRoll);

/* ================= CRUD ROUTES ================= */

router.post("/register", adminProtect, createStudent); // Create
router.get("/", adminProtect, getStudents); // Read all
router.get("/:id", adminProtect, getStudentById); // Read one
router.put("/:id", adminProtect, updateStudent); // Update
router.delete("/:id", adminProtect, deleteStudent); // Delete

module.exports = router;
