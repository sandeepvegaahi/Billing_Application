const Admin = require("../Models/adminModel");
const bcrypt = require("bcryptjs");
const generateToken = require("../Utils/generateToken");

exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = await Admin.create({
      name,
      email,
      password:hashedPassword,
    });
    res.status(201).json({
      message: "Admin registered successfully", 
      _id: admin._id,
      name: admin.name,
      email: admin.email,        
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        message: " Admin Login successful", 
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








