import express from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController.js";
import authUser from "../middleware/authUser.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", authUser, createPaymentOrder);
paymentRouter.post("/verify", authUser, verifyPayment);

export default paymentRouter;
