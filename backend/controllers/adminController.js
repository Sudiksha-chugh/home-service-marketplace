import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import professionalModel from "../models/professionalModel.js";
import bookingModel from "../models/bookingModel.js";
import categoryModel from "../models/categoryModel.js";

/**
 * Create a JWT for the given user id and role.
 */
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * POST /api/admin/login
 * Login for admin user — no self-registration, admin is seeded via seedAdmin.js
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Not an admin account." });
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
    console.error("loginAdmin error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/verification-queue
 * authAdmin-gated: fetch all professionals with verificationStatus="pending"
 */
export const getVerificationQueue = async (req, res) => {
  try {
    const professionals = await professionalModel
      .find({})
      .populate("user", "-password")
      .populate("categories")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: professionals.length, professionals });
  } catch (error) {
    console.error("getVerificationQueue error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/admin/verify-pro
 * authAdmin-gated: approve or reject a professional verification status
 */
export const updateVerificationStatus = async (req, res) => {
  try {
    const { professionalId, status } = req.body;

    if (!professionalId || !["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Valid professionalId and status (approved/rejected) are required." });
    }

    const professional = await professionalModel.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional profile not found." });
    }

    professional.verificationStatus = status;
    if (status === "approved") {
      professional.isActive = true;
    } else if (status === "rejected") {
      professional.isActive = false;
    }

    await professional.save();

    res.json({ success: true, professional });
  } catch (error) {
    console.error("updateVerificationStatus error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/analytics
 * authAdmin-gated: aggregated marketplace metrics
 */
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Bookings this month
    const totalBookingsMonth = await bookingModel.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Revenue this month (sum of price for completed or paid bookings)
    const paidBookings = await bookingModel.find({
      createdAt: { $gte: startOfMonth },
      $or: [{ status: "completed" }, { paymentStatus: "paid" }],
    });
    const revenueMonth = paidBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    // Bookings per category
    const categories = await categoryModel.find({}).lean();
    const bookings = await bookingModel.find({}).populate("category").lean();

    const bookingsPerCategoryMap = {};
    categories.forEach((c) => {
      bookingsPerCategoryMap[c.name] = 0;
    });

    bookings.forEach((b) => {
      if (b.category && b.category.name) {
        bookingsPerCategoryMap[b.category.name] = (bookingsPerCategoryMap[b.category.name] || 0) + 1;
      }
    });

    const bookingsPerCategory = Object.entries(bookingsPerCategoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    // Counts of active vs pending vs approved pros
    const activePros = await professionalModel.countDocuments({ isActive: true });
    const pendingPros = await professionalModel.countDocuments({ verificationStatus: "pending" });
    const approvedPros = await professionalModel.countDocuments({ verificationStatus: "approved" });
    const totalPros = await professionalModel.countDocuments({});

    res.json({
      success: true,
      analytics: {
        totalBookingsMonth,
        revenueMonth,
        bookingsPerCategory,
        proCounts: {
          active: activePros,
          pending: pendingPros,
          approved: approvedPros,
          total: totalPros,
        },
      },
    });
  } catch (error) {
    console.error("getAnalytics error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
