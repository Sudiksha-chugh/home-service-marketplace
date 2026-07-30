import mongoose from "mongoose";

const professionalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "category" }],
    bio: { type: String, default: "" },
    hourlyRate: { type: Number, required: true },
    profileImage: { type: String, default: "" },
    documents: [{ type: String }], // Cloudinary URLs for ID / certification proof
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Weekly recurring availability, e.g. { mon: ["09:00-12:00","14:00-18:00"], ... }
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    serviceArea: {
      lat: { type: Number },
      lng: { type: Number },
      radiusKm: { type: Number, default: 10 },
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }, // toggled by pro to accept/pause new jobs
  },
  { timestamps: true, minimize: false }
);

const professionalModel =
  mongoose.models.professional ||
  mongoose.model("professional", professionalSchema);
export default professionalModel;
