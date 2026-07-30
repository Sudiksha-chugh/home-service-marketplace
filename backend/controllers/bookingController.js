import bookingModel from "../models/bookingModel.js";
import professionalModel from "../models/professionalModel.js";
import categoryModel from "../models/categoryModel.js";
import chatMessageModel from "../models/chatMessageModel.js";
import { canTransition } from "../utils/bookingStateMachine.js";

/**
 * POST /api/booking/create
 * authUser-gated: customer creates a new service booking request.
 */
export const createBooking = async (req, res) => {
  try {
    const { professionalId, categoryId, scheduledTime, address, notes, price } = req.body;

    if (!professionalId || !categoryId || !scheduledTime || !address || !address.line1 || price == null) {
      return res.status(400).json({
        success: false,
        message: "professionalId, categoryId, scheduledTime, address (line1), and price are required.",
      });
    }

    const professional = await professionalModel.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional profile not found." });
    }

    if (!professional.isActive) {
      return res.status(400).json({
        success: false,
        message: "Professional is currently not active or accepting new bookings.",
      });
    }

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Service category not found." });
    }

    const booking = await bookingModel.create({
      customer: req.userId,
      professional: professionalId,
      category: categoryId,
      scheduledTime: new Date(scheduledTime),
      address,
      notes: notes || "",
      price: Number(price),
      status: "requested",
      paymentStatus: "pending",
    });

    const populatedBooking = await bookingModel
      .findById(booking._id)
      .populate("customer", "name email phone")
      .populate({
        path: "professional",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("category", "name basePrice icon");

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/booking/mine
 * authAny-gated: returns bookings scoped to the logged-in user's role.
 */
export const getMyBookings = async (req, res) => {
  try {
    let query = {};

    if (req.userRole === "customer") {
      query = { customer: req.userId };
    } else if (req.userRole === "professional") {
      const pro = await professionalModel.findOne({ user: req.userId });
      if (!pro) {
        return res
          .status(404)
          .json({ success: false, message: "Professional profile not found for logged in user." });
      }
      query = { professional: pro._id };
    } else if (req.userRole === "admin") {
      query = {};
    }

    const bookings = await bookingModel
      .find(query)
      .populate("customer", "name email phone")
      .populate({
        path: "professional",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("category", "name basePrice icon")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/booking/status
 * authAny-gated: updates booking status using bookingStateMachine validation.
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({ success: false, message: "bookingId and status are required." });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (req.userRole === "professional") {
      const pro = await professionalModel.findOne({ user: req.userId });
      if (!pro || !booking.professional.equals(pro._id)) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied. Booking not assigned to you." });
      }
    } else if (req.userRole === "customer") {
      if (!booking.customer.equals(req.userId)) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied. Booking does not belong to you." });
      }
    }

    try {
      canTransition(booking.status, status, req.userRole);
    } catch (transitionError) {
      return res.status(400).json({ success: false, message: transitionError.message });
    }

    booking.status = status;
    await booking.save();

    // Emit Socket.io statusUpdate event to room
    const io = req.app.get("io");
    if (io) {
      io.to(booking._id.toString()).emit("statusUpdate", {
        bookingId: booking._id.toString(),
        status: booking.status,
        updatedAt: booking.updatedAt,
      });
    }

    const updatedBooking = await bookingModel
      .findById(booking._id)
      .populate("customer", "name email phone")
      .populate({
        path: "professional",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("category", "name basePrice icon");

    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/booking/cancel
 * authAny-gated: cancels booking, setting status="cancelled", cancelledBy=role, and cancellationReason.
 */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId, cancellationReason } = req.body;

    if (!bookingId || !cancellationReason) {
      return res
        .status(400)
        .json({ success: false, message: "bookingId and cancellationReason are required." });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (req.userRole === "professional") {
      const pro = await professionalModel.findOne({ user: req.userId });
      if (!pro || !booking.professional.equals(pro._id)) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied. Booking not assigned to you." });
      }
    } else if (req.userRole === "customer") {
      if (!booking.customer.equals(req.userId)) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied. Booking does not belong to you." });
      }
    }

    try {
      canTransition(booking.status, "cancelled", req.userRole);
    } catch (transitionError) {
      return res.status(400).json({ success: false, message: transitionError.message });
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.userRole;
    booking.cancellationReason = cancellationReason;
    await booking.save();

    // Emit Socket.io statusUpdate event to room
    const io = req.app.get("io");
    if (io) {
      io.to(booking._id.toString()).emit("statusUpdate", {
        bookingId: booking._id.toString(),
        status: booking.status,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
        updatedAt: booking.updatedAt,
      });
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/booking/:bookingId/chat
 * authAny-gated: fetch chat history for a booking
 */
export const getBookingChat = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const messages = await chatMessageModel
      .find({ booking: bookingId })
      .populate("sender", "name email role")
      .sort({ timestamp: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error("getBookingChat error:", error);
    res.status(500).json({ success: false, message: "Server error fetching chat history." });
  }
};
