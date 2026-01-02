const express = require("express");
const {
  registerAdmin,
  loginAdmin,
} = require("../controllers/adminController");
const protect = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected route example
router.get("/profile", protect, (req, res) => {
  res.json(req.admin);
});

module.exports = router;
