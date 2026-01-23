const FeeStructure = require("../Models/FeeStructure");


exports.getAllFeeCategories = async (req, res) => {
  try {
    
    const fees = await FeeStructure.find().sort({ category: 1, customCategoryName: 1 });

    
    const categories = fees.map(fee => {
      if (fee.category === "CUSTOM") {
        return { value: fee.customCategoryName, label: fee.customCategoryName };
      }
      return { value: fee.category, label: fee.category };
    });

  
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
