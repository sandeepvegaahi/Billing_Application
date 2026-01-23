
// const express = require("express");
// const router = express.Router();
// const { getStudentFees, payFee } = require("../controllers/feeTransactionController");

// router.get("/student/:htNumber", getStudentFees);


// router.post("/pay", payFee);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { getStudentFees, payFee } = require("../controllers/feeTransactionController");

router.get("/student/:htNumber", getStudentFees);
router.post("/pay", payFee);

module.exports = router;
