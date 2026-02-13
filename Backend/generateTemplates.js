const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const templatesDir = path.join(__dirname, "templates");
if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir);

const studentColumns = [
  "htNumber",
  "studentName",
  "branch",
  "fatherName",
  "parentMobile",
  "studentMobile",
  "address",
  "adharNumber",
  "email",
  "admissionType",
  "casteCategory",
  "gender",
  "admissionNumber",
  "admissionDate",
  "dateOfBirth",
  "TutionFee",
  "admissionFee",
  "busFee",
];

const studentWorkbook = new ExcelJS.Workbook();
const studentSheet = studentWorkbook.addWorksheet("Students");
studentSheet.addRow(studentColumns);

studentWorkbook.xlsx
  .writeFile(path.join(templatesDir, "Student_Bulk_Upload_Template.xlsx"))
  .then(() => console.log("✅ Student template created"));

const feeCategories = [
  "TuitionFee",
  "admissionFee",
  "busFee",
  "ExamFee",
  "UniversityFee",
  "CondonationFee",
  "CUSTOM",
];

const feeColumns = [
  "htNumber",
  "studentName",
  "amount",
 // "paymentDate",
 // "academicYear",
];

feeCategories.forEach(async (category) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Fees");
  sheet.addRow(feeColumns);

  const fileName = `${category}_Fee_Upload_Template.xlsx`;
  await workbook.xlsx.writeFile(path.join(templatesDir, fileName));
  console.log(`✅ Fee template created: ${fileName}`);
});
