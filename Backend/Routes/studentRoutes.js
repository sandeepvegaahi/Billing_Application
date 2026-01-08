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

const { bulkUploadStudents } = require("../controllers/bulkStudentUpload");
const { bulkUploadTuition } = require("../controllers/bulkTuitionUpload");
const { bulkUploadBus } = require("../controllers/bulkBusUpload");

const upload = multer({ dest: "uploads/" });

/* 🔥 DEBUG */
router.use((req, res, next) => {
  console.log("STUDENT ROUTE HIT:", req.method, req.originalUrl);
  next();
});

/* ✅ COUNT MUST BE FIRST */
router.get("/bulk/count", adminProtect, getBulkStudentCount);

/* BULK UPLOAD */
router.post("/bulk-upload/students", adminProtect, upload.single("file"), bulkUploadStudents);
router.post("/bulk-upload/tuition", adminProtect, upload.single("file"), bulkUploadTuition);
router.post("/bulk-upload/bus", adminProtect, upload.single("file"), bulkUploadBus);

/* SEARCH */
router.get("/roll/:htNumber", adminProtect, getStudentByRoll);

/* CRUD */
router.post("/register", adminProtect, createStudent);
router.get("/", adminProtect, getStudents);
router.put("/:id", adminProtect, updateStudent);
router.delete("/:id", adminProtect, deleteStudent);
router.get("/:id", adminProtect, getStudentById);

module.exports = router;
