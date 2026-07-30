import express from "express";
import { createReview, getProfessionalReviews } from "../controllers/reviewController.js";
import authUser from "../middleware/authUser.js";

const reviewRouter = express.Router();

reviewRouter.post("/create", authUser, createReview);
reviewRouter.get("/professional/:professionalId", getProfessionalReviews);

export default reviewRouter;
