const AcademicBatch = require("../Models/AcademicBatch");

/**
 * Generate batches from a given start year to current year
 * @param {*} startYear - number, e.g., 1900
 * @param {*} courseDuration - number of years, default 4
 */
exports.generateBatches = async (req, res) => {
  try {
    const { startYear, courseDuration = 4 } = req.body;

    if (!startYear || isNaN(startYear)) {
      return res.status(400).json({ success: false, message: "Invalid start year" });
    }

    const now = new Date().getFullYear();
    const batches = [];

    for (let year = startYear; year <= now; year++) {
      const batchName = `${year}-${year + parseInt(courseDuration)}`;
      batches.push({
        startYear: year,
        endYear: year + parseInt(courseDuration),
        batchName,
      });
    }

   
    for (const batch of batches) {
      await AcademicBatch.updateOne(
        { batchName: batch.batchName },
        { $set: batch },
        { upsert: true }
      );
    }

    const allBatches = await AcademicBatch.find().sort({ startYear: 1 });

    return res.status(200).json({ success: true, data: allBatches });
  } catch (err) {
    console.error("GENERATE BATCHES ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to generate batches" });
  }
};


exports.getBatches = async (req, res) => {
  try {
    const batches = await AcademicBatch.find().sort({ startYear: 1 });
    return res.status(200).json({ success: true, data: batches });
  } catch (err) {
    console.error("GET BATCHES ERROR:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch batches" });
  }
};
