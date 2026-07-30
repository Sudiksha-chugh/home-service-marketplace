import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "Plumbing"
    description: { type: String, default: "" },
    icon: { type: String, default: "" }, // Cloudinary URL
    basePrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const categoryModel =
  mongoose.models.category || mongoose.model("category", categorySchema);
export default categoryModel;
