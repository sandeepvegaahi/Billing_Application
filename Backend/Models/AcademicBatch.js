const mongoose = require("mongoose");

const academicBatchSchema = new mongoose.Schema(
  {
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    batchName: { type: String, required: true, unique: true }, // "1900-1904"
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AcademicBatch", academicBatchSchema);
