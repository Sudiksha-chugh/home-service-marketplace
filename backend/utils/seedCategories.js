import "dotenv/config";
import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";

/**
 * One-off seed script for starter service categories.
 * Usage: node utils/seedCategories.js
 */
const starterCategories = [
  {
    name: "Plumbing",
    description: "Plumbing repairs, pipe installations, leak fixes, and drainage services.",
    basePrice: 50,
  },
  {
    name: "Electrical",
    description: "Electrical wiring, lighting installation, circuit breaker fixes, and appliances.",
    basePrice: 60,
  },
  {
    name: "Cleaning",
    description: "Deep house cleaning, kitchen & bathroom sanitation, and carpet cleaning.",
    basePrice: 40,
  },
  {
    name: "Carpentry",
    description: "Custom woodwork, furniture assembly, door repair, and cabinet installation.",
    basePrice: 55,
  },
  {
    name: "AC Repair",
    description: "Air conditioner servicing, gas refilling, compressor repair, and installation.",
    basePrice: 70,
  },
  {
    name: "Painting",
    description: "Interior wall painting, exterior coating, and texture painting services.",
    basePrice: 65,
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB for category seeding");

    for (const catData of starterCategories) {
      const existing = await categoryModel.findOne({ name: catData.name });
      if (existing) {
        console.log(`ℹ️  Category already exists: ${catData.name} ($${catData.basePrice})`);
      } else {
        const created = await categoryModel.create(catData);
        console.log(`✅ Seeded category: ${created.name} (ID: ${created._id})`);
      }
    }

    console.log("🎉 Category seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedCategories();
