const FeeTransaction = require("../Models/FeeTransaction");
const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");
const mongoose = require("mongoose");


exports.getFinancialReport = async (req, res) => {
  try {
    const { type, branch, feeCategory, date, month, fromDate, toDate } = req.query;

    let match = {};

   
    if (branch && branch !== "ALL") match.branch = branch;

    
    if (feeCategory) match.category = feeCategory;

   
    if (type === "day" && date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59);
      match.createdAt = { $gte: start, $lte: end };
    } else if (type === "month" && month) {
      const [year, mon] = month.split("-");
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59);
      match.createdAt = { $gte: start, $lte: end };
    } else if (type === "custom" && fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59);
      match.createdAt = { $gte: start, $lte: end };
    }

    const transactions = await FeeTransaction.find(match).sort({ createdAt: -1 });

    const reportData = transactions.map((t) => ({
      date: t.createdAt.toISOString().split("T")[0],
      htNumber: t.htNumber,
      studentName: t.studentName,
      branch: t.branch,
      feeCategory: t.category === "CUSTOM" ? t.customFeeName : t.category,
      amount: t.amountPaid,
      paymentMode: t.paymentMode,
    }));

    res.json({ success: true, data: reportData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getDueReport = async (req, res) => {
  try {
    const { type, branch, date, month, fromDate, toDate } = req.query;

   
    let studentFilter = {};
    if (branch && branch !== "ALL") studentFilter.branch = branch;

    const students = await Student.find(studentFilter);
    const feeStructures = await FeeStructure.find();

    const transactions = await FeeTransaction.find();

    const dueReport = students.map((s) => {
      const currentYear = new Date().getFullYear() - new Date(s.admissionDate).getFullYear() + 1;
      const studentTransactions = transactions.filter((t) => t.htNumber === s.htNumber);

   
      const tuitionPaid = studentTransactions
        .filter((t) => t.category === "TuitionFee")
        .reduce((a, t) => a + t.amountPaid, 0);
      const busPaid = studentTransactions
        .filter((t) => t.category === "BusFee")
        .reduce((a, t) => a + t.amountPaid, 0);

      const tuitionTotal = s.TutionFee || 0;
      const busTotal = s.busFee || 0;

      const otherFees = feeStructures
        .filter((f) => !["TuitionFee", "BusFee"].includes(f.category))
        .map((f) => {
          const paid = studentTransactions
            .filter((t) => {
              if (f.category === "CUSTOM") return t.customFeeName === f.customCategoryName;
              return t.category === f.category;
            })
            .reduce((sum, t) => sum + t.amountPaid, 0);
          return {
            name: f.category === "CUSTOM" ? f.customCategoryName : f.category,
            total: f.amount,
            paid,
            due: f.amount - paid,
          };
        });

      const totalDue =
        (tuitionTotal - tuitionPaid) +
        (busTotal - busPaid) +
        otherFees.reduce((a, f) => a + f.due, 0);

      return {
        htNumber: s.htNumber,
        studentName: s.studentName,
        branch: s.branch,
        year: currentYear,
        totalDue,
        Tuition: tuitionTotal - tuitionPaid,
        Bus: busTotal - busPaid,
        Exam: otherFees.find((f) => f.name === "ExamFee")?.due || 0,
        ...otherFees
          .filter((f) => !["TuitionFee", "BusFee", "ExamFee"].includes(f.name))
          .reduce((acc, f) => ({ ...acc, [f.name]: f.due }), {}),
      };
    });

    res.json({ success: true, data: dueReport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getSummaryReport = async (req, res) => {
  try {
    const { type, branch, date, month, fromDate, toDate } = req.query;

    let match = {};
    if (branch && branch !== "ALL") match.branch = branch;

    if (type === "day" && date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59);
      match.createdAt = { $gte: start, $lte: end };
    } else if (type === "month" && month) {
      const [year, mon] = month.split("-");
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59);
      match.createdAt = { $gte: start, $lte: end };
    } else if (type === "custom" && fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59);
      match.createdAt = { $gte: start, $lte: end };
    }

    const transactions = await FeeTransaction.find(match);

    
    const summary = {};
    transactions.forEach((t) => {
      if (!summary[t.branch]) summary[t.branch] = { totalAmount: 0, totalPaid: 0, totalDue: 0 };
      summary[t.branch].totalAmount += t.amountPaid; // assuming totalAmount same as paid for simplicity
    });

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
