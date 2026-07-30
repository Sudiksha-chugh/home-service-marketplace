import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "booking", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    senderRole: {
      type: String,
      enum: ["customer", "professional", "admin"],
      required: true,
    },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const chatMessageModel =
  mongoose.models.chatMessage || mongoose.model("chatMessage", chatMessageSchema);

export default chatMessageModel;
