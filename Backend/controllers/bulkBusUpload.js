const XLSX = require("xlsx");
const fs = require("fs");
const Student = require("../Models/StudentBulk");

exports.bulkUploadBus = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let updated = 0;
    for (let row of rows) {
      const htNumber = String(row.htNumber || row.HTNumber).trim().toUpperCase();
      const busFee = Number(row.busFee || 0);

      const student = await Student.findOneAndUpdate(
        { htNumber },
        { busFee }
      );
      if (student) updated++;
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
