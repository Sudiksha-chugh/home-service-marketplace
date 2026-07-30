import categoryModel from "../models/categoryModel.js";

/**
 * GET /api/category/list
 * Public: fetch all active categories.
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/category/add
 * Admin only: create a new service category.
 */
export const addCategory = async (req, res) => {
  try {
    const { name, description, icon, basePrice } = req.body;

    if (!name || basePrice == null) {
      return res.status(400).json({ success: false, message: "Category name and basePrice are required." });
    }

    const existing = await categoryModel.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, message: "Category already exists." });
    }

    const category = await categoryModel.create({
      name,
      description: description || "",
      icon: icon || "",
      basePrice: Number(basePrice),
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("addCategory error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PUT /api/category/:id
 * Admin only: update an existing category.
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, basePrice, isActive } = req.body;

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (basePrice !== undefined) category.basePrice = Number(basePrice);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * DELETE /api/category/:id
 * Admin only: delete or deactivate a category.
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
