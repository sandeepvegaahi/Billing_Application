// // const express = require("express");
// // const router = express.Router();
// // const adminProtect = require("../Middleware/authMiddleware");

// // const {
// //   downloadStudentTemplate,
// //   downloadFeeTemplate,
// // } = require("../controllers/templateController");

// // // ✅ Student bulk upload template
// // router.get("/students", adminProtect, downloadStudentTemplate);

// // // ✅ Fee bulk upload template (category based)
// // router.get("/fees/:category", adminProtect, downloadFeeTemplate);

// // module.exports = router;
// const express = require("express");
// const router = express.Router();
// const {
//   downloadStudentTemplate,
//   downloadFeeTemplate,
// } = require("../controllers/templateController");

// /* Student Bulk Upload Template */
// router.get("/students", downloadStudentTemplate);

// /* Fee Upload Template (category-wise) */
// router.get("/fees/:category", downloadFeeTemplate);

// module.exports = router;
const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const getTemplatePath = (fileName) => {
  return path.resolve(__dirname, "../templates", fileName);
};

// Student template
router.get("/students", (req, res) => {
  const fileName = "Student_Bulk_Upload_Template.xlsx";
  const filePath = getTemplatePath(fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Student template not found" });
  }

  res.download(filePath, fileName);
});

// Fee template (category-wise)
router.get("/fees/:category", (req, res) => {
  const category = req.params.category;
  const fileName = `${category}_Fee_Upload_Template.xlsx`;
  const filePath = getTemplatePath(fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: `Template for ${category} not found` });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error sending template:", err);
      res.status(500).json({ message: "Error downloading template" });
    }
  });
});

module.exports = router;

