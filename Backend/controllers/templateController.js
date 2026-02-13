
exports.downloadStudentTemplate = (req, res) => {
  const columns = [
    {
      htNumber: "",
      studentName: "",
      branch: "",
      fatherName: "",
      parentMobile: "",
      studentMobile: "",
      address: "",
      aadharNumber: "",
      email: "",
      admissionType: "",
      casteCategory: "",
      gender: "",
      admissionNumber: "",
      admissionDate: "",
      dateOfBirth: "",
      TutionFee: "",
      admissionFee: "",
      busFee: "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(columns);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Student_Bulk_Upload_Template.xlsx"
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.send(buffer);
};


exports.downloadFeeTemplate = (req, res) => {
  const { category } = req.params;

  const columns = [
    {
      htNumber: "",
      studentName: "",
     // branch: "",
     // year: "",
     // category: category, 
      amount: "",
     // paymentMode: "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(columns);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Fees");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${category}_Fee_Upload_Template.xlsx`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.send(buffer);
};
