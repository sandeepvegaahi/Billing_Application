// Models/AcademicBatch.js
const mongoose = require("mongoose");

const academicBatchSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    startYear: {
      type: Number,
      required: true,
    },
    endYear: {
      type: Number,
      required: true,
    },
    label: {
      type: String, // "2016-2020"
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicBatch", academicBatchSchema);
