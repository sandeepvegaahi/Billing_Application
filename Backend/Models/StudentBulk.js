const mongoose = require("mongoose");

const studentBulkSchema = new mongoose.Schema(
  {
    htNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    studentName: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true, uppercase: true },
    fatherName: { type: String, trim: true, default: "" },
    parentMobile: { type: String, default: "" },
    studentMobile: { type: String, default: "" },
    address: { type: String, trim: true, default: "" },
    aadharNumber: { type: String, unique: true, sparse: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    admissionType: { type: String, enum: ["CONVENER", "MANAGEMENT"], default: "CONVENER" },
    casteCategory: { type: String, trim: true, uppercase: true, default: "" },
    gender: { type: String, enum: ["MALE", "FEMALE"], default: "MALE" },
    admissionNumber: { type: String, unique: true, sparse: true },
    admissionDate: { type: Date, default: null },
    dateOfBirth: { type: Date, default: null },
    TutionFee: { type: Number, default: 0 },
    admissionFee: { type: Number, default: 0 },
    busFee: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "studentbulkks", // ← this must match your DB
  }
);

module.exports = mongoose.model("StudentBulkk", studentBulkSchema);
