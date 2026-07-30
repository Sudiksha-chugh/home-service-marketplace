import express from "express";
import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingChat,
} from "../controllers/bookingController.js";
import authUser from "../middleware/authUser.js";
import authAny from "../middleware/authAny.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", authUser, createBooking);
bookingRouter.get("/mine", authAny, getMyBookings);
bookingRouter.put("/status", authAny, updateBookingStatus);
bookingRouter.put("/cancel", authAny, cancelBooking);
bookingRouter.get("/:bookingId/chat", authAny, getBookingChat);

export default bookingRouter;
