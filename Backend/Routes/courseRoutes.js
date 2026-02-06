// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const {
  createCourseWithBatches,
  getAcademicBatchesByCourse,
  getAllCourses
} = require("../controllers/courseController");

router.post("/courses", createCourseWithBatches);
router.get("/courses/:courseId/batches", getAcademicBatchesByCourse);
router.get("/courses",getAllCourses);
module.exports = router;
