const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      required: true,
      enum: ["CSE", "ECE", "MECH", "EEE", "CIVIL"],
    },

    batchYear: {
      type: Number,
      required: true,
    },

    currentYear: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    currentSemester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    contact: {
      mobile: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "HOLD", "PASSOUT"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
