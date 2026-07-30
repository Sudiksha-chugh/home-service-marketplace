import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import professionalModel from "../models/professionalModel.js";

/**
 * Create a JWT for the given user id and role.
 */
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * POST /api/professional/register
 * Register a new professional — creates both a user doc (role="professional")
 * and a linked professional doc in one transaction-like flow.
 * Requires hourlyRate and categories at signup.
 */
const registerProfessional = async (req, res) => {
  try {
    const { name, email, password, hourlyRate, categories, bio, phone } = req.body;

    if (!name || !email || !password || hourlyRate == null || !categories) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, hourlyRate, and categories are required.",
      });
    }

    // Validate categories is a non-empty array
    const categoryList = Array.isArray(categories) ? categories : [categories];
    if (categoryList.length === 0) {
      return res.status(400).json({ success: false, message: "At least one category is required." });
    }

    // Check if email already registered
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 1: Create user doc with role="professional"
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "professional",
    });

    try {
      // Step 2: Create linked professional doc
      const professional = await professionalModel.create({
        user: user._id,
        hourlyRate: Number(hourlyRate),
        categories: categoryList,
        bio: bio || "",
      });

      const token = createToken(user._id, user.role);

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        professional: { id: professional._id, hourlyRate: professional.hourlyRate },
      });
    } catch (proError) {
      // Roll back: delete the user doc if professional doc creation fails
      await userModel.findByIdAndDelete(user._id);
      throw proError;
    }
  } catch (error) {
    console.error("registerProfessional error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/professional/login
 * Login an existing professional.
 */
const loginProfessional = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    if (user.role !== "professional") {
      return res.status(403).json({ success: false, message: "Please use the correct login portal for your role." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = createToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("loginProfessional error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export { registerProfessional, loginProfessional };
