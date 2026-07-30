import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "booking", required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    professional: { type: mongoose.Schema.Types.ObjectId, ref: "professional", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
