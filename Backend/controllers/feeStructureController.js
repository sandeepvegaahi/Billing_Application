
const FeeStructure = require("../Models/FeeStructure");
const syncFeesToStudents = require("../Utils/syncFeesToStudents");

exports.createFee = async (req, res) => {
  try {
    const { category, customCategoryName, amount, year, billPrefix, currentBillNumber } = req.body;

    if (!category || amount === undefined || !year || !billPrefix || currentBillNumber === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (category === "CUSTOM" && !customCategoryName) return res.status(400).json({ success: false, message: "Custom category name required" });

    const fee = await FeeStructure.create({
      category,
      customCategoryName: category === "CUSTOM" ? customCategoryName : null,
      amount,
      year,
      billPrefix,
      currentBillNumber,
    });

    await syncFeesToStudents();

    res.status(201).json({ success: true, message: "Fee added successfully", data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFees = async (req, res) => {
  try {
    const fees = await FeeStructure.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const updatedFee = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFee) return res.status(404).json({ success: false, message: "Fee not found" });

    res.status(200).json({ success: true, message: "Fee updated", data: updatedFee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFee = async (req, res) => {
  try {
    const deletedFee = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!deletedFee) return res.status(404).json({ success: false, message: "Fee not found" });

    res.status(200).json({ success: true, message: "Fee deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateBill = async (req, res) => {
  try {
    const { category, customCategoryName } = req.body;

    const query = category === "CUSTOM" ? { category: "CUSTOM", customCategoryName } : { category };

    const fee = await FeeStructure.findOne(query);
    if (!fee) return res.status(404).json({ success: false, message: "Fee category not found" });

    fee.currentBillNumber += 1;
    await fee.save();

    res.status(200).json({ success: true, billNumber: fee.billPrefix + fee.currentBillNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

