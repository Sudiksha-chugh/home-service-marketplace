import express from "express";
import {
  loginAdmin,
  getVerificationQueue,
  updateVerificationStatus,
  getAnalytics,
} from "../controllers/adminController.js";
import authAdmin from "../middleware/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);

// authAdmin-gated endpoints
adminRouter.get("/verification-queue", authAdmin, getVerificationQueue);
adminRouter.put("/verify-pro", authAdmin, updateVerificationStatus);
adminRouter.get("/analytics", authAdmin, getAnalytics);

export default adminRouter;
