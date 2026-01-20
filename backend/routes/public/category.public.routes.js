import express from "express";
import { Category } from "../../models/category.master.js";

const router = express.Router();

// Get all active categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ created_at: -1 })
            .select("name description");

        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get category by ID
router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
