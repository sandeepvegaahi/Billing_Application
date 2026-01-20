const express = require("express");
const router = express.Router();
const adminProtect = require("../Middleware/authMiddleware");
const { getAllFeeCategories } = require("../controllers/feeCategoryController");

router.get("/all", adminProtect, getAllFeeCategories);

module.exports = router;
