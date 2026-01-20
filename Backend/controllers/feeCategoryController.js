const FeeStructure = require("../Models/FeeStructure");

/* GET ALL FEE CATEGORIES (including CUSTOM fees) */
exports.getAllFeeCategories = async (req, res) => {
  try {
    // Fetch all fee records
    const fees = await FeeStructure.find().sort({ category: 1, customCategoryName: 1 });

    // Map categories to value/label
    const categories = fees.map(fee => {
      if (fee.category === "CUSTOM") {
        return { value: fee.customCategoryName, label: fee.customCategoryName };
      }
      return { value: fee.category, label: fee.category };
    });

    // Remove duplicates
    const uniqueCategories = [];
    const seen = new Set();
    categories.forEach(f => {
      if (!seen.has(f.value)) {
        seen.add(f.value);
        uniqueCategories.push(f);
      }
    });

    res.status(200).json({ success: true, data: uniqueCategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
