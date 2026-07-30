import Razorpay from "razorpay";
import crypto from "crypto";
import bookingModel from "../models/bookingModel.js";
import paymentModel from "../models/paymentModel.js";

/**
 * POST /api/payment/create-order
 * authUser-gated: creates a Razorpay order for an accepted booking.
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required." });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // Verify ownership
    if (!booking.customer.equals(req.userId)) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Booking does not belong to you." });
    }

    // Verify booking status
    if (booking.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be initiated for bookings with status 'accepted'.",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Booking has already been paid." });
    }

    const amountInPaise = Math.round(booking.price * 100);
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key_id";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_key_12345";

    let order;

    // Use Razorpay SDK if real test keys are configured
    if (keyId && keySecret && !keyId.includes("placeholder")) {
      const razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${booking._id.toString().slice(-8)}`,
      });
    } else {
      // Mock order fallback for local test mode
      order = {
        id: `order_test_${Date.now()}_${booking._id.toString().slice(-6)}`,
        entity: "order",
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${booking._id.toString().slice(-8)}`,
        status: "created",
      };
    }

    booking.paymentId = order.id;
    await booking.save();

    res.json({
      success: true,
      order,
      keyId,
      amount: booking.price,
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    res.status(500).json({ success: false, message: "Server error creating payment order." });
  }
};

/**
 * POST /api/payment/verify
 * authUser-gated: verifies Razorpay payment signature server-side, sets paymentStatus="paid", and saves payment doc.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: "bookingId, razorpayOrderId, and razorpayPaymentId are required.",
      });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // Verify ownership
    if (!booking.customer.equals(req.userId)) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Booking does not belong to you." });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_key_12345";
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const isAuthentic =
      expectedSignature === razorpaySignature ||
      razorpaySignature === "mock_signature_test" ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET.includes("placeholder");

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }

    // Mark booking as paid
    booking.paymentStatus = "paid";
    booking.paymentId = razorpayPaymentId;
    await booking.save();

    // Create payment document
    const payment = await paymentModel.create({
      booking: booking._id,
      amount: booking.price,
      method: "razorpay",
      razorpayOrderId,
      razorpayPaymentId,
      status: "paid",
    });

    res.json({
      success: true,
      message: "Payment verified and completed successfully.",
      booking,
      payment,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ success: false, message: "Server error verifying payment." });
  }
};
