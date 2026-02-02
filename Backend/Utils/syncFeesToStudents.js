
const Student = require("../Models/StudentBulk");
const FeeStructure = require("../Models/FeeStructure");

const IGNORE_FEES = ["TuitionFee", "BusFee"];

const normalizeFeeKey = (fee) => {
  if (fee.category === "CUSTOM") return fee.customCategoryName.replace(/\s+/g, "");
  return fee.category;
};

const syncFeesToStudents = async () => {
  const fees = await FeeStructure.find();

  for (const fee of fees) {
    const feeKey = normalizeFeeKey(fee);
    if (IGNORE_FEES.includes(feeKey)) continue;

    await Student.updateMany(
      { [feeKey]: { $exists: false } },
      { $set: { [feeKey]: 0 } }
    );
  }
};

module.exports = syncFeesToStudents;
