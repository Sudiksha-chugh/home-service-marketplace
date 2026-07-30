import reviewModel from "../models/reviewModel.js";
import bookingModel from "../models/bookingModel.js";
import professionalModel from "../models/professionalModel.js";

/**
 * POST /api/review/create
 * authUser-gated: customer leaves a review for a completed booking.
 */
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating == null) {
      return res.status(400).json({ success: false, message: "bookingId and rating (1-5) are required." });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // Verify ownership
    if (!booking.customer.equals(req.userId)) {
      return res.status(403).json({ success: false, message: "Access denied. Booking does not belong to you." });
    }

    // Verify status is completed
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Reviews can only be submitted for completed bookings." });
    }

    // Check if review already exists for this booking
    const existingReview = await reviewModel.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(409).json({ success: false, message: "Review already submitted for this booking." });
    }

    // Create review
    const review = await reviewModel.create({
      booking: booking._id,
      customer: req.userId,
      professional: booking.professional,
      rating: numRating,
      comment: comment || "",
    });

    // Recalculate professional rating and ratingCount
    const allReviews = await reviewModel.find({ professional: booking.professional });
    const ratingCount = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

    await professionalModel.findByIdAndUpdate(booking.professional, {
      rating: Math.round(avgRating * 10) / 10,
      ratingCount,
    });

    const populatedReview = await reviewModel
      .findById(review._id)
      .populate("customer", "name email");

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: "Server error creating review." });
  }
};

/**
 * GET /api/review/professional/:professionalId
 * Public: fetch all reviews for a professional.
 */
export const getProfessionalReviews = async (req, res) => {
  try {
    const { professionalId } = req.params;

    const reviews = await reviewModel
      .find({ professional: professionalId })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error("getProfessionalReviews error:", error);
    res.status(500).json({ success: false, message: "Server error fetching reviews." });
  }
};
