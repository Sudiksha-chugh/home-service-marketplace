import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";

/**
 * One-off seed script: creates an admin user from ADMIN_EMAIL / ADMIN_PASSWORD
 * in .env if one doesn't already exist.
 *
 * Usage: node utils/seedAdmin.js
 */
const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB for admin seeding");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await userModel.findOne({ email: adminEmail });
    if (existing) {
      console.log(`ℹ️  Admin user already exists: ${existing.email} (role: ${existing.role})`);
      process.exit(0);
    }

    // Hash password and create admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = await userModel.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`✅ Admin user seeded successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID:    ${admin._id}`);
    console.log(`   Role:  ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
