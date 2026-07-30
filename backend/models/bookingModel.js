import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    professional: { type: mongoose.Schema.Types.ObjectId, ref: "professional", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    scheduledTime: { type: Date, required: true },
    address: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: { type: String, default: "" },
    // Requested -> Accepted -> InProgress -> Completed
    // Requested -> Rejected
    // Requested/Accepted -> Cancelled
    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },
    price: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    paymentId: { type: String, default: "" }, // ref to payment doc / razorpay order id
    cancelledBy: { type: String, enum: ["customer", "professional", "admin", ""], default: "" },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true, minimize: false }
);

const bookingModel =
  mongoose.models.booking || mongoose.model("booking", bookingSchema);
export default bookingModel;
