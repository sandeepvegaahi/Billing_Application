



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

    
    academicBatch: { type: String, required: false }, // "1990-1994"
    courseName: { type: String, trim: true, default: "" },
    courseDuration: { type: Number, default: 4 },

    graduationYear: { type: Number },
    dateOfBirth: { type: Date, default: null },
    TutionFee: { type: Number, default: 0 },
    busFee: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "studentbulkks",
    strict: false,
  }
);


studentBulkSchema.pre("save", function () {
  if (this.admissionDate && this.courseDuration) {
    const admissionYear = new Date(this.admissionDate).getFullYear();
    this.graduationYear = admissionYear + Number(this.courseDuration);
  }
});

module.exports = mongoose.model("StudentBulkk", studentBulkSchema);
