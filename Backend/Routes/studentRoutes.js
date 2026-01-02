const express = require("express");
const multer = require("multer");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const adminProtect = require("../Middleware/authMiddleware");

// Bulk upload controllers
const { bulkUploadStudents } = require("../controllers/bulkStudentUpload");
const { bulkUploadTuition } = require("../controllers/bulkTuitionUpload");
const { bulkUploadBus } = require("../controllers/bulkBusUpload");

// General upload folder for all Excel files
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// =================== BULK UPLOAD ROUTES ===================
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

// =================== NORMAL CRUD ROUTES ===================
router.post("/register", adminProtect, createStudent);
router.get("/", adminProtect, getStudents);
router.get("/:id", adminProtect, getStudentById);
router.put("/:id", adminProtect, updateStudent);
router.delete("/:id", adminProtect, deleteStudent);

module.exports = router;
