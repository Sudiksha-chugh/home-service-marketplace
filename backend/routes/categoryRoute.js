import express from "express";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import authAdmin from "../middleware/authAdmin.js";

const categoryRouter = express.Router();

// Public route
categoryRouter.get("/list", getCategories);
categoryRouter.get("/", getCategories);

// Admin-gated routes
categoryRouter.post("/add", authAdmin, addCategory);
categoryRouter.post("/", authAdmin, addCategory);
categoryRouter.put("/:id", authAdmin, updateCategory);
categoryRouter.delete("/:id", authAdmin, deleteCategory);

export default categoryRouter;
