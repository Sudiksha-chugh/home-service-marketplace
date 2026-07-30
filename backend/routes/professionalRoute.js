import express from "express";
import {
  registerProfessional,
  loginProfessional,
} from "../controllers/professionalAuthController.js";
import {
  listProfessionals,
  getProfessionalById,
  updateAvailability,
  toggleActive,
  uploadDocuments,
} from "../controllers/professionalController.js";
import authPro from "../middleware/authPro.js";
import upload from "../middleware/upload.js";

const professionalRouter = express.Router();

// Auth routes
professionalRouter.post("/register", registerProfessional);
professionalRouter.post("/login", loginProfessional);

// Public directory routes
professionalRouter.get("/list", listProfessionals);
professionalRouter.get("/:id", getProfessionalById);

// authPro-gated routes
professionalRouter.put("/availability", authPro, updateAvailability);
professionalRouter.put("/active", authPro, toggleActive);
professionalRouter.post("/documents", authPro, upload.single("document"), uploadDocuments);

export default professionalRouter;
