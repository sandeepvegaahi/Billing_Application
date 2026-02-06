// Models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Engineering, Degree, MBA
      trim: true,
    },
    durationYears: {
      type: Number,
      required: true, // 3 or 4
      min: 1,
      max: 6,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
